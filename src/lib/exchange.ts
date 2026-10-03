import { useEffect, useState } from 'react'
import { CURRENCIES, type Cents, type CurrencyCode } from './money'
import { createStoredValue } from './storedValue'

/**
 * Exchange rates from the free, keyless currency-api
 * (https://github.com/fawazahmed0/exchange-api), updated daily. The last
 * table per base currency is cached in localStorage so conversions keep
 * working offline.
 */
const SOURCES = [
  (base: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`,
  (base: string) => `https://latest.currency-api.pages.dev/v1/currencies/${base}.json`,
]
const CACHE_PREFIX = 'tripbudget-rates-'
const MAX_AGE_MS = 12 * 60 * 60 * 1000

interface RateTable {
  base: CurrencyCode
  /** Day the rates were published, YYYY-MM-DD. */
  date: string
  fetchedAt: number
  /** Lowercase currency code → units per 1 `base`. */
  rates: Record<string, number>
}

/** "none" means no main currency: nothing gets converted. */
export type HomeCurrency = CurrencyCode | 'none'

const homeCurrency = createStoredValue<HomeCurrency>(
  'tripbudget-home-currency',
  (raw) => (raw === 'none' || CURRENCIES.includes(raw as CurrencyCode) ? (raw as HomeCurrency) : null),
  'none',
)

/** The user's main currency, chosen in Settings. */
export const useHomeCurrency = homeCurrency.use

function readCache(base: CurrencyCode): RateTable | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + base)
    return raw ? (JSON.parse(raw) as RateTable) : null
  } catch {
    return null
  }
}

const inflight = new Map<CurrencyCode, Promise<RateTable>>()

async function fetchRates(base: CurrencyCode): Promise<RateTable> {
  const code = base.toLowerCase()
  let lastError: unknown
  for (const source of SOURCES) {
    try {
      const response = await fetch(source(code))
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = (await response.json()) as { date: string } & Record<string, Record<string, number>>
      const table: RateTable = { base, date: json.date, fetchedAt: Date.now(), rates: json[code] }
      try {
        localStorage.setItem(CACHE_PREFIX + base, JSON.stringify(table))
      } catch {
        // Storage full or unavailable: the rates still work for this session.
      }
      return table
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

function loadRates(base: CurrencyCode): Promise<RateTable> {
  let pending = inflight.get(base)
  if (!pending) {
    pending = fetchRates(base).finally(() => inflight.delete(base))
    inflight.set(base, pending)
  }
  return pending
}

export interface ExchangeRate {
  /** Units of `to` per 1 unit of `from`. */
  rate: number
  /** Day the rate was published, YYYY-MM-DD. */
  date: string
}

/**
 * Rate from `from` to `to`, using the cached table right away and refreshing
 * it in the background when it's stale. Undefined while unknown (first load
 * offline) or when there's nothing to convert.
 */
export function useExchangeRate(from: CurrencyCode, to: CurrencyCode | undefined): ExchangeRate | undefined {
  const [fetched, setFetched] = useState<RateTable | null>(null)
  const active = to !== undefined && to !== from
  const table = fetched?.base === from ? fetched : active ? readCache(from) : null

  useEffect(() => {
    if (!active) return
    const cached = readCache(from)
    if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) return
    let cancelled = false
    loadRates(from).then(
      (result) => !cancelled && setFetched(result),
      () => {
        // Offline or the API is down: keep using the cached table, if any.
      },
    )
    return () => {
      cancelled = true
    }
  }, [from, active])

  const rate = active && table ? table.rates[to.toLowerCase()] : undefined
  return rate ? { rate, date: table!.date } : undefined
}

export function convert(cents: Cents, rate: number): Cents {
  return Math.round(cents * rate) || 0
}
