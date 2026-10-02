import { CalendarDotsIcon, CaretDownIcon } from '@phosphor-icons/react'
import type { DayBudget, TripBudget } from '../../domain/budget'
import type { Expense, Trip } from '../../domain/types'
import { cx } from '../../lib/cx'
import { formatDate } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { Card, ProgressBar, toneVars } from '../ui'
import { plural } from './copy'
import styles from './DayTimeline.module.css'
import { ExpenseRow } from './ExpenseRow'

export interface DayTimelineProps {
  trip: Trip
  budget: TripBudget
  onSelectExpense: (expense: Expense) => void
}

/** Today first, then past days (newest first), then a collapsed preview of days to come. */
export function DayTimeline({ trip, budget, onSelectExpense }: DayTimelineProps) {
  const started = budget.days.filter((d) => d.status !== 'future').reverse()
  const future = budget.days.filter((d) => d.status === 'future')

  return (
    <div className={styles.list}>
      {started.map((day) => (
        <DayCard key={day.date} day={day} trip={trip} onSelectExpense={onSelectExpense} />
      ))}

      {future.length > 0 && (
        <Card padding="none">
          <details className={styles.upcoming} open={budget.phase === 'upcoming'}>
            <summary>
              <CalendarDotsIcon size={22} weight="duotone" aria-hidden />
              {budget.phase === 'upcoming' ? 'Your days' : `${plural(future.length, 'day')} to go`}
              <CaretDownIcon className={styles.caret} size={18} weight="bold" aria-hidden />
            </summary>
            <div className={styles.upcomingList}>
              {future.map((day) => (
                <div key={day.date} className={styles.upcomingRow}>
                  <span>
                    Day {day.dayNumber} · {formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span>{formatMoney(day.allowance, trip.currency)}</span>
                </div>
              ))}
            </div>
          </details>
        </Card>
      )}
    </div>
  )
}

function DayCard({ day, trip, onSelectExpense }: { day: DayBudget; trip: Trip; onSelectExpense: (e: Expense) => void }) {
  const money = (cents: number) => formatMoney(cents, trip.currency)
  const isToday = day.status === 'today'
  const date = formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <Card className={styles.day} style={toneVars(isToday ? trip.tone : 'violet')}>
      <div className={styles.dayHead}>
        <span className={styles.dayNum}>
          <small>Day</small>
          {day.dayNumber}
        </span>
        <span className={styles.dayTitle}>
          <strong>{isToday ? 'Today' : date}</strong>
          <span>
            {isToday ? `${date} · ` : ''}
            {plural(day.expenses.length, 'bill')}
          </span>
        </span>
        <span className={styles.dayMoney}>
          {money(day.spent)} / {money(day.allowance)}
          <strong className={cx(day.balance < 0 && styles.negative)}>
            {day.balance >= 0 ? `${money(day.balance)} ${isToday ? 'left' : 'saved'}` : `${money(-day.balance)} over`}
          </strong>
        </span>
      </div>

      <ProgressBar value={day.allowance > 0 ? day.spent / day.allowance : day.spent > 0 ? 2 : 0} tone={isToday ? trip.tone : 'violet'} label={`Day ${day.dayNumber} spending`} />

      {day.expenses.length > 0 ? (
        <div className={styles.expenses}>
          {day.expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} trip={trip} onClick={() => onSelectExpense(expense)} />
          ))}
        </div>
      ) : (
        <p className={styles.noBills}>{isToday ? 'No bills yet today' : 'No spending — nice!'}</p>
      )}
    </Card>
  )
}
