import { Pause, X } from 'lucide-react'
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

type PauseSubscriptionModalProps = {
  open: boolean
  userName: string
  onClose: () => void
  onConfirm?: () => void
}

export function PauseSubscriptionModal({
  open,
  userName,
  onClose,
  onConfirm,
}: PauseSubscriptionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, handleClose])

  useEffect(() => {
    if (open) {
      setSelectedReason(null)
      setConfirmed(false)
      setAdminNotes('')
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-subscription-title"
        className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="pause-subscription-title" className="text-[18px] font-bold text-white">
            Pause Subscription
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-full bg-amber-500/15 text-amber-400">
            <Pause className="size-7" />
          </div>
          <p className="mt-4 text-[14px] text-white">
            Pause subscription for <span className="font-semibold">{userName}</span>?
          </p>
          <p className="mt-1 text-[12px] text-[#888888]">
            Billing will be paused and can be resumed later.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {REASON_OPTIONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setSelectedReason(reason)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                selectedReason === reason
                  ? 'border-[#F0C27B] bg-[#F0C27B]/15 text-[#F0C27B]'
                  : 'border-white/10 bg-black/30 text-[#888888] hover:border-white/20 hover:text-white',
              )}
            >
              {reason}
            </button>
          ))}
        </div>

        <label className="mt-5 flex items-start gap-3 text-left text-[12px] text-[#CCCCCC]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-0.5 rounded border-white/20"
          />
          I confirm the documents are not appropriate due to above reasons.
        </label>

        <textarea
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          placeholder="Admin notes"
          rows={4}
          className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[13px] text-white placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-white/20"
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.()
              toast.success('Subscription paused (static preview)')
              handleClose()
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F0C27B] px-5 text-sm font-semibold text-[#050505] transition-colors hover:bg-[#e5b56e]"
          >
            <Pause className="size-4" />
            Pause Subscription
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
