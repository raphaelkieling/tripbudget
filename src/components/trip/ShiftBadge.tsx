import { cx } from '../../lib/cx'
import { formatMoney, type Cents } from '../../lib/money'
import styles from './ShiftBadge.module.css'

/** How today's spending so far moves each future day: up (saved) or down (over). Renders nothing at 0. */
export function ShiftBadge({ amount, currency }: { amount: Cents; currency: string }) {
  if (amount === 0) return null
  return (
    <span className={cx(styles.badge, amount < 0 && styles.down)}>
      {amount > 0 ? '+' : '−'}
      {formatMoney(Math.abs(amount), currency)}
    </span>
  )
}
