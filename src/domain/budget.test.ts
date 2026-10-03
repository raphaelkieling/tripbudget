import { describe, expect, it } from 'vitest'
import { computeTripBudget } from './budget'
import type { Expense, Trip } from './types'

const trip: Trip = {
  id: 't1',
  name: 'Lisbon',
  startDate: '2026-05-01',
  endDate: '2026-05-05', // 5 days
  budget: 50_000, // 500.00 → 100.00/day
  currency: 'EUR',
  icon: 'city',
  tone: 'violet',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

let seq = 0
const bill = (date: string, amount: number, spread = false): Expense => ({
  id: `e${++seq}`,
  tripId: 't1',
  amount,
  description: '',
  category: 'food',
  date,
  spread,
  createdAt: `2026-01-01T00:00:${String(seq).padStart(2, '0')}Z`,
})

describe('computeTripBudget', () => {
  it('splits the budget evenly before the trip starts', () => {
    const b = computeTripBudget(trip, [], '2026-04-20')
    expect(b.phase).toBe('upcoming')
    expect(b.totalDays).toBe(5)
    expect(b.daysLeft).toBe(5)
    expect(b.baseDaily).toBe(10_000)
    expect(b.today).toBeUndefined()
    expect(b.days.every((d) => d.allowance === 10_000)).toBe(true)
  })

  it('subtracts bills from today', () => {
    const b = computeTripBudget(trip, [bill('2026-05-01', 3_000)], '2026-05-01')
    expect(b.phase).toBe('active')
    expect(b.today?.allowance).toBe(10_000)
    expect(b.today?.spent).toBe(3_000)
    expect(b.today?.balance).toBe(7_000)
    // If nothing else is spent today, the 70 left is spread over the 4 remaining days.
    expect(b.nextDaily).toBe(11_750)
    // Using the rest of today's 100 keeps the next days at 100.
    expect(b.expectedDaily).toBe(10_000)
  })

  it('projects the same for the next days once today is over budget', () => {
    const b = computeTripBudget(trip, [bill('2026-05-01', 14_000)], '2026-05-01')
    // 40 over today: both projections take it from the 4 remaining days.
    expect(b.nextDaily).toBe(9_000)
    expect(b.expectedDaily).toBe(9_000)
  })

  it('applies balance adjustments like spread bills, in both directions', () => {
    const adjust = (amount: number): Expense => ({ ...bill('2026-05-02', amount, true), adjustment: true })
    // 500 over 5 days; on day 2 the real balance is 80 lower, then 40 higher.
    const lower = computeTripBudget(trip, [adjust(8_000)], '2026-05-02')
    expect(lower.remaining).toBe(42_000)
    expect(lower.today?.allowance).toBe(10_500) // (500 − 80) / 4
    const higher = computeTripBudget(trip, [adjust(-4_000)], '2026-05-02')
    expect(higher.remaining).toBe(54_000)
    expect(higher.today?.allowance).toBe(13_500) // (500 + 40) / 4
  })

  it('has no projection for the next days on the last day', () => {
    const b = computeTripBudget(trip, [], '2026-05-05')
    expect(b.nextDaily).toBeUndefined()
    expect(b.expectedDaily).toBeUndefined()
  })

  it('spreads leftover money across the following days', () => {
    const b = computeTripBudget(trip, [bill('2026-05-01', 2_000)], '2026-05-02')
    // 480 left over 4 days
    expect(b.today?.allowance).toBe(12_000)
    expect(b.days[0].status).toBe('past')
    expect(b.days[0].balance).toBe(8_000)
  })

  it('takes overspending from the following days', () => {
    const b = computeTripBudget(trip, [bill('2026-05-01', 18_000)], '2026-05-02')
    // 320 left over 4 days
    expect(b.today?.allowance).toBe(8_000)
    expect(b.days[0].balance).toBe(-8_000)
    expect(b.remaining).toBe(32_000)
  })

  it('goes negative when the whole budget is blown', () => {
    const b = computeTripBudget(trip, [bill('2026-05-01', 60_000)], '2026-05-03')
    expect(b.remaining).toBe(-10_000)
    expect(b.today!.allowance).toBeLessThan(0)
  })

  it('reports a finished trip', () => {
    const b = computeTripBudget(trip, [bill('2026-05-02', 1_000), bill('2026-05-04', 2_500)], '2026-06-01')
    expect(b.phase).toBe('finished')
    expect(b.daysLeft).toBe(0)
    expect(b.spent).toBe(3_500)
    expect(b.remaining).toBe(46_500)
    expect(b.nextDaily).toBeUndefined()
  })

  it('counts bills outside the trip dates on the first/last day', () => {
    const b = computeTripBudget(trip, [bill('2026-04-10', 1_000), bill('2026-07-01', 500)], '2026-06-01')
    expect(b.days[0].spent).toBe(1_000)
    expect(b.days[4].spent).toBe(500)
  })

  it('has no next-day projection on the last day', () => {
    const b = computeTripBudget(trip, [], '2026-05-05')
    expect(b.daysLeft).toBe(1)
    expect(b.today?.allowance).toBe(50_000)
    expect(b.nextDaily).toBeUndefined()
  })

  it('splits a spread bill equally over the remaining days', () => {
    // 200 spread from day 1 → each of the 5 days loses 40.
    const b = computeTripBudget(trip, [bill('2026-05-01', 20_000, true)], '2026-05-01')
    expect(b.today?.allowance).toBe(6_000)
    expect(b.today?.spent).toBe(0)
    expect(b.today?.balance).toBe(6_000)
    expect(b.today?.expenses).toHaveLength(1)
    expect(b.spent).toBe(20_000)
    expect(b.remaining).toBe(30_000)
  })

  it('keeps rolling over leftovers on top of a spread bill', () => {
    const b = computeTripBudget(trip, [bill('2026-05-01', 20_000, true), bill('2026-05-01', 2_000)], '2026-05-02')
    // Day 1: 60 allowance, spent 20 → 40 left rolls over: (500 - 20 - 200) / 4 = 70
    expect(b.days[0].balance).toBe(4_000)
    expect(b.today?.allowance).toBe(7_000)
  })

  it('only affects days from the spread bill date on', () => {
    const b = computeTripBudget(trip, [bill('2026-05-03', 30_000, true)], '2026-05-03')
    // Days before the purchase are untouched (unspent day 1 rolls into day 2).
    expect(b.days[0].allowance).toBe(10_000)
    expect(b.days[1].allowance).toBe(12_500)
    // (500 - 300) over the 3 days left
    expect(b.today?.allowance).toBe(6_666)
  })
})
