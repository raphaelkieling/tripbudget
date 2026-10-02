import { ConfettiIcon, HourglassIcon, SunHorizonIcon, TrendDownIcon, TrendUpIcon, WarningIcon } from '@phosphor-icons/react'
import type { TripBudget } from '../../domain/budget'
import type { Trip } from '../../domain/types'
import { cx } from '../../lib/cx'
import { diffDays, type ISODate } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { Badge, Card, ProgressRing, toneVars } from '../ui'
import { phaseLabel, plural } from './copy'
import styles from './TodayHero.module.css'

export interface TodayHeroProps {
  trip: Trip
  budget: TripBudget
  today: ISODate
}

export function TodayHero({ trip, budget, today }: TodayHeroProps) {
  const money = (cents: number) => formatMoney(cents, trip.currency)
  const daysUntilStart = diffDays(today, trip.startDate)
  const tone = toneVars(trip.tone)
  const badge = <Badge onHero>{phaseLabel(budget, daysUntilStart)}</Badge>

  if (budget.phase === 'upcoming') {
    return (
      <Card variant="hero" padding="lg" className={styles.hero} style={tone}>
        <div className={styles.top}>
          <HourglassIcon size={32} weight="duotone" aria-hidden />
          {badge}
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.caption}>You&apos;ll be able to spend</span>
          <span className={styles.amount}>{money(budget.baseDaily)}</span>
          <span className={styles.sub}>per day, for {plural(budget.totalDays, 'day')}</span>
        </div>
      </Card>
    )
  }

  if (budget.phase === 'finished' || !budget.today) {
    const saved = budget.remaining >= 0
    return (
      <Card variant="hero" padding="lg" className={styles.hero} style={tone}>
        <div className={styles.top}>
          <ConfettiIcon size={32} weight="duotone" aria-hidden />
          {badge}
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.caption}>{saved ? 'You came back with' : 'You went over by'}</span>
          <span className={styles.amount}>{money(Math.abs(budget.remaining))}</span>
          <span className={styles.sub}>
            Spent {money(budget.spent)} of {money(budget.budget)}
          </span>
        </div>
      </Card>
    )
  }

  const { today: day } = budget
  const over = day.balance < 0
  const usedRatio = day.allowance > 0 ? day.spent / day.allowance : 1

  return (
    <Card variant="hero" padding="lg" className={styles.hero} style={tone}>
      <div className={styles.top}>
        <SunHorizonIcon size={32} weight="duotone" aria-hidden />
        {badge}
      </div>

      <div className={styles.main}>
        <ProgressRing value={usedRatio} size={112} stroke={12} color="#fff" trackColor="rgb(255 255 255 / 0.25)" label="Today's budget used">
          <span className={styles.ringLabel}>{Math.round(Math.min(usedRatio, 9.99) * 100)}%</span>
          <span className={styles.ringCaption}>used</span>
        </ProgressRing>
        <div className={styles.amountBlock}>
          <span className={styles.caption}>{over ? 'Over today by' : 'You can still spend today'}</span>
          <span className={styles.amount}>{money(Math.abs(day.balance))}</span>
          <span className={styles.sub}>
            {money(day.spent)} of {money(day.allowance)} spent
          </span>
        </div>
      </div>

      {budget.nextDaily !== undefined && (
        <div className={cx(styles.footer, budget.nextDaily < 0 && styles.over)}>
          {budget.nextDaily < 0 ? (
            <WarningIcon size={22} weight="fill" aria-hidden />
          ) : over ? (
            <TrendDownIcon size={22} weight="bold" aria-hidden />
          ) : (
            <TrendUpIcon size={22} weight="bold" aria-hidden />
          )}
          <span>
            {budget.nextDaily < 0 ? (
              <>Budget is gone — you&apos;re {money(-budget.remaining)} over for the trip</>
            ) : (
              <>
                If you stop now, the next {plural(budget.daysLeft - 1, 'day')} get <strong>{money(budget.nextDaily)}</strong>/day
              </>
            )}
          </span>
        </div>
      )}
    </Card>
  )
}
