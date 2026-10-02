import { ArrowLeftIcon, FlaskIcon, ListChecksIcon, MagnifyingGlassIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BudgetStats, DayTimeline, ExpenseFormSheet, SimulateSheet, TodayHero, TripFormSheet, type ExpenseDraft } from '../components/trip'
import { plural } from '../components/trip/copy'
import { Button, ButtonLink, ConfirmSheet, EmptyState, Fab, Page, TopBar } from '../components/ui'
import { useDataStore } from '../data/DataStoreContext'
import { useExpenses, useToday, useTrip, useTripBudget } from '../data/hooks'
import type { Expense } from '../domain/types'
import { diffDays, formatDateRange } from '../lib/date'
import styles from './TripPage.module.css'

type SheetState =
  | { kind: 'none' }
  | { kind: 'edit-trip' }
  | { kind: 'delete-trip' }
  | { kind: 'simulate' }
  | { kind: 'expense'; expense?: Expense; draft?: ExpenseDraft }

export function TripPage() {
  const { tripId = '' } = useParams()
  const navigate = useNavigate()
  const store = useDataStore()
  const today = useToday()
  const trip = useTrip(tripId)
  const expenses = useExpenses(tripId)
  const budget = useTripBudget(trip.data, expenses.data)
  const [sheet, setSheet] = useState<SheetState>({ kind: 'none' })
  const close = () => setSheet({ kind: 'none' })

  const back = (
    <ButtonLink to="/" variant="surface" icon={ArrowLeftIcon} iconOnly>
      Back to trips
    </ButtonLink>
  )

  if (trip.loading || expenses.loading) return <Page>{null}</Page>

  if (!trip.data || !budget) {
    return (
      <Page>
        <TopBar leading={back} />
        <EmptyState
          icons={[{ icon: MagnifyingGlassIcon, tone: 'sky' }]}
          title="Trip not found"
          text="It may have been deleted."
          action={<ButtonLink to="/">Go home</ButtonLink>}
        />
      </Page>
    )
  }

  const t = trip.data
  const canAdd = budget.phase !== 'upcoming'
  const canSimulate = budget.phase !== 'finished'
  const addLabel = canAdd ? 'Add bill' : `Starts in ${plural(diffDays(today, t.startDate), 'day')}`
  const openAdd = () => setSheet({ kind: 'expense' })
  const openSimulate = () => setSheet({ kind: 'simulate' })

  return (
    <Page>
      <TopBar
        leading={back}
        title={
          <>
            {t.name}
            <span className={styles.dates}>{formatDateRange(t.startDate, t.endDate)}</span>
          </>
        }
        actions={
          <>
            <Button variant="surface" icon={PencilSimpleIcon} iconOnly onClick={() => setSheet({ kind: 'edit-trip' })}>
              Edit trip
            </Button>
            <Button variant="surface" icon={TrashIcon} iconOnly onClick={() => setSheet({ kind: 'delete-trip' })}>
              Delete trip
            </Button>
          </>
        }
      />

      <div className={styles.layout}>
        <div className={styles.side}>
          <TodayHero trip={t} budget={budget} today={today} />
          <BudgetStats trip={t} budget={budget} />
          <div className={styles.actionsInline}>
            {canSimulate && (
              <Button variant="secondary" size="lg" icon={FlaskIcon} onClick={openSimulate}>
                Simulate
              </Button>
            )}
            <Button size="lg" icon={PlusIcon} disabled={!canAdd} onClick={openAdd}>
              {addLabel}
            </Button>
          </div>
        </div>

        <div className={styles.side}>
          <h2 className={styles.timelineTitle}>
            <ListChecksIcon size={22} weight="duotone" aria-hidden />
            Day by day
          </h2>
          <DayTimeline trip={t} budget={budget} onSelectExpense={(expense) => setSheet({ kind: 'expense', expense })} />
        </div>
      </div>

      <Fab className={styles.fab}>
        {canSimulate && (
          <Button variant="surface" size="lg" icon={FlaskIcon} onClick={openSimulate}>
            Simulate
          </Button>
        )}
        {canAdd && (
          <Button size="lg" icon={PlusIcon} onClick={openAdd}>
            Add bill
          </Button>
        )}
      </Fab>

      <ExpenseFormSheet
        open={sheet.kind === 'expense'}
        trip={t}
        budget={budget}
        expense={sheet.kind === 'expense' ? sheet.expense : undefined}
        draft={sheet.kind === 'expense' ? sheet.draft : undefined}
        onClose={close}
      />
      <SimulateSheet
        open={sheet.kind === 'simulate'}
        trip={t}
        expenses={expenses.data ?? []}
        today={today}
        onClose={close}
        onAddAsBill={canAdd ? (draft) => setSheet({ kind: 'expense', draft }) : undefined}
      />
      <TripFormSheet open={sheet.kind === 'edit-trip'} trip={t} onClose={close} />
      <ConfirmSheet
        open={sheet.kind === 'delete-trip'}
        title="Delete this trip?"
        message={`“${t.name}” and all of its bills will be removed from this device.`}
        onClose={close}
        onConfirm={async () => {
          await store.trips.remove(t.id)
          navigate('/', { replace: true })
        }}
      />
    </Page>
  )
}
