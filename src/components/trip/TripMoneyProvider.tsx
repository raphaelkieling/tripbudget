import type { ReactNode } from 'react'
import { convert, useExchangeRate, useHomeCurrency } from '../../lib/exchange'
import { formatMoney, type Cents, type CurrencyCode } from '../../lib/money'
import { createStoredValue } from '../../lib/storedValue'
import { TripMoneyContext, type TripMoney } from './TripMoneyContext'

type DisplayCurrency = 'trip' | 'home'

/** Whether trip pages show amounts in the trip's currency or the main one. Remembered across trips. */
const displayCurrency = createStoredValue<DisplayCurrency>(
  'tripbudget-display-currency',
  (raw) => (raw === 'trip' || raw === 'home' ? raw : null),
  'trip',
)

export function TripMoneyProvider({ currency, children }: { currency: CurrencyCode; children: ReactNode }) {
  const [home] = useHomeCurrency()
  const [display, setDisplay] = displayCurrency.use()
  const homeCurrency = home === 'none' ? undefined : home
  const rate = useExchangeRate(currency, homeCurrency)

  const inTrip = (cents: Cents) => formatMoney(cents, currency)
  const toHome = (cents: Cents) => (rate && homeCurrency ? formatMoney(convert(cents, rate.rate), homeCurrency) : undefined)
  const showHome = display === 'home' && toHome(0) !== undefined

  const value: TripMoney = {
    tripCurrency: currency,
    homeCurrency: rate ? homeCurrency : undefined,
    rate,
    showHome,
    setShowHome: (next) => setDisplay(next ? 'home' : 'trip'),
    money: (cents) => (showHome ? toHome(cents)! : inTrip(cents)),
    alt: (cents) => (showHome ? inTrip(cents) : toHome(cents)),
    toHome,
  }
  return <TripMoneyContext.Provider value={value}>{children}</TripMoneyContext.Provider>
}
