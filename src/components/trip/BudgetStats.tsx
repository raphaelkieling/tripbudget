import { CalendarBlankIcon, CaretDownIcon, ChartPieSliceIcon, PiggyBankIcon, ReceiptIcon, WalletIcon } from '@phosphor-icons/react'
import type { TripBudget } from '../../domain/budget'
import { useI18n } from '../../i18n'
import { cx } from '../../lib/cx'
import { Card, ProgressBar, Stat } from '../ui'
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
  const usedRatio = budget.budget > 0 ? budget.spent / budget.budget : 0

  // Collapsed by default so the banner and the days stay in view; "Left" stays visible in the summary.
  return (
    <Card padding="none">
      <details className={styles.details}>
        <summary>
          <ChartPieSliceIcon size={22} weight="duotone" aria-hidden />
          <span className={styles.title}>{t.stats.title}</span>
          <span className={cx(styles.summaryLeft, budget.remaining < 0 && styles.negative)}>
            {t.stats.left} <strong>{money(budget.remaining)}</strong>
          </span>
          <CaretDownIcon className={styles.caret} size={18} weight="bold" aria-hidden />
        </summary>
        <div className={styles.body}>
          <div className={styles.grid}>
            <Stat icon={WalletIcon} tone="accent" label={t.stats.budget} value={money(budget.budget)} />
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
          <div className={styles.usage}>
            <span className={styles.usageLabel}>{t.stats.budgetUsed(Math.round(usedRatio * 100))}</span>
            <ProgressBar value={usedRatio} label={t.stats.budgetUsed(Math.round(usedRatio * 100))} />
          </div>
        </div>
      </details>
    </Card>
  )
}
