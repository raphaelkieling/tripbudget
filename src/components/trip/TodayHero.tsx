import { ConfettiIcon, HourglassIcon, WarningIcon } from '@phosphor-icons/react'
import { TRIP_ICONS } from '../../domain/appearance'
import type { TripBudget } from '../../domain/budget'
import type { Trip } from '../../domain/types'
import { useI18n } from '../../i18n'
import { cx } from '../../lib/cx'
import { diffDays, type ISODate } from '../../lib/date'
import { Badge, Card, ProgressRing, toneVars } from '../ui'
import { phaseLabel } from './copy'
import styles from './TodayHero.module.css'
import { useTripMoney } from './TripMoneyContext'

export interface TodayHeroProps {
  trip: Trip
  budget: TripBudget
  today: ISODate
}

export function TodayHero({ trip, budget, today }: TodayHeroProps) {
  const { t } = useI18n()
  const { money, alt } = useTripMoney()
  // The headline amount, plus the same value in the other currency when converting.
  const amount = (cents: number) => (
    <>
      <span className={styles.amount}>{money(cents)}</span>
      {alt(cents) && <span className={styles.converted}>≈ {alt(cents)}</span>}
    </>
  )
  const daysUntilStart = diffDays(today, trip.startDate)
  const tone = toneVars(trip.tone)
  const badge = <Badge onHero>{phaseLabel(t, budget, daysUntilStart)}</Badge>

  if (budget.phase === 'upcoming') {
    return (
      <Card variant="hero" padding="lg" className={styles.hero} style={tone}>
        <div className={styles.top}>
          <HourglassIcon size={32} weight="duotone" aria-hidden />
          {badge}
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.caption}>{t.hero.willSpend}</span>
          {amount(budget.baseDaily)}
          <span className={styles.sub}>{t.hero.perDayFor(budget.totalDays)}</span>
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
          <span className={styles.caption}>{saved ? t.hero.cameBackWith : t.hero.wentOverBy}</span>
          {amount(Math.abs(budget.remaining))}
          <span className={styles.sub}>{t.hero.spentOf(money(budget.spent), money(budget.budget))}</span>
        </div>
      </Card>
    )
  }

  const { today: day } = budget
  const TripIcon = TRIP_ICONS[trip.icon]
  const over = day.balance < 0
  const usedRatio = day.allowance > 0 ? day.spent / day.allowance : 1

  return (
    <Card variant="hero" padding="lg" className={styles.hero} style={tone}>
      <div className={cx(styles.top, styles.desktopOnly)}>
        <TripIcon size={32} weight="duotone" aria-hidden />
        {badge}
      </div>

      <div className={styles.main}>
        <ProgressRing value={usedRatio} size={112} stroke={12} color="#fff" trackColor="rgb(255 255 255 / 0.25)" label={t.hero.ringLabel}>
          <span className={styles.ringLabel}>{Math.round(Math.min(usedRatio, 9.99) * 100)}%</span>
          <span className={styles.ringCaption}>{t.hero.used}</span>
        </ProgressRing>
        <div className={styles.amountBlock}>
          <span className={styles.caption}>{over ? t.hero.overToday : t.hero.canSpendToday}</span>
          {amount(Math.abs(day.balance))}
          <span className={styles.sub}>{t.hero.spentOfToday(money(day.spent), money(day.allowance))}</span>
        </div>
      </div>

      {budget.nextDaily !== undefined && budget.nextDaily < 0 && (
        <div className={styles.footer}>
          <WarningIcon size={22} weight="fill" aria-hidden />
          <span>{t.hero.budgetGone(money(-budget.remaining))}</span>
        </div>
      )}
    </Card>
  )
}
