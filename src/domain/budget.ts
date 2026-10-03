import { clampDate, diffDays, eachDay, type ISODate } from '../lib/date'
import type { Cents } from '../lib/money'
import type { Expense, Trip } from './types'

export type TripPhase = 'upcoming' | 'active' | 'finished'
export type DayStatus = 'past' | 'today' | 'future'

export interface DayBudget {
  date: ISODate
  /** 1-based day number within the trip. */
  dayNumber: number
  status: DayStatus
  /** What you were / are / will be allowed to spend that day. Can be negative. */
  allowance: Cents
  /** Regular bills of the day. Spread bills are not included: they lower the allowance instead. */
  spent: Cents
  /** allowance - spent. Positive rolls over to later days, negative is taken from them. */
  balance: Cents
  /** All bills dated that day, including spread ones. */
  expenses: Expense[]
}

export interface TripBudget {
  phase: TripPhase
  totalDays: number
  /** Days still to go including today (equals totalDays before the trip). */
  daysLeft: number
  /** The trip budget plus any money that came back in through balance adjustments. */
  budget: Cents
  /** Everything that went out: bills and adjustments for money that left untracked. */
  spent: Cents
  /** budget - spent. Negative means the whole trip is over budget. */
  remaining: Cents
  /** Even split with no spending: budget / totalDays. */
  baseDaily: Cents
  days: DayBudget[]
  /** Present only while the trip is active. */
  today?: DayBudget
  /**
   * What each remaining day gets if you spend nothing more today.
   * Undefined on the last day or after the trip.
   */
  nextDaily?: Cents
  /**
   * What each remaining day gets if you use all of today's allowance (or what
   * you already spent, if that's more). Stays put while you spend within
   * today's budget. Undefined on the last day or after the trip.
   */
  expectedDaily?: Cents
}

// `|| 0` normalises -0 so it never renders as "-$0.00".
const split = (amount: Cents, days: number): Cents => (days > 0 ? Math.trunc(amount / days) || 0 : 0)

/**
 * Rolling daily budget.
 *
 * Up to today, a day's allowance is whatever is left of the budget before
 * that day, split evenly across the days that remain (that day included):
 *
 *   allowance(d) = (budget - spentBefore(d) - spreadSince(d)) / daysFrom(d)
 *
 * So money left over at the end of a day is spread across the following days,
 * and overspending is taken from them. Days after today share what is left
 * equally, projected two ways: `nextDaily` assumes no more spending today,
 * `expectedDaily` assumes today's allowance gets fully used.
 *
 * Spread bills (big purchases) don't hit their day: from their date on they
 * reduce the pool, so every remaining day pays an equal share.
 *
 * Expenses dated outside the trip are counted on its first/last day.
 */
export function computeTripBudget(trip: Trip, expenses: Expense[], today: ISODate): TripBudget {
  const dates = eachDay(trip.startDate, trip.endDate)
  const totalDays = dates.length

  const byDay = new Map<ISODate, Expense[]>()
  for (const expense of expenses) {
    const date = clampDate(expense.date, trip.startDate, trip.endDate)
    const list = byDay.get(date)
    if (list) list.push(expense)
    else byDay.set(date, [expense])
  }
  const sum = (list: Expense[]) => list.reduce((total, e) => total + e.amount, 0)
  const spreadTotal = sum(expenses.filter((e) => e.spread))

  const futureDays = dates.filter((date) => date > today).length
  let futureDaily: Cents | undefined
  let spentBefore = 0
  let spreadSoFar = 0

  const days = dates.map((date, index): DayBudget => {
    const status: DayStatus = date < today ? 'past' : date === today ? 'today' : 'future'
    const dayExpenses = (byDay.get(date) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const spent = sum(dayExpenses.filter((e) => !e.spread))
    spreadSoFar += sum(dayExpenses.filter((e) => e.spread))

    let allowance: Cents
    if (status === 'future') {
      futureDaily ??= split(trip.budget - spentBefore - spreadTotal, futureDays)
      allowance = futureDaily
    } else {
      allowance = split(trip.budget - spentBefore - spreadSoFar, totalDays - index)
    }
    spentBefore += spent

    return { date, dayNumber: index + 1, status, allowance, spent, balance: allowance - spent, expenses: dayExpenses }
  })

  // Adjustments for money that came back (negative amounts) raise the budget
  // rather than lowering what was spent.
  const moneyIn = -sum(expenses.filter((e) => e.amount < 0))
  const netSpent = spentBefore + spreadTotal
  const phase: TripPhase = today < trip.startDate ? 'upcoming' : today > trip.endDate ? 'finished' : 'active'
  const daysLeft =
    phase === 'upcoming' ? totalDays : phase === 'finished' ? 0 : diffDays(today, trip.endDate) + 1
  const todayBudget = phase === 'active' ? days.find((d) => d.status === 'today') : undefined

  return {
    phase,
    totalDays,
    daysLeft,
    budget: trip.budget + moneyIn,
    spent: netSpent + moneyIn,
    remaining: trip.budget - netSpent,
    baseDaily: split(trip.budget, totalDays),
    days,
    today: todayBudget,
    nextDaily: todayBudget ? futureDaily : undefined,
    expectedDaily:
      todayBudget && futureDays > 0
        ? split(trip.budget - netSpent - Math.max(todayBudget.balance, 0), futureDays)
        : undefined,
  }
}
