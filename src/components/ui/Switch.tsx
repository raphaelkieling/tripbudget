import type { ReactNode } from 'react'
import styles from './Switch.module.css'

export interface SwitchProps {
  label: string
  description?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, description, checked, onChange }: SwitchProps) {
  return (
    <label className={styles.switch}>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      <input className={styles.input} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.track} aria-hidden />
    </label>
  )
}
