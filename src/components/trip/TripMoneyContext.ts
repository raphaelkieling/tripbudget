import { createContext, useContext } from 'react'
import type { ExchangeRate } from '../../lib/exchange'
import type { Cents, CurrencyCode } from '../../lib/money'

export interface TripMoney {
  tripCurrency: CurrencyCode
  /** Set only when there's a main currency different from the trip's and a rate for it. */
  homeCurrency?: CurrencyCode
  rate?: ExchangeRate
  showHome: boolean
  setShowHome: (showHome: boolean) => void
  /** Formats trip-currency cents in the currency being displayed. */
  money: (cents: Cents) => string
  /** The same amount in the other currency, when a conversion is available. */
  alt: (cents: Cents) => string | undefined
  /** Trip-currency cents in the main currency, when a conversion is available. */
  toHome: (cents: Cents) => string | undefined
}

export const TripMoneyContext = createContext<TripMoney | null>(null)

export function useTripMoney(): TripMoney {
  const value = useContext(TripMoneyContext)
  if (!value) throw new Error('useTripMoney must be used inside <TripMoneyProvider>')
  return value
}
