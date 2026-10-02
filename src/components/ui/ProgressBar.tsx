import type { ToneKey } from '../../domain/appearance'
import { cx } from '../../lib/cx'
import styles from './ProgressBar.module.css'
import { toneVars } from './tone'

export interface ProgressBarProps {
  /** 0..1; values above 1 render full and red. */
  value: number
  tone?: ToneKey
  /** Pure black/white fill (per theme) instead of the tone color. */
  contrast?: boolean
  label?: string
  className?: string
}

export function ProgressBar({ value, tone = 'violet', contrast, label, className }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 1) * 100
  return (
    <div
      className={cx(styles.bar, contrast && styles.contrast, value > 1 && styles.over, className)}
      style={toneVars(tone)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  )
}
