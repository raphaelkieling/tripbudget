import { CATEGORIES } from '../../domain/categories'
import type { Expense, Trip } from '../../domain/types'
import { diffDays } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { IconBubble } from '../ui'
import styles from './ExpenseRow.module.css'

export function ExpenseRow({ expense, trip, onClick }: { expense: Expense; trip: Trip; onClick: () => void }) {
  const category = CATEGORIES[expense.category] ?? CATEGORIES.other
  const time = new Date(expense.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <IconBubble icon={category.icon} tone={category.tone} size="sm" />
      <span className={styles.text}>
        <span className={styles.title}>{expense.description || category.label}</span>
        <span className={styles.meta}>
          {category.label} · {time}
          {expense.spread && <span className={styles.spread}> · Spread over {diffDays(expense.date, trip.endDate) + 1} days</span>}
        </span>
      </span>
      <span className={styles.amount}>−{formatMoney(expense.amount, trip.currency)}</span>
    </button>
  )
}
