import { cx } from '../../lib/cx'
import type { Cents } from '../../lib/money'
import styles from './ShiftBadge.module.css'
import { useTripMoney } from './TripMoneyContext'

/** How today's spending so far moves each future day: up (saved) or down (over). Renders nothing at 0. */
export function ShiftBadge({ amount }: { amount: Cents }) {
  const { money } = useTripMoney()
  if (amount === 0) return null
  return (
    <span className={cx(styles.badge, amount < 0 && styles.down)}>
      {amount > 0 ? '+' : '−'}
      {money(Math.abs(amount))}
    </span>
  )
}
