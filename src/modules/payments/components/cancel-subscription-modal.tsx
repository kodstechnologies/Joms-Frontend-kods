import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import type { SubscriptionActionPayload } from '@/modules/payments/components/pause-subscription-modal'
import { cn } from '@/shared/lib/cn'

const REASON_OPTIONS = [
  'Unclear Image',
  'Content Issue',
  'Invalid documents',
  'Invalid PAN',
  'Invalid GST',
]

type CancelSubscriptionModalProps = {
  open: boolean
  userName: string
  onClose: () => void
  onConfirm: (payload: SubscriptionActionPayload) => Promise<void> | void
  isSubmitting?: boolean
}

type CancelSubscriptionModalFormProps = Omit<CancelSubscriptionModalProps, 'open'> & {
  onDismiss: () => void
}

function CancelSubscriptionModalForm({
  userName,
  onDismiss,
  onConfirm,
  isSubmitting = false,
}: CancelSubscriptionModalFormProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const toggleReason = (reason: string) => {
    setSelectedReasons((current) =>
      current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason],
    )
  }

  const handleSubmit = async () => {
    if (!selectedReasons.length) {
      toast.error('Select at least one reason')
      return
    }
    if (!confirmed) {
      toast.error('Please confirm before cancelling')
      return
    }
    if (!cancelReason.trim()) {
      toast.error('Cancellation reason is required')
      return
    }

    await onConfirm({
      reasons: selectedReasons,
      adminNotes: cancelReason.trim(),
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-subscription-title"
      className="ui-modal-shell max-w-[520px] p-0"
    >
      <div className="ui-modal-header">
        <h2 id="cancel-subscription-title" className="text-h4 text-brand-text">
          Cancel Subscription
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted hover:text-brand-text rounded-lg p-1 transition-colors hover:bg-white/5"
          aria-label="Close"
        >
          <X className="icon-md" />
        </button>
      </div>

      <div className="ui-modal-body">
        <div className="flex flex-col items-center text-center">
          <div className="bg-brand-danger/15 text-brand-danger grid size-16 place-items-center rounded-full">
            <X className="size-7" />
          </div>
          <p className="text-body-md text-brand-text mt-4">
            Cancel subscription for <span className="font-semibold">{userName}</span>?
          </p>
        </div>

        <div className="mt-6">
          <p className="text-body-sm-medium text-muted mb-2">Reasons</p>
          <div className="flex flex-wrap gap-2">
            {REASON_OPTIONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => toggleReason(reason)}
                className={cn(
                  'ui-modal-reason-chip',
                  selectedReasons.includes(reason)
                    ? 'ui-modal-reason-chip-selected'
                    : 'ui-modal-reason-chip-idle',
                )}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <label className="text-body-sm text-brand-text/80 mt-5 flex items-start gap-3 text-left">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="accent-brand-accent mt-0.5 rounded border-white/20"
          />
          I confirm the documents are not valid from above reasons.
        </label>

        <label className="text-body-sm text-muted mt-4 block text-left">
          Cancellation Reason (Required)
          <textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Cancellation Reason (Required)"
            rows={4}
            className="ui-textarea mt-2"
          />
        </label>
      </div>

      <div className="ui-modal-footer flex-col-reverse sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onDismiss}
          disabled={isSubmitting}
          className="ui-modal-btn ui-modal-btn-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            void handleSubmit()
          }}
          disabled={isSubmitting}
          className="ui-modal-btn ui-modal-btn-negative"
        >
          <X className="icon-sm" />
          {isSubmitting ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      </div>
    </div>
  )
}

export function CancelSubscriptionModal({
  open,
  userName,
  onClose,
  onConfirm,
  isSubmitting = false,
}: CancelSubscriptionModalProps) {
  const handleDismiss = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleDismiss()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, handleDismiss])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <CancelSubscriptionModalForm
        userName={userName}
        onDismiss={handleDismiss}
        onClose={onClose}
        onConfirm={onConfirm}
        isSubmitting={isSubmitting}
      />
    </div>,
    document.body,
  )
}
