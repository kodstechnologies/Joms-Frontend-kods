import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap'

type BaseModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  className?: string
  bodyClassName?: string
  showClose?: boolean
}>

export function BaseModal({
  open,
  title,
  onClose,
  children,
  className,
  bodyClassName,
  showClose = true,
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocusTrap(open, onClose, dialogRef)

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-modal-title"
        className={cn('ui-modal-shell', className)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="base-modal-title" className="text-h2 text-brand-text">
            {title}
          </h2>
          {showClose ? (
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="icon-lg" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className={cn('ui-modal-body', bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}
