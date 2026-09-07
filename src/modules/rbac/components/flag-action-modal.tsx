import { Flag, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

const REASON_OPTIONS = [
  'Unclear Image',
  'Content Issue',
  'Invalid documents',
  'Invalid PAN',
  'Invalid GST',
]

type FlagActionModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (payload: { reasons: string[]; note: string }) => Promise<void> | void
  isSubmitting?: boolean
}

type FlagActionModalFormProps = {
  onDismiss: () => void
  onConfirm: FlagActionModalProps['onConfirm']
  isSubmitting?: boolean
}

function FlagActionModalForm({
  onDismiss,
  onConfirm,
  isSubmitting = false,
}: FlagActionModalFormProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [flagReason, setFlagReason] = useState('')

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
      toast.error('Please confirm before flagging')
      return
    }
    if (!flagReason.trim()) {
      toast.error('Flag reason is required')
      return
    }

    await onConfirm({
      reasons: selectedReasons,
      note: flagReason.trim(),
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-action-title"
      className="ui-modal-shell max-w-[520px] p-0"
    >
      <div className="ui-modal-header">
        <h2 id="flag-action-title" className="text-h4 text-brand-text">
          Flag Action
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
          <div className="flag-action-icon">
            <Flag className="size-7" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-body-md text-brand-text mt-4">
            Are you sure you want to Flag this action ?
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

        <label className="flag-action-confirm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="flag-action-checkbox"
          />
          <span>I confirm the documents are not approved due to above reasons.</span>
        </label>

        <label className="flag-action-reason-label">
          Cancellation Reason (Required)
          <textarea
            value={flagReason}
            onChange={(event) => setFlagReason(event.target.value)}
            rows={4}
            className="ui-textarea flag-action-textarea mt-2"
          />
        </label>
      </div>

      <div className="ui-modal-footer flex-col-reverse sm:flex-row">
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
          {isSubmitting ? 'Flagging...' : 'Flag Action'}
          <X className="icon-sm" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function FlagActionModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: FlagActionModalProps) {
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
      <FlagActionModalForm
        onDismiss={handleDismiss}
        onConfirm={onConfirm}
        isSubmitting={isSubmitting}
      />
    </div>,
    document.body,
  )
}
