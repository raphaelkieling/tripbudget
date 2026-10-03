import { ArrowLeftIcon, FlaskIcon, ListChecksIcon, MagnifyingGlassIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BalanceSheet, BudgetStats, CurrencySwitch, TripMoneyProvider, DayTimeline, ExpenseFormSheet, SimulateSheet, TodayHero, TripFormSheet, type ExpenseDraft } from '../components/trip'
import { Button, ButtonLink, ConfirmSheet, EmptyState, Fab, Page, TopBar } from '../components/ui'
import { useDataStore } from '../data/DataStoreContext'
import { useExpenses, useToday, useTrip, useTripBudget } from '../data/hooks'
import type { Expense } from '../domain/types'
import { useI18n } from '../i18n'
import { diffDays, formatDateRange } from '../lib/date'
import { formatMoney } from '../lib/money'
import styles from './TripPage.module.css'

type SheetState =
  | { kind: 'none' }
  | { kind: 'edit-trip' }
  | { kind: 'delete-trip' }
  | { kind: 'simulate' }
  | { kind: 'balance' }
  | { kind: 'remove-adjustment'; expense: Expense }
  | { kind: 'expense'; expense?: Expense; draft?: ExpenseDraft }

export function TripPage() {
  const { t } = useI18n()
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
      {t.trip.back}
    </ButtonLink>
  )

  if (trip.loading || expenses.loading) return <Page>{null}</Page>

  if (!trip.data || !budget) {
    return (
      <Page>
        <TopBar leading={back} />
        <EmptyState
          icons={[{ icon: MagnifyingGlassIcon, tone: 'sky' }]}
          title={t.trip.notFoundTitle}
          text={t.trip.notFoundText}
          action={<ButtonLink to="/">{t.trip.goHome}</ButtonLink>}
        />
      </Page>
    )
  }

  const current = trip.data
  const canAdd = budget.phase !== 'upcoming'
  const canSimulate = budget.phase !== 'finished'
  const addLabel = canAdd ? t.trip.addBill : t.trip.startsIn(diffDays(today, current.startDate))
  const openAdd = () => setSheet({ kind: 'expense' })
  const openSimulate = () => setSheet({ kind: 'simulate' })

  return (
    <TripMoneyProvider currency={current.currency}>
      <Page>
        <TopBar
          leading={back}
          title={
            <>
              {current.name}
              <span className={styles.dates}>{formatDateRange(current.startDate, current.endDate)}</span>
            </>
          }
          actions={
            <>
              <Button variant="surface" icon={PencilSimpleIcon} iconOnly onClick={() => setSheet({ kind: 'edit-trip' })}>
                {t.trip.edit}
              </Button>
              <Button variant="surface" icon={TrashIcon} iconOnly onClick={() => setSheet({ kind: 'delete-trip' })}>
                {t.trip.delete}
              </Button>
            </>
          }
        />

        <div className={styles.layout}>
          <div className={styles.side}>
            <CurrencySwitch />
            <TodayHero trip={current} budget={budget} today={today} />
            <BudgetStats budget={budget} onEditRemaining={canAdd ? () => setSheet({ kind: 'balance' }) : undefined} />
            <div className={styles.actionsInline}>
              {canSimulate && (
                <Button variant="secondary" size="lg" icon={FlaskIcon} onClick={openSimulate}>
                  {t.trip.simulate}
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
              {t.trip.dayByDay}
            </h2>
            <DayTimeline trip={current} budget={budget} onSelectExpense={(expense) => setSheet(expense.adjustment ? { kind: 'remove-adjustment', expense } : { kind: 'expense', expense })} />
          </div>
        </div>

        <Fab className={styles.fab}>
          {canSimulate && (
            <Button variant="surface" size="lg" icon={FlaskIcon} className={styles.simulate} onClick={openSimulate}>
              {t.trip.simulate}
            </Button>
          )}
          {canAdd && (
            <Button size="lg" icon={PlusIcon} onClick={openAdd}>
              {t.trip.addBill}
            </Button>
          )}
        </Fab>

        <ExpenseFormSheet
          open={sheet.kind === 'expense'}
          trip={current}
          budget={budget}
          expense={sheet.kind === 'expense' ? sheet.expense : undefined}
          draft={sheet.kind === 'expense' ? sheet.draft : undefined}
          onClose={close}
        />
        <SimulateSheet
          open={sheet.kind === 'simulate'}
          trip={current}
          expenses={expenses.data ?? []}
          today={today}
          onClose={close}
          onAddAsBill={canAdd ? (draft) => setSheet({ kind: 'expense', draft }) : undefined}
        />
        <BalanceSheet open={sheet.kind === 'balance'} trip={current} budget={budget} onClose={close} />
        <ConfirmSheet
          open={sheet.kind === 'remove-adjustment'}
          title={t.balance.removeTitle}
          message={sheet.kind === 'remove-adjustment' && t.balance.removeMessage(formatMoney(budget.remaining + sheet.expense.amount, current.currency))}
          onClose={close}
          onConfirm={async () => {
            if (sheet.kind === 'remove-adjustment') await store.expenses.remove(sheet.expense.id)
            close()
          }}
        />
        <TripFormSheet open={sheet.kind === 'edit-trip'} trip={current} onClose={close} />
        <ConfirmSheet
          open={sheet.kind === 'delete-trip'}
          title={t.trip.deleteTitle}
          message={t.trip.deleteMessage(current.name)}
          onClose={close}
          onConfirm={async () => {
            await store.trips.remove(current.id)
            navigate('/', { replace: true })
          }}
        />
      </Page>
    </TripMoneyProvider>
  )
}
