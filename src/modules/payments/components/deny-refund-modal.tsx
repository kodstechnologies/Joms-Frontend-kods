import { IndianRupee, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type DenyRefundModalProps = {
  open: boolean
  originalAmount: string
  denyingAmount?: string
  onClose: () => void
  onSubmit?: (payload: {
    denyingAmount: string
    reason: string
    adminNotes: string
  }) => void | Promise<void>
}

const MAX_REASON_LENGTH = 150
const MAX_NOTES_LENGTH = 150

export function DenyRefundModal(props: DenyRefundModalProps) {
  if (!props.open) return null
  return <DenyRefundModalInner {...props} />
}

function DenyRefundModalInner({
  originalAmount,
  denyingAmount,
  onClose,
  onSubmit,
}: DenyRefundModalProps) {
  const [amount] = useState(() => denyingAmount || originalAmount)
  const [reason, setReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose])

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Reason is required')
      return
    }

    try {
      await onSubmit?.({ denyingAmount: amount, reason, adminNotes })
      handleClose()
    } catch {
      // submit error surfaced by parent
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={cn(
          'ui-modal-shell max-h-[92dvh] max-w-lg sm:max-h-[min(90dvh,720px)]',
          'rounded-t-[var(--brand-radius-popup)] rounded-b-none sm:rounded-[var(--brand-radius-popup)]',
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deny-refund-title"
      >
        <div className="ui-modal-header">
          <h2 id="deny-refund-title" className="text-h4 text-brand-text pr-2">
            Deny Refund
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close deny refund modal"
            className="text-muted hover:text-brand-text grid size-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4 sm:space-y-5">
          <div className="radius-lg bg-brand-bg flex items-center gap-3 border border-white/10 p-3.5 sm:gap-4 sm:p-4">
            <div className="bg-brand-bg text-muted grid size-10 shrink-0 place-items-center rounded-full border border-white/10 sm:size-11">
              <IndianRupee className="icon-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-body-md-semibold text-brand-text">Denying Refund</p>
              <p className="text-body-sm text-muted mt-0.5 break-words">
                Original amount: {originalAmount}
              </p>
            </div>
          </div>

          <Field label="Denying Amount">
            <Input value={amount} readOnly className="opacity-90" />
          </Field>

          <Field label="Reason">
            <div className="relative">
              <textarea
                value={reason}
                rows={3}
                onChange={(event) => setReason(event.target.value.slice(0, MAX_REASON_LENGTH))}
                placeholder="State Reason for Partial Refund"
                className="ui-textarea min-h-24 pb-8 sm:min-h-20"
              />
              <span className="text-body-sm text-muted pointer-events-none absolute right-3 bottom-3">
                {reason.length}/{MAX_REASON_LENGTH}
              </span>
            </div>
          </Field>

          <Field label="Admin Notes">
            <div className="relative">
              <textarea
                value={adminNotes}
                rows={4}
                onChange={(event) => setAdminNotes(event.target.value.slice(0, MAX_NOTES_LENGTH))}
                placeholder="Add internal notes (optional)"
                className="ui-textarea min-h-28 pb-8"
              />
              <span className="text-body-sm text-muted pointer-events-none absolute right-3 bottom-3">
                {adminNotes.length}/{MAX_NOTES_LENGTH}
              </span>
            </div>
          </Field>
        </div>

        <div className="ui-modal-footer flex-col-reverse sm:flex-row">
          <button type="button" onClick={handleClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="ui-modal-btn ui-modal-btn-negative"
          >
            Deny Refund
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 sm:space-y-2.5">
      <span className="text-body-md-medium text-brand-text">{label}</span>
      {children}
    </label>
  )
}
