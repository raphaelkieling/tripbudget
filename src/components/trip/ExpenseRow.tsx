import { CATEGORIES } from '../../domain/categories'
import type { Expense, Trip } from '../../domain/types'
import { getIntlLocale, useI18n } from '../../i18n'
import { diffDays } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { IconBubble } from '../ui'
import styles from './ExpenseRow.module.css'

export function ExpenseRow({ expense, trip, onClick }: { expense: Expense; trip: Trip; onClick: () => void }) {
  const { t } = useI18n()
  const categoryKey = expense.category in CATEGORIES ? expense.category : 'other'
  const category = CATEGORIES[categoryKey]
  const categoryLabel = t.categories[categoryKey]
  const time = new Date(expense.createdAt).toLocaleTimeString(getIntlLocale(), { hour: '2-digit', minute: '2-digit' })
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <IconBubble icon={category.icon} tone={category.tone} size="sm" />
      <span className={styles.text}>
        <span className={styles.title}>{expense.description || categoryLabel}</span>
        <span className={styles.meta}>
          {categoryLabel} · {time}
          {expense.spread && <span className={styles.spread}> · {t.expenseRow.spreadOver(diffDays(expense.date, trip.endDate) + 1)}</span>}
        </span>
      </span>
      <span className={styles.amount}>−{formatMoney(expense.amount, trip.currency)}</span>
    </button>
  )
}
