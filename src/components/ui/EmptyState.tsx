import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { IconBubble } from './IconBubble'
import styles from './EmptyState.module.css'
import type { Tone } from './tone'

export interface EmptyStateProps {
  /** One to three icons shown as a floating cluster. */
  icons: Array<{ icon: Icon; tone: Tone }>
  title: string
  text?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icons, title, text, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.icons}>
        {icons.slice(0, 3).map(({ icon, tone }, i) => (
          <IconBubble key={i} icon={icon} tone={tone} size={i === 0 ? 'xl' : 'lg'} />
        ))}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
