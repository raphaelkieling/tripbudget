import type { ReactNode } from 'react'
import { Button } from './Button'
import { Sheet } from './Sheet'

export interface ConfirmSheetProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmSheet({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }: ConfirmSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--color-ink-soft)' }}>{message}</p>
    </Sheet>
  )
}
