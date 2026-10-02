import type { TripBudget } from '../../domain/budget'

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function phaseLabel(budget: TripBudget, daysUntilStart: number): string {
  switch (budget.phase) {
    case 'upcoming':
      return daysUntilStart === 1 ? 'Tomorrow' : `In ${plural(daysUntilStart, 'day')}`
    case 'active':
      return budget.today ? `Day ${budget.today.dayNumber} of ${budget.totalDays}` : 'On the road'
    case 'finished':
      return 'Finished'
  }
}
