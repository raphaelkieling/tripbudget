import { CheckIcon, type Icon } from '@phosphor-icons/react'
import { useId } from 'react'
import { cx } from '../../lib/cx'
import styles from './ChoiceGroup.module.css'
import { toneVars, type Tone } from './tone'

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  icon?: Icon
  tone?: Tone
}

export interface ChoiceGroupProps<T extends string> {
  label: string
  options: ChoiceOption<T>[]
  value: T
  onChange: (value: T) => void
  /** chip = icon + label, tile = icon only, swatch = color dot */
  variant?: 'chip' | 'tile' | 'swatch'
  /** Tone used for options without their own tone. */
  tone?: Tone
}

export function ChoiceGroup<T extends string>({ label, options, value, onChange, variant = 'chip', tone = 'accent' }: ChoiceGroupProps<T>) {
  const name = useId()
  return (
    <fieldset className={cx(styles.group, styles[variant])}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.options}>
        {options.map(({ value: optionValue, label: optionLabel, icon: IconComponent, tone: optionTone }) => {
          const checked = optionValue === value
          return (
            <label key={optionValue} className={styles.option} style={toneVars(optionTone ?? tone)} title={optionLabel}>
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
