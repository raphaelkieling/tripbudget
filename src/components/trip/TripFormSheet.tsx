import { CalculatorIcon } from '@phosphor-icons/react'
import { useId, useState, type FormEvent } from 'react'
import { TONES, TRIP_ICONS, type ToneKey, type TripIconKey } from '../../domain/appearance'
import type { Trip, TripInput } from '../../domain/types'
import { useDataStore } from '../../data/DataStoreContext'
import { useI18n } from '../../i18n'
import { addDays, diffDays, todayISO } from '../../lib/date'
import { CURRENCIES, centsToInput, currencySymbol, formatMoney, guessCurrency, parseMoney, type CurrencyCode } from '../../lib/money'
import { Button, ChoiceGroup, MoneyField, SelectField, Sheet, TextField } from '../ui'
import styles from './TripFormSheet.module.css'

const ICON_KEYS = Object.keys(TRIP_ICONS) as TripIconKey[]
const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }))

export interface TripFormSheetProps {
  open: boolean
  /** When set, the sheet edits this trip instead of creating one. */
  trip?: Trip
  onClose: () => void
  onSaved?: (trip: Trip) => void
}

export function TripFormSheet({ open, trip, onClose, onSaved }: TripFormSheetProps) {
  const { t } = useI18n()
  const formId = useId()
  const [saving, setSaving] = useState(false)
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={trip ? t.tripForm.editTitle : t.tripForm.newTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={formId} disabled={saving}>
            {trip ? t.common.save : t.tripForm.create}
          </Button>
        </>
      }
    >
      <TripForm
        id={formId}
        trip={trip}
        onSavingChange={setSaving}
        onSaved={(saved) => {
          onSaved?.(saved)
          onClose()
        }}
      />
    </Sheet>
  )
}

interface TripFormProps {
  id: string
  trip?: Trip
  onSavingChange: (saving: boolean) => void
  onSaved: (trip: Trip) => void
}

function TripForm({ id, trip, onSavingChange, onSaved }: TripFormProps) {
  const { t } = useI18n()
  const store = useDataStore()
  const [name, setName] = useState(trip?.name ?? '')
  const [icon, setIcon] = useState<TripIconKey>(trip?.icon ?? 'plane')
  const [tone, setTone] = useState<ToneKey>(trip?.tone ?? 'violet')
  const [startDate, setStartDate] = useState(trip?.startDate ?? todayISO())
  const [endDate, setEndDate] = useState(trip?.endDate ?? addDays(todayISO(), 6))
  const [budgetText, setBudgetText] = useState(trip ? centsToInput(trip.budget) : '')
  const [currency, setCurrency] = useState<CurrencyCode>(trip?.currency ?? guessCurrency())
  const [submitted, setSubmitted] = useState(false)

  const budget = parseMoney(budgetText)
  const days = diffDays(startDate, endDate) + 1
  const errors = {
    name: !name.trim() ? t.tripForm.nameRequired : undefined,
    endDate: days < 1 ? t.tripForm.endBeforeStart : undefined,
    budget: !budget ? t.tripForm.budgetRequired : undefined,
  }
  const valid = !errors.name && !errors.endDate && !errors.budget
  const iconOptions = ICON_KEYS.map((key) => ({ value: key, label: t.tripForm.icons[key], icon: TRIP_ICONS[key] }))
  const toneOptions = TONES.map((value) => ({ value, label: t.tripForm.tones[value], tone: value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!valid || !budget) return
    const input: TripInput = { name: name.trim(), icon, tone, startDate, endDate, budget, currency }
    onSavingChange(true)
    try {
      onSaved(trip ? await store.trips.update(trip.id, input) : await store.trips.create(input))
    } finally {
      onSavingChange(false)
    }
  }

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label={t.tripForm.nameLabel}
        placeholder={t.tripForm.namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={submitted ? errors.name : undefined}
        autoFocus={!trip}
        maxLength={60}
      />

      <ChoiceGroup label={t.tripForm.icon} variant="tile" tone={tone} options={iconOptions} value={icon} onChange={setIcon} />
      <ChoiceGroup label={t.tripForm.color} variant="swatch" options={toneOptions} value={tone} onChange={setTone} />

      <div className={styles.row}>
        <TextField label={t.tripForm.start} type="date" value={startDate} onChange={(e) => e.target.value && setStartDate(e.target.value)} />
        <TextField
          label={t.tripForm.end}
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => e.target.value && setEndDate(e.target.value)}
          error={errors.endDate}
        />
      </div>

      <div className={styles.budgetRow}>
        <MoneyField
          label={t.tripForm.totalBudget}
          currencySymbol={currencySymbol(currency)}
          value={budgetText}
          onChange={(e) => setBudgetText(e.target.value)}
          error={submitted ? errors.budget : undefined}
        />
        <SelectField label={t.tripForm.currency} options={currencyOptions} value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} />
      </div>

      {budget && days > 0 ? (
        <div className={styles.preview}>
          <CalculatorIcon size={26} weight="duotone" aria-hidden />
          <span>{t.tripForm.perDayPreview(<strong>{formatMoney(Math.trunc(budget / days), currency)}</strong>, days)}</span>
        </div>
      ) : null}
    </form>
  )
}
