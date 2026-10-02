import { describe, expect, it } from 'vitest'
import { simulatePurchase } from './simulation'
import type { Expense, Trip } from './types'

const trip: Trip = {
  id: 't1',
  name: 'Lisbon',
  startDate: '2026-05-01',
  endDate: '2026-05-05', // 5 days, 100.00/day
  budget: 50_000,
  currency: 'EUR',
  icon: 'city',
  tone: 'violet',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const bill = (date: string, amount: number): Expense => ({
  id: `${date}-${amount}`,
  tripId: 't1',
  amount,
  description: '',
  category: 'food',
  date,
  createdAt: '2026-01-01T00:00:00Z',
})

describe('simulatePurchase', () => {
  it('dilutes the purchase over every remaining day, today included', () => {
    // 200 over 5 days → each day gets 40 less.
    const s = simulatePurchase(trip, [bill('2026-05-01', 3_000)], '2026-05-01', 20_000)
    expect(s.daysAffected).toBe(5)
    expect(s.perDayCut).toBe(4_000)
    expect(s.todayLeftBefore).toBe(7_000)
    expect(s.todayLeftAfter).toBe(3_000)
    expect(s.dailyBefore).toBe(10_000)
    expect(s.dailyAfter).toBe(6_000)
    expect(s.remainingAfter).toBe(27_000)
    expect(s.dailyDrop).toBe(0.4)
    expect(s.verdict).toBe('big-hit')
  })

  it('rates small dents as easy or manageable', () => {
    expect(simulatePurchase(trip, [], '2026-05-01', 2_000).verdict).toBe('easy') // 4/day, 4%
    expect(simulatePurchase(trip, [], '2026-05-01', 6_000).verdict).toBe('manageable') // 12/day, 12%
  })

  it('flags purchases that blow the whole budget', () => {
    const s = simulatePurchase(trip, [bill('2026-05-01', 40_000)], '2026-05-02', 20_000)
    expect(s.verdict).toBe('over-budget')
    expect(s.remainingAfter).toBe(-10_000)
  })

  it('puts everything on today on the last day', () => {
    const s = simulatePurchase(trip, [], '2026-05-05', 10_000)
    expect(s.daysAffected).toBe(1)
    expect(s.perDayCut).toBe(10_000)
    expect(s.todayLeftAfter).toBe(40_000)
  })

  it('lowers the even split before the trip starts', () => {
    const s = simulatePurchase(trip, [], '2026-04-01', 5_000)
    expect(s.todayLeftBefore).toBeUndefined()
    expect(s.daysAffected).toBe(5)
    expect(s.dailyBefore).toBe(10_000)
    expect(s.dailyAfter).toBe(9_000)
    expect(s.verdict).toBe('manageable')
  })
})
