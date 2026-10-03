import { PencilSimpleIcon, type Icon } from '@phosphor-icons/react'
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
  /** Shown under the value, e.g. a badge. */
  extra?: ReactNode
  /** Makes the stat a button; `editLabel` describes the action. */
  onEdit?: () => void
  editLabel?: string
}

export function Stat({ icon, tone, label, value, negative, extra, onEdit, editLabel }: StatProps) {
  const content = (
    <>
      <IconBubble icon={icon} tone={tone} size="md" />
      <span className={styles.text}>
        <span className={styles.label}>
          {label}
          {onEdit && <PencilSimpleIcon size={12} weight="bold" aria-hidden />}
        </span>
        <span className={styles.value}>{value}</span>
        {extra && <span className={styles.extra}>{extra}</span>}
      </span>
    </>
  )

  if (onEdit) {
    return (
      <button type="button" className={cx(styles.stat, styles.editable, negative && styles.negative)} onClick={onEdit} title={editLabel}>
        {content}
        {editLabel && <span className="visually-hidden">{editLabel}</span>}
      </button>
    )
  }
  return <div className={cx(styles.stat, negative && styles.negative)}>{content}</div>
}
