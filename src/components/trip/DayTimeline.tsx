import { CalendarDotsIcon, CaretDownIcon } from '@phosphor-icons/react'
import type { DayBudget, TripBudget } from '../../domain/budget'
import type { Expense, Trip } from '../../domain/types'
import { useI18n } from '../../i18n'
import { cx } from '../../lib/cx'
import { formatDate } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { Card, ProgressBar, toneVars } from '../ui'
import styles from './DayTimeline.module.css'
import { ExpenseRow } from './ExpenseRow'
import { ShiftBadge } from './ShiftBadge'

export interface DayTimelineProps {
  trip: Trip
  budget: TripBudget
  onSelectExpense: (expense: Expense) => void
}

/** Today first, then past days (newest first), then a collapsed preview of days to come. */
export function DayTimeline({ trip, budget, onSelectExpense }: DayTimelineProps) {
  const { t } = useI18n()
  const started = budget.days.filter((d) => d.status !== 'future').reverse()
  const future = budget.days.filter((d) => d.status === 'future')
  const money = (cents: number) => formatMoney(cents, trip.currency)
  // While the trip is active, future days show what they get if today's budget
  // is spent exactly, plus how today's spending so far shifts that.
  const expected = budget.expectedDaily
  const shift = expected !== undefined && budget.nextDaily !== undefined ? budget.nextDaily - expected : 0

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
              {budget.phase === 'upcoming' ? t.timeline.yourDays : t.timeline.daysToGo(future.length)}
              <CaretDownIcon className={styles.caret} size={18} weight="bold" aria-hidden />
            </summary>
            <div className={styles.upcomingList}>
              {expected !== undefined && <p className={styles.upcomingNote}>{t.timeline.expectedNote}</p>}
              {future.map((day) => (
                <div key={day.date} className={styles.upcomingRow}>
                  <span>{t.timeline.dayLine(day.dayNumber, formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' }))}</span>
                  <span className={styles.upcomingMoney}>
                    <strong>{money(expected ?? day.allowance)}</strong>
                    {shift !== 0 && (
                      <>
                        <ShiftBadge amount={shift} currency={trip.currency} />
                        <span>= {money(day.allowance)}</span>
                      </>
                    )}
                  </span>
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
  const { t } = useI18n()
  const money = (cents: number) => formatMoney(cents, trip.currency)
  const isToday = day.status === 'today'
  const date = formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <Card className={styles.day} style={toneVars(isToday ? trip.tone : 'violet')}>
      <div className={styles.dayHead}>
        <span className={styles.dayNum}>
          <small>{t.timeline.day}</small>
          {day.dayNumber}
        </span>
        <span className={styles.dayTitle}>
          <strong>{isToday ? t.timeline.today : date}</strong>
          <span>
            {isToday ? `${date} · ` : ''}
            {t.units.bills(day.expenses.length)}
          </span>
        </span>
        <span className={styles.dayMoney}>
          {money(day.spent)} / {money(day.allowance)}
          <strong className={cx(day.balance < 0 && styles.negative)}>
            {day.balance >= 0 ? (isToday ? t.timeline.left : t.timeline.saved)(money(day.balance)) : t.timeline.over(money(-day.balance))}
          </strong>
        </span>
      </div>

      <ProgressBar value={day.allowance > 0 ? day.spent / day.allowance : day.spent > 0 ? 2 : 0} tone={isToday ? trip.tone : 'violet'} label={t.timeline.daySpending(day.dayNumber)} />

      {day.expenses.length > 0 ? (
        <div className={styles.expenses}>
          {day.expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} trip={trip} onClick={() => onSelectExpense(expense)} />
          ))}
        </div>
      ) : (
        <p className={styles.noBills}>{isToday ? t.timeline.noBillsToday : t.timeline.noSpending}</p>
      )}
    </Card>
  )
}
