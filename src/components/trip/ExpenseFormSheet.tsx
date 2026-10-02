import { TrashIcon } from '@phosphor-icons/react'
import { useId, useState, type FormEvent } from 'react'
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from '../../domain/categories'
import type { TripBudget } from '../../domain/budget'
import type { Expense, ExpenseInput, Trip } from '../../domain/types'
import { useDataStore } from '../../data/DataStoreContext'
import { clampDate, diffDays, todayISO } from '../../lib/date'
import { cx } from '../../lib/cx'
import { centsToInput, currencySymbol, formatMoney, parseMoney } from '../../lib/money'
import { Button, ChoiceGroup, MoneyField, Sheet, Switch, TextField } from '../ui'
import { plural } from './copy'
import styles from './ExpenseFormSheet.module.css'

const categoryOptions = CATEGORY_KEYS.map((key) => ({ value: key, ...CATEGORIES[key] }))

export interface ExpenseFormSheetProps {
  open: boolean
  trip: Trip
  budget: TripBudget
  /** When set, the sheet edits this bill instead of adding one. */
  expense?: Expense
  /** Prefills a new bill, e.g. from a purchase simulation. */
  draft?: ExpenseDraft
  onClose: () => void
}

export type ExpenseDraft = Partial<Pick<ExpenseInput, 'amount' | 'description' | 'category' | 'spread'>>

export function ExpenseFormSheet({ open, trip, budget, expense, draft, onClose }: ExpenseFormSheetProps) {
  const store = useDataStore()
  const formId = useId()
  const [saving, setSaving] = useState(false)

  async function handleDelete() {
    if (!expense) return
    await store.expenses.remove(expense.id)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={expense ? 'Edit bill' : 'Add a bill'}
      footer={
        <>
          {expense ? (
            <Button variant="danger" icon={TrashIcon} onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" form={formId} disabled={saving}>
            {expense ? 'Save' : 'Add bill'}
          </Button>
        </>
      }
    >
      <ExpenseForm id={formId} trip={trip} budget={budget} expense={expense} draft={draft} onSavingChange={setSaving} onSaved={onClose} />
    </Sheet>
  )
}

interface ExpenseFormProps {
  id: string
  trip: Trip
  budget: TripBudget
  expense?: Expense
  draft?: ExpenseDraft
  onSavingChange: (saving: boolean) => void
  onSaved: () => void
}

function ExpenseForm({ id, trip, budget, expense, draft, onSavingChange, onSaved }: ExpenseFormProps) {
  const store = useDataStore()
  const today = todayISO()
  const maxDate = today < trip.endDate ? today : trip.endDate
  const initial = expense ?? draft
  const [amountText, setAmountText] = useState(initial?.amount ? centsToInput(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState<CategoryKey>(initial?.category ?? 'food')
  const [date, setDate] = useState(expense?.date ?? clampDate(today, trip.startDate, maxDate))
  const [spread, setSpread] = useState(initial?.spread ?? false)
  const [submitted, setSubmitted] = useState(false)

  const amount = parseMoney(amountText)
  const amountError = !amount ? 'Enter how much you paid' : undefined
  const spreadDays = diffDays(date, trip.endDate) + 1
  const canSpread = spreadDays > 1
  const isSpread = spread && canSpread

  // Preview how this bill changes what's left today.
  const todayBudget = budget.today
  const isToday = date === today && todayBudget
  const previousAmount = expense?.date === today && !expense.spread ? expense.amount : 0
  const leftAfter = isToday && amount && !isSpread ? todayBudget.balance + previousAmount - amount : undefined

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!amount) return
    const input: ExpenseInput = { tripId: trip.id, amount, description: description.trim(), category, date, spread: isSpread }
    onSavingChange(true)
    try {
      if (expense) await store.expenses.update(expense.id, input)
      else await store.expenses.create(input)
      onSaved()
    } finally {
      onSavingChange(false)
    }
  }

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <MoneyField
        big
        label="Amount"
        currencySymbol={currencySymbol(trip.currency)}
        value={amountText}
        onChange={(e) => setAmountText(e.target.value)}
        error={submitted ? amountError : undefined}
        autoFocus
      />

      {leftAfter !== undefined && (
        <p className={cx(styles.impact, leftAfter < 0 && styles.over)}>
          {leftAfter >= 0 ? (
            <>
              You&apos;ll still have <strong>{formatMoney(leftAfter, trip.currency)}</strong> for today
            </>
          ) : (
            <>
              That&apos;s <strong>{formatMoney(-leftAfter, trip.currency)}</strong> over today — it&apos;ll come out of the next days
            </>
          )}
        </p>
      )}
      {isSpread && amount && (
        <p className={styles.impact}>
          Each of the {plural(spreadDays, 'day')} gets <strong>{formatMoney(Math.trunc(amount / spreadDays), trip.currency)}</strong> less
        </p>
      )}

      <ChoiceGroup label="Category" options={categoryOptions} value={category} onChange={setCategory} />

      <TextField
        label="What was it?"
        placeholder={`e.g. ${placeholders[category]}`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={80}
      />

      <TextField
        label="Day"
        type="date"
        value={date}
        min={trip.startDate}
        max={maxDate}
        onChange={(e) => e.target.value && setDate(e.target.value)}
        hint={isSpread ? 'Split from this day to the end of the trip' : 'Bills count against the day they happened'}
      />

      {canSpread && (
        <Switch
          label="Spread over the remaining days"
          description={`For big purchases: split it equally over ${plural(spreadDays, 'day')} instead of taking it all from this day.`}
          checked={spread}
          onChange={setSpread}
        />
      )}
    </form>
  )
}

const placeholders: Record<CategoryKey, string> = {
  food: 'Ramen for lunch',
  transport: 'Metro card',
  stay: 'Hostel night',
  fun: 'Museum tickets',
  shopping: 'Souvenirs',
  other: 'SIM card',
}
