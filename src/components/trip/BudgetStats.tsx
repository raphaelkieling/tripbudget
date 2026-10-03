import { CalendarBlankIcon, PiggyBankIcon, ReceiptIcon, WalletIcon } from '@phosphor-icons/react'
import type { TripBudget } from '../../domain/budget'
import { useI18n } from '../../i18n'
import { Card, Stat } from '../ui'
import styles from './BudgetStats.module.css'
import { ShiftBadge } from './ShiftBadge'
import { useTripMoney } from './TripMoneyContext'

export interface BudgetStatsProps {
  budget: TripBudget
  /** When set, "Left" becomes a button to correct the remaining budget. */
  onEditRemaining?: () => void
}

export function BudgetStats({ budget, onEditRemaining }: BudgetStatsProps) {
  const { t } = useI18n()
  const { money } = useTripMoney()
  // Per-day budget for the days after today (before the trip: every day).
  const nextDaily = budget.phase === 'upcoming' ? budget.baseDaily : budget.expectedDaily
  const shift = budget.expectedDaily !== undefined && budget.nextDaily !== undefined ? budget.nextDaily - budget.expectedDaily : 0

  return (
    <Card padding="lg">
      <div className={styles.grid}>
        <Stat icon={WalletIcon} tone="violet" label={t.stats.budget} value={money(budget.budget)} />
        <Stat icon={ReceiptIcon} tone="coral" label={t.stats.spent} value={money(budget.spent)} />
        <Stat
          icon={PiggyBankIcon}
          tone="mint"
          label={t.stats.left}
          value={money(budget.remaining)}
          negative={budget.remaining < 0}
          onEdit={onEditRemaining}
          editLabel={t.stats.editLeft}
        />
        {nextDaily !== undefined ? (
          <Stat
            icon={CalendarBlankIcon}
            tone="sky"
            label={t.stats.nextDays}
            value={
              <>
                {money(nextDaily)}
                <small className={styles.unit}>{t.stats.perDay}</small>
              </>
            }
            negative={nextDaily < 0}
            extra={shift !== 0 && <ShiftBadge amount={shift} />}
          />
        ) : (
          <Stat icon={CalendarBlankIcon} tone="sky" label={t.stats.daysLeft} value={`${budget.daysLeft} / ${budget.totalDays}`} />
        )}
      </div>
    </Card>
  )
}
