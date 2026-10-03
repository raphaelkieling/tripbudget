import { useId, useState, type FormEvent } from 'react'
import type { TripBudget } from '../../domain/budget'
import type { Trip } from '../../domain/types'
import { useDataStore } from '../../data/DataStoreContext'
import { useI18n } from '../../i18n'
import { clampDate, todayISO } from '../../lib/date'
import { centsToInput, currencySymbol, formatMoney, parseMoney } from '../../lib/money'
import { Button, MoneyField, Sheet, TextField } from '../ui'
import styles from './ExpenseFormSheet.module.css'

export interface BalanceSheetProps {
  open: boolean
  trip: Trip
  budget: TripBudget
  onClose: () => void
}

/**
 * "Update what's left": the user types the real remaining budget and we log
 * the difference as a spread adjustment, so forgotten bills (or money that
 * came back) don't need to be entered one by one.
 */
export function BalanceSheet({ open, trip, budget, onClose }: BalanceSheetProps) {
  const { t } = useI18n()
  const formId = useId()
  const [saving, setSaving] = useState(false)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t.balance.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={formId} disabled={saving}>
            {t.balance.save}
          </Button>
        </>
      }
    >
      <BalanceForm id={formId} trip={trip} budget={budget} onSavingChange={setSaving} onSaved={onClose} />
    </Sheet>
  )
}

interface BalanceFormProps {
  id: string
  trip: Trip
  budget: TripBudget
  onSavingChange: (saving: boolean) => void
  onSaved: () => void
}

function BalanceForm({ id, trip, budget, onSavingChange, onSaved }: BalanceFormProps) {
  const { t } = useI18n()
  const store = useDataStore()
  const today = todayISO()
  const maxDate = today < trip.endDate ? today : trip.endDate
  const [amountText, setAmountText] = useState(budget.remaining > 0 ? centsToInput(budget.remaining) : '')
  const [date, setDate] = useState(clampDate(today, trip.startDate, maxDate))
  const [submitted, setSubmitted] = useState(false)

  const actual = parseMoney(amountText)
  // Positive: money left without a bill. Negative: more money than tracked.
  const difference = actual === null ? 0 : budget.remaining - actual
  const error = actual === null ? t.balance.amountRequired : difference === 0 ? t.balance.unchanged : undefined
  const highlight = <strong>{formatMoney(Math.abs(difference), trip.currency)}</strong>

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (error) return
    onSavingChange(true)
    try {
      await store.expenses.create({
        tripId: trip.id,
        amount: difference,
        description: '',
        category: 'other',
        date,
        spread: true,
        adjustment: true,
      })
      onSaved()
    } finally {
      onSavingChange(false)
    }
  }

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <MoneyField
        big
        label={t.balance.amountLabel}
        currencySymbol={currencySymbol(trip.currency)}
        value={amountText}
        onChange={(e) => setAmountText(e.target.value)}
        error={submitted ? error : undefined}
        autoFocus
      />

      {difference !== 0 && (
        <p className={styles.impact}>{difference > 0 ? t.balance.went(highlight) : t.balance.came(highlight)}</p>
      )}

      <TextField
        label={t.balance.day}
        type="date"
        value={date}
        min={trip.startDate}
        max={maxDate}
        onChange={(e) => e.target.value && setDate(e.target.value)}
        hint={t.balance.dayHint}
      />
    </form>
  )
}
