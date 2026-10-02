import type { CSSProperties, ReactNode } from 'react'
import styles from './ProgressRing.module.css'

export interface ProgressRingProps {
  /** 0..1, clamped. */
  value: number
  size?: number
  stroke?: number
  color?: string
  trackColor?: string
  label?: string
  children?: ReactNode
}

export function ProgressRing({ value, size = 120, stroke = 12, color, trackColor, label, children }: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(value, 0), 1)
  return (
    <div
      className={styles.ring}
      style={{ width: size, height: size, '--ring-color': color, '--ring-track': trackColor } as CSSProperties}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-label={label}
    >
      <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
        <circle
          className={styles.value}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </svg>
      <div className={styles.center}>{children}</div>
    </div>
  )
}
