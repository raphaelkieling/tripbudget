import { ArrowRightIcon, FlaskIcon, ReceiptIcon, SmileyWinkIcon, ThumbsUpIcon, WarningIcon, WarningOctagonIcon, type Icon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { ToneKey } from '../../domain/appearance'
import { simulatePurchase, type PurchaseSimulation, type PurchaseVerdict } from '../../domain/simulation'
import type { Expense, Trip } from '../../domain/types'
import { cx } from '../../lib/cx'
import type { ISODate } from '../../lib/date'
import { currencySymbol, formatMoney, parseMoney } from '../../lib/money'
import { Button, MoneyField, Sheet, TextField, toneVars } from '../ui'
import { plural } from './copy'
import type { ExpenseDraft } from './ExpenseFormSheet'
import styles from './SimulateSheet.module.css'

export interface SimulateSheetProps {
  open: boolean
  trip: Trip
  expenses: Expense[]
  today: ISODate
  onClose: () => void
  /** When set, shows an "Add as bill" action with the simulated purchase. */
  onAddAsBill?: (draft: ExpenseDraft) => void
}

/** "What if I buy this?" — previews a purchase's impact without saving it. */
export function SimulateSheet({ open, trip, expenses, today, onClose, onAddAsBill }: SimulateSheetProps) {
  const [amountText, setAmountText] = useState('')
  const [description, setDescription] = useState('')
  const amount = parseMoney(amountText)
  const simulation = amount ? simulatePurchase(trip, expenses, today, amount) : undefined

  const close = () => {
    setAmountText('')
    setDescription('')
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="What if I buy it?"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
          {onAddAsBill && (
            <Button
              icon={ReceiptIcon}
              disabled={!amount}
              onClick={() => {
                onAddAsBill({ amount: amount ?? undefined, description: description.trim(), category: 'shopping', spread: true })
                setAmountText('')
                setDescription('')
              }}
            >
              Add as bill
            </Button>
          )}
        </>
      }
    >
      <div className={styles.content}>
        <MoneyField
          big
          label="How much is it?"
          currencySymbol={currencySymbol(trip.currency)}
          value={amountText}
          onChange={(e) => setAmountText(e.target.value)}
          autoFocus
        />
        <TextField
          label="What is it? (optional)"
          placeholder="e.g. Leather jacket"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={80}
        />

        {simulation ? (
          <SimulationResult simulation={simulation} currency={trip.currency} />
        ) : (
          <p className={styles.hint}>
            <FlaskIcon size={24} weight="duotone" aria-hidden />
            Nothing is saved — just try an amount and see how it affects your days.
          </p>
        )}
      </div>
    </Sheet>
  )
}

const verdicts: Record<PurchaseVerdict, { icon: Icon; tone?: ToneKey; title: string }> = {
  easy: { icon: SmileyWinkIcon, tone: 'mint', title: 'Go for it!' },
  manageable: { icon: ThumbsUpIcon, tone: 'sky', title: 'You’ll barely notice' },
  'big-hit': { icon: WarningIcon, tone: 'sun', title: 'That’s a big hit' },
  'over-budget': { icon: WarningOctagonIcon, title: 'Over your trip budget' },
}

function SimulationResult({ simulation: s, currency }: { simulation: PurchaseSimulation; currency: string }) {
  const money = (cents: number) => formatMoney(cents, currency)
  const { icon: VerdictIcon, tone, title } = verdicts[s.verdict]
  const isActive = s.todayLeftBefore !== undefined
  const nextDays = isActive ? s.daysAffected - 1 : s.daysAffected

  const message =
    s.verdict === 'over-budget'
      ? `You’d end the trip ${money(-s.remainingAfter)} over budget.`
      : s.daysAffected === 1
        ? `It all comes out of today.`
        : `Split over ${plural(s.daysAffected, 'day')}${isActive ? ', today included' : ''}: each day gets ${money(s.perDayCut)} less (−${Math.round(s.dailyDrop * 100)}%).`

  return (
    <>
      <div className={cx(styles.verdict, !tone && styles.danger)} style={tone ? toneVars(tone) : undefined} role="status">
        <span className={styles.verdictIcon}>
          <VerdictIcon size={30} weight="fill" aria-hidden />
        </span>
        <div>
          <p className={styles.verdictTitle}>{title}</p>
          <p className={styles.verdictText}>{message}</p>
        </div>
      </div>

      <div className={styles.compare}>
        {isActive && <CompareRow label="Left for today" before={s.todayLeftBefore!} after={s.todayLeftAfter!} money={money} />}
        {nextDays > 0 && (
          <CompareRow
            label={isActive ? `Next ${plural(nextDays, 'day')}, per day` : 'Per day'}
            before={s.dailyBefore}
            after={s.dailyAfter}
            money={money}
          />
        )}
        <CompareRow label="Trip budget left" before={s.remainingBefore} after={s.remainingAfter} money={money} />
      </div>
    </>
  )
}

function CompareRow({ label, before, after, money }: { label: string; before: number; after: number; money: (c: number) => string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.values}>
        <span className={styles.before}>{money(before)}</span>
        <ArrowRightIcon className={styles.arrow} size={14} weight="bold" aria-label="becomes" />
        <span className={cx(styles.after, after < 0 && styles.negative)}>{money(after)}</span>
      </span>
    </div>
  )
}
