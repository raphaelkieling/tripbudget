import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'muted' | 'hero'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ variant = 'surface', padding = 'md', className, ...rest }: CardProps) {
  return (
    <div
      className={cx(styles.card, variant !== 'surface' && styles[variant], padding !== 'none' && styles[`pad-${padding}`], className)}
      {...rest}
    />
  )
}
