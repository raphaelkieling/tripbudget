import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import styles from './Field.module.css'

interface FieldShellProps {
  label: string
  hint?: ReactNode
  error?: string
  className?: string
}

function FieldShell({ id, label, hint, error, className, children }: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error ? (
        <span id={`${id}-msg`} className={styles.error}>
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-msg`} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}

export type TextFieldProps = FieldShellProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

export function TextField({ label, hint, error, className, id, ...input }: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} className={className}>
      <input
        id={fieldId}
        className={cx(styles.control, error && styles.invalid)}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${fieldId}-msg` : undefined}
        {...input}
      />
    </FieldShell>
  )
}

export type SelectFieldProps = FieldShellProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { options: Array<{ value: string; label: string }> }

export function SelectField({ label, hint, error, className, id, options, ...select }: SelectFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} className={className}>
      <select id={fieldId} className={cx(styles.control, error && styles.invalid)} {...select}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export type MoneyFieldProps = TextFieldProps & { currencySymbol: string; big?: boolean }

export function MoneyField({ currencySymbol, big, label, hint, error, className, id, ...input }: MoneyFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} className={cx(big && styles.big, className)}>
      <div className={styles.moneyWrap} style={{ '--prefix-width': `${currencySymbol.length + 0.5}ch` } as CSSProperties}>
        <span className={styles.prefix} aria-hidden>
          {currencySymbol}
        </span>
        <input
          id={fieldId}
          className={cx(styles.control, error && styles.invalid)}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${fieldId}-msg` : undefined}
          {...input}
        />
      </div>
    </FieldShell>
  )
}
