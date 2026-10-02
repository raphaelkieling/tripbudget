import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { ToneKey } from '../../domain/appearance'
import { cx } from '../../lib/cx'
import { IconBubble } from './IconBubble'
import styles from './Stat.module.css'

export interface StatProps {
  icon: Icon
  tone?: ToneKey
  label: string
  value: ReactNode
  negative?: boolean
}

export function Stat({ icon, tone, label, value, negative }: StatProps) {
  return (
    <div className={cx(styles.stat, negative && styles.negative)}>
      <IconBubble icon={icon} tone={tone} size="md" />
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  )
}
