import { ArrowRightIcon, FlaskIcon, ReceiptIcon, SmileyWinkIcon, ThumbsUpIcon, WarningIcon, WarningOctagonIcon, type Icon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { ToneKey } from '../../domain/appearance'
import { simulatePurchase, type PurchaseSimulation, type PurchaseVerdict } from '../../domain/simulation'
import type { Expense, Trip } from '../../domain/types'
import { useI18n } from '../../i18n'
import { cx } from '../../lib/cx'
import type { ISODate } from '../../lib/date'
import { currencySymbol, formatMoney, parseMoney } from '../../lib/money'
import { Button, MoneyField, Sheet, TextField, toneVars } from '../ui'
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
  const { t } = useI18n()
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
      title={t.simulate.title}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {t.common.close}
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
              {t.simulate.addAsBill}
            </Button>
          )}
        </>
      }
    >
      <div className={styles.content}>
        <MoneyField
          big
          label={t.simulate.howMuch}
          currencySymbol={currencySymbol(trip.currency)}
          value={amountText}
          onChange={(e) => setAmountText(e.target.value)}
          autoFocus
        />
        <TextField
          label={t.simulate.whatIsIt}
          placeholder={t.simulate.placeholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={80}
        />

        {simulation ? (
          <SimulationResult simulation={simulation} currency={trip.currency} />
        ) : (
          <p className={styles.hint}>
            <FlaskIcon size={24} weight="duotone" aria-hidden />
            {t.simulate.hint}
          </p>
        )}
      </div>
    </Sheet>
  )
}

const verdicts: Record<PurchaseVerdict, { icon: Icon; tone?: ToneKey }> = {
  easy: { icon: SmileyWinkIcon, tone: 'mint' },
  manageable: { icon: ThumbsUpIcon, tone: 'sky' },
  'big-hit': { icon: WarningIcon, tone: 'sun' },
  'over-budget': { icon: WarningOctagonIcon },
}

function SimulationResult({ simulation: s, currency }: { simulation: PurchaseSimulation; currency: string }) {
  const { t } = useI18n()
  const money = (cents: number) => formatMoney(cents, currency)
  const { icon: VerdictIcon, tone } = verdicts[s.verdict]
  const title = t.simulate.verdicts[s.verdict]
  const isActive = s.todayLeftBefore !== undefined
  const nextDays = isActive ? s.daysAffected - 1 : s.daysAffected

  const message =
    s.verdict === 'over-budget'
      ? t.simulate.overBudget(money(-s.remainingAfter))
      : s.daysAffected === 1
        ? t.simulate.allToday
        : t.simulate.splitOver(s.daysAffected, isActive, money(s.perDayCut), Math.round(s.dailyDrop * 100))

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
        {isActive && <CompareRow label={t.simulate.leftToday} before={s.todayLeftBefore!} after={s.todayLeftAfter!} money={money} />}
        {nextDays > 0 && (
          <CompareRow
            label={isActive ? t.simulate.nextDaysPerDay(nextDays) : t.simulate.perDay}
            before={s.dailyBefore}
            after={s.dailyAfter}
            money={money}
          />
        )}
        <CompareRow label={t.simulate.tripLeft} before={s.remainingBefore} after={s.remainingAfter} money={money} />
      </div>
    </>
  )
}

function CompareRow({ label, before, after, money }: { label: string; before: number; after: number; money: (c: number) => string }) {
  const { t } = useI18n()
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.values}>
        <span className={styles.before}>{money(before)}</span>
        <ArrowRightIcon className={styles.arrow} size={14} weight="bold" aria-label={t.simulate.becomes} />
        <span className={cx(styles.after, after < 0 && styles.negative)}>{money(after)}</span>
      </span>
    </div>
  )
}
