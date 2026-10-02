import type { TripBudget } from '../../domain/budget'
import type { Messages } from '../../i18n'

export function phaseLabel(t: Messages, budget: TripBudget, daysUntilStart: number): string {
  switch (budget.phase) {
    case 'upcoming':
      return daysUntilStart === 1 ? t.phase.tomorrow : t.phase.inDays(daysUntilStart)
    case 'active':
      return budget.today ? t.phase.dayOf(budget.today.dayNumber, budget.totalDays) : t.phase.onTheRoad
    case 'finished':
      return t.phase.finished
  }
}
