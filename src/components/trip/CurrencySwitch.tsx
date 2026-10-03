import { getIntlLocale, useI18n } from '../../i18n'
import { cx } from '../../lib/cx'
import { formatDate } from '../../lib/date'
import styles from './CurrencySwitch.module.css'
import { useTripMoney } from './TripMoneyContext'

/** Trip currency ⇄ main currency toggle, with the rate in use. Hidden when there's nothing to convert. */
export function CurrencySwitch() {
  const { t } = useI18n()
  const { tripCurrency, homeCurrency, rate, showHome, setShowHome } = useTripMoney()
  if (!homeCurrency || !rate) return null

  const rateText = new Intl.NumberFormat(getIntlLocale(), { maximumFractionDigits: 4 }).format(rate.rate)
  const options = [
    { code: tripCurrency, home: false },
    { code: homeCurrency, home: true },
  ]

  return (
    <div className={styles.bar}>
      <div className={styles.segmented} role="group" aria-label={t.currency.label}>
        {options.map(({ code, home }) => (
          <button
            key={code}
            type="button"
            className={cx(styles.option, home === showHome && styles.active)}
            aria-pressed={home === showHome}
            onClick={() => setShowHome(home)}
          >
            {code}
          </button>
        ))}
      </div>
      <span className={styles.rate}>{t.currency.rate(tripCurrency, rateText, homeCurrency, formatDate(rate.date))}</span>
    </div>
  )
}
