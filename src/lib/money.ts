import { getIntlLocale } from '../i18n/locale'

/**
 * Money is stored as integer minor units (cents) to avoid floating point
 * drift. Every currency uses 2 minor digits internally; formatting takes care
 * of currencies like JPY that display none.
 */
export type Cents = number

export const CURRENCIES = ['USD', 'EUR', 'BRL', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'MXN', 'ARS'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

const formatters = new Map<string, Intl.NumberFormat>()

function formatter(currency: string, compact: boolean) {
  const locale = getIntlLocale()
  const key = `${locale}:${currency}:${compact}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
    })
    formatters.set(key, f)
  }
  return f
}

export function formatMoney(cents: Cents, currency: string, { compact = false } = {}): string {
  return formatter(currency, compact).format(cents / 100)
}

/**
 * Accepts user input like "12", "12.5", "12,50", "1.234,56" or "1,234.56".
 * The last "." or "," is treated as the decimal separator when followed by
 * at most two digits; otherwise separators are thousands separators.
 */
export function parseMoney(input: string): Cents | null {
  const cleaned = input.replace(/[^\d.,]/g, '')
  if (!/\d/.test(cleaned)) return null

  const lastSep = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf(','))
  const decimals = lastSep === -1 ? '' : cleaned.slice(lastSep + 1)
  const hasDecimal = lastSep !== -1 && decimals.length <= 2

  const whole = (hasDecimal ? cleaned.slice(0, lastSep) : cleaned).replace(/[.,]/g, '')
  const fraction = hasDecimal ? decimals.padEnd(2, '0') : '00'
  const value = Number(whole || '0') * 100 + Number(fraction)
  return Number.isFinite(value) ? value : null
}

/** Cents → plain editable string, e.g. 1250 → "12.50". */
export function centsToInput(cents: Cents): string {
  return (cents / 100).toFixed(2)
}

export function guessCurrency(): CurrencyCode {
  const region = (navigator.language.split('-')[1] ?? '').toUpperCase()
  const byRegion: Record<string, CurrencyCode> = {
    BR: 'BRL', GB: 'GBP', JP: 'JPY', CA: 'CAD', AU: 'AUD', CH: 'CHF', MX: 'MXN', AR: 'ARS',
    DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR', IE: 'EUR', AT: 'EUR', BE: 'EUR',
  }
  return byRegion[region] ?? 'USD'
}

export function currencySymbol(currency: string): string {
  return (
    new Intl.NumberFormat(getIntlLocale(), { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? currency
  )
}
