import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { ToneKey } from '../../domain/appearance'
import { cx } from '../../lib/cx'
import styles from './Badge.module.css'
import { toneVars } from './tone'

export interface BadgeProps {
  tone?: ToneKey
  icon?: Icon
  /** White translucent style for use on top of the hero card. */
  onHero?: boolean
  children: ReactNode
}

export function Badge({ tone = 'violet', icon: IconComponent, onHero, children }: BadgeProps) {
  return (
    <span className={cx(styles.badge, onHero && styles.onHero)} style={toneVars(tone)}>
      {IconComponent && <IconComponent size={14} weight="fill" aria-hidden />}
      {children}
    </span>
  )
}
