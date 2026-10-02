import type { Icon } from '@phosphor-icons/react'
import type { ToneKey } from '../../domain/appearance'
import { cx } from '../../lib/cx'
import styles from './IconBubble.module.css'
import { toneVars } from './tone'

type Size = 'sm' | 'md' | 'lg' | 'xl'
const iconSize: Record<Size, number> = { sm: 20, md: 24, lg: 34, xl: 48 }

export interface IconBubbleProps {
  icon: Icon
  tone?: ToneKey
  size?: Size
  className?: string
}

export function IconBubble({ icon: IconComponent, tone = 'violet', size = 'md', className }: IconBubbleProps) {
  return (
    <span className={cx(styles.bubble, styles[size], className)} style={toneVars(tone)} aria-hidden>
      <IconComponent size={iconSize[size]} weight="duotone" />
    </span>
  )
}
