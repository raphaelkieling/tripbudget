import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
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

export function ConfirmSheet({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmSheetProps) {
  const { t } = useI18n()
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel ?? t.common.delete}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--color-ink-soft)' }}>{message}</p>
    </Sheet>
  )
}
