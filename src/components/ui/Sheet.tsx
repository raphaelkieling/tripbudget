import { XIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import styles from './Sheet.module.css'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Bottom sheet on phones, centered dialog on larger screens.
 * Built on <dialog> for focus trapping, Esc to close and accessibility.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const openRef = useRef(open)
  const titleId = useId()

  useEffect(() => {
    openRef.current = open
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-labelledby={titleId}
      // The native close event also fires when we close it because `open`
      // turned false; only report user-initiated closes (Esc).
      onClose={() => openRef.current && onClose()}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {open && (
        <>
          <div className={styles.handle} />
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <Button variant="ghost" size="sm" icon={XIcon} iconOnly onClick={onClose}>
              Close
            </Button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </>
      )}
    </dialog>
  )
}
