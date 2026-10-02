import type { ISODate } from '../lib/date'
import type { Cents } from '../lib/money'
import { computeTripBudget } from './budget'
import type { Expense, Trip } from './types'

export type PurchaseVerdict = 'easy' | 'manageable' | 'big-hit' | 'over-budget'

export interface PurchaseSimulation {
  amount: Cents
  verdict: PurchaseVerdict
  /** How many days share the purchase (today included). 0 once the trip is over. */
  daysAffected: number
  /** How much less each of those days gets. */
  perDayCut: Cents
  /** perDayCut as a share of the daily budget, 0..1+. */
  dailyDrop: number
  /** Trip budget left, before and after buying. */
  remainingBefore: Cents
  remainingAfter: Cents
  /** What's left for today (active trips only). */
  todayLeftBefore?: Cents
  todayLeftAfter?: Cents
  /**
   * Daily budget for the days after today, assuming today's budget gets used
   * as planned (before the trip: the even daily split).
   */
  dailyBefore: Cents
  dailyAfter: Cents
}

/** Losing up to this share of the daily budget is "easy". */
export const EASY_DROP = 0.05
/** Losing up to this share of the daily budget is "manageable". */
export const MANAGEABLE_DROP = 0.15

const split = (value: Cents, days: number): Cents => (days > 0 ? Math.trunc(value / days) || 0 : value)

/**
 * "What if I buy this?" without saving anything.
 *
 * The purchase is diluted over every remaining day, today included, exactly
 * like a spread bill would be: each day gets amount / daysLeft less.
 * Before the trip it is diluted over all of its days.
 */
export function simulatePurchase(trip: Trip, expenses: Expense[], today: ISODate, amount: Cents): PurchaseSimulation {
  const before = computeTripBudget(trip, expenses, today)
  const remainingBefore = before.remaining
  const remainingAfter = remainingBefore - amount

  let daysAffected: number
  let perDayCut: Cents
  let referenceDaily: Cents
  let dailyBefore: Cents
  let dailyAfter: Cents
  let todayLeftBefore: Cents | undefined
  let todayLeftAfter: Cents | undefined

  if (before.phase === 'active' && before.today) {
    const purchase: Expense = {
      id: 'simulation',
      tripId: trip.id,
      amount,
      description: '',
      category: 'shopping',
      date: today,
      spread: true,
      createdAt: new Date().toISOString(),
    }
    const after = computeTripBudget(trip, [...expenses, purchase], today)
    const nextDays = before.daysLeft - 1

    daysAffected = before.daysLeft
    perDayCut = before.today.allowance - after.today!.allowance
    referenceDaily = before.today.allowance
    todayLeftBefore = before.today.balance
    todayLeftAfter = after.today!.balance
    dailyBefore = nextDays > 0 ? split(remainingBefore - Math.max(todayLeftBefore, 0), nextDays) : todayLeftBefore
    dailyAfter = nextDays > 0 ? split(remainingAfter - Math.max(todayLeftAfter, 0), nextDays) : todayLeftAfter
  } else {
    daysAffected = before.phase === 'finished' ? 0 : before.totalDays
    dailyBefore = split(remainingBefore, daysAffected)
    dailyAfter = split(remainingAfter, daysAffected)
    perDayCut = dailyBefore - dailyAfter
    referenceDaily = dailyBefore
  }

  const dailyDrop = referenceDaily > 0 ? perDayCut / referenceDaily : 1

  let verdict: PurchaseVerdict
  if (remainingAfter < 0) verdict = 'over-budget'
  else if (dailyDrop <= EASY_DROP) verdict = 'easy'
  else if (dailyDrop <= MANAGEABLE_DROP) verdict = 'manageable'
  else verdict = 'big-hit'

  return {
    amount,
    verdict,
    daysAffected,
    perDayCut,
    dailyDrop,
    remainingBefore,
    remainingAfter,
    todayLeftBefore,
    todayLeftAfter,
    dailyBefore,
    dailyAfter,
  }
}
