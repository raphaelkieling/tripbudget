import { CalendarBlankIcon, PiggyBankIcon, ReceiptIcon, WalletIcon } from '@phosphor-icons/react'
import type { TripBudget } from '../../domain/budget'
import type { Trip } from '../../domain/types'
import { useI18n } from '../../i18n'
import { formatMoney } from '../../lib/money'
import { Card, Stat } from '../ui'
import styles from './BudgetStats.module.css'

export function BudgetStats({ trip, budget }: { trip: Trip; budget: TripBudget }) {
  const { t } = useI18n()
  const money = (cents: number) => formatMoney(cents, trip.currency)
  return (
    <Card padding="lg">
      <div className={styles.grid}>
        <Stat icon={WalletIcon} tone="violet" label={t.stats.budget} value={money(budget.budget)} />
        <Stat icon={ReceiptIcon} tone="coral" label={t.stats.spent} value={money(budget.spent)} />
        <Stat icon={PiggyBankIcon} tone="mint" label={t.stats.left} value={money(budget.remaining)} negative={budget.remaining < 0} />
        <Stat icon={CalendarBlankIcon} tone="sky" label={t.stats.daysLeft} value={`${budget.daysLeft} / ${budget.totalDays}`} />
      </div>
    </Card>
  )
}
