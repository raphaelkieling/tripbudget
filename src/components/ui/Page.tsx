import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Page.module.css'
import { ThemeToggle } from './ThemeToggle'

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx(styles.page, className)}>{children}</main>
}

export function TopBar({ leading, title, actions }: { leading?: ReactNode; title?: ReactNode; actions?: ReactNode }) {
  return (
    <header className={styles.topBar}>
      {leading}
      <h1 className={styles.topBarTitle}>{title}</h1>
      <div className={styles.actions}>
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}

export function Section({ title, icon: IconComponent, children }: { title: string; icon?: Icon; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {IconComponent && <IconComponent size={22} weight="duotone" aria-hidden />}
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Floating action button container, pinned bottom-right. */
export function Fab({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.fab, className)}>{children}</div>
}
