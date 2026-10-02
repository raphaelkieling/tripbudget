import { Link } from 'react-router'
import { computeTripBudget } from '../../domain/budget'
import { TRIP_ICONS } from '../../domain/appearance'
import type { Expense, Trip } from '../../domain/types'
import { cx } from '../../lib/cx'
import { diffDays, formatDateRange, type ISODate } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { Badge, IconBubble, ProgressBar, toneVars } from '../ui'
import { phaseLabel } from './copy'
import styles from './TripCard.module.css'

export interface TripCardProps {
  trip: Trip
  expenses: Expense[]
  today: ISODate
}

export function TripCard({ trip, expenses, today }: TripCardProps) {
  const budget = computeTripBudget(trip, expenses, today)
  const money = (cents: number) => formatMoney(cents, trip.currency)
  const daysUntilStart = diffDays(today, trip.startDate)

  return (
    <Link to={`/trips/${trip.id}`} className={styles.card} style={toneVars(trip.tone)}>
      <div className={styles.head}>
        <IconBubble icon={TRIP_ICONS[trip.icon]} tone={trip.tone} size="lg" />
        <div className={styles.titles}>
          <h3 className={styles.name}>{trip.name}</h3>
          <p className={styles.dates}>{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <Badge tone={budget.phase === 'finished' ? 'mint' : trip.tone}>{phaseLabel(budget, daysUntilStart)}</Badge>
      </div>

      <div className={styles.body}>
        {budget.phase === 'active' && budget.today ? (
          <>
            <div className={styles.line}>
              <span>Left for today</span>
              <span className={cx(styles.amount, budget.today.balance < 0 && styles.negative)}>{money(budget.today.balance)}</span>
            </div>
            <ProgressBar
              value={budget.today.allowance > 0 ? budget.today.spent / budget.today.allowance : 1}
              contrast
              label="Spent today"
            />
          </>
        ) : budget.phase === 'upcoming' ? (
          <div className={styles.line}>
            <span>Daily budget</span>
            <span className={styles.amount}>{money(budget.baseDaily)}</span>
          </div>
        ) : (
          <>
            <div className={styles.line}>
              <span>
                Spent {money(budget.spent)} of {money(budget.budget)}
              </span>
              <span className={cx(styles.amount, budget.remaining < 0 && styles.negative)}>
                {budget.remaining >= 0 ? `+${money(budget.remaining)}` : money(budget.remaining)}
              </span>
            </div>
            <ProgressBar value={budget.budget > 0 ? budget.spent / budget.budget : 0} contrast label="Budget used" />
          </>
        )}
      </div>
    </Link>
  )
}
