import { CheckIcon, type Icon } from '@phosphor-icons/react'
import { useId, type CSSProperties } from 'react'
import type { ToneKey } from '../../domain/appearance'
import { cx } from '../../lib/cx'
import styles from './ChoiceGroup.module.css'
import { toneVars } from './tone'

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  icon?: Icon
  tone?: ToneKey
  /** Any CSS color, overriding `tone` (e.g. theme swatches). */
  color?: string
}

export interface ChoiceGroupProps<T extends string> {
  label: string
  options: ChoiceOption<T>[]
  value: T
  onChange: (value: T) => void
  /** chip = icon + label, tile = icon only, swatch = color dot */
  variant?: 'chip' | 'tile' | 'swatch'
  /** Tone used for options without their own tone. */
  tone?: ToneKey
}

export function ChoiceGroup<T extends string>({ label, options, value, onChange, variant = 'chip', tone = 'violet' }: ChoiceGroupProps<T>) {
  const name = useId()
  return (
    <fieldset className={cx(styles.group, styles[variant])}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.options}>
        {options.map(({ value: optionValue, label: optionLabel, icon: IconComponent, tone: optionTone, color }) => {
          const checked = optionValue === value
          return (
            <label key={optionValue} className={styles.option} style={color ? ({ '--tone': color, '--tone-soft': color } as CSSProperties) : toneVars(optionTone ?? tone)} title={optionLabel}>
              <input type="radio" name={name} value={optionValue} checked={checked} onChange={() => onChange(optionValue)} />
              <span className={styles.face}>
                {variant === 'swatch' ? (
                  checked && <CheckIcon size={18} weight="bold" aria-hidden />
                ) : (
                  IconComponent && <IconComponent size={variant === 'tile' ? 26 : 20} weight={checked ? 'fill' : 'duotone'} aria-hidden />
                )}
                {variant === 'chip' ? optionLabel : <span className="visually-hidden">{optionLabel}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
