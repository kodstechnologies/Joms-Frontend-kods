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
      className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="cancel-subscription-title" className="text-[18px] font-bold text-white">
          Cancel Subscription
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-full bg-rose-500/15 text-rose-400">
          <X className="size-7" />
        </div>
        <p className="mt-4 text-[14px] text-white">
          Cancel subscription for <span className="font-semibold">{userName}</span>?
        </p>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[12px] font-medium text-[#888888]">Reasons</p>
        <div className="flex flex-wrap gap-2">
          {REASON_OPTIONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => toggleReason(reason)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                selectedReasons.includes(reason)
                  ? 'border-[#EBC38C] bg-[#EBC38C] text-[#111111]'
                  : 'border-white/20 bg-transparent text-white hover:border-white/40',
              )}
            >
              {reason}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 text-left text-[12px] text-[#CCCCCC]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 rounded border-white/20"
        />
        I confirm the documents are not valid from above reasons.
      </label>

      <label className="mt-4 block text-left text-[12px] text-[#888888]">
        Cancellation Reason (Required)
        <textarea
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          placeholder="Cancellation Reason (Required)"
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[13px] text-white placeholder:text-[#666666] focus:ring-1 focus:ring-rose-400/40 focus:outline-none"
        />
      </label>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onDismiss}
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            void handleSubmit()
          }}
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
        >
          <X className="size-4" />
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
