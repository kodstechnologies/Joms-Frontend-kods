import { IndianRupee, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type IssuePartialRefundModalProps = {
  open: boolean
  originalAmount: string
  maxRefundableAmount: number
  onClose: () => void
  onSubmit?: (payload: { refundAmount: string; reason: string; adminNotes: string }) => void
}

const fieldInputClass =
  'h-11 w-full rounded-lg border border-white/[0.06] bg-[#0F0F0F] px-4 text-sm text-white placeholder:text-[#666666] focus-visible:ring-1 focus-visible:ring-white/20'

const MAX_REASON_LENGTH = 150
const MAX_NOTES_LENGTH = 150

const footerButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'

export function IssuePartialRefundModal({
  open,
  originalAmount,
  maxRefundableAmount,
  onClose,
  onSubmit,
}: IssuePartialRefundModalProps) {
  const [refundAmount, setRefundAmount] = useState('')
  const [reason, setReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
    setRefundAmount('')
    setReason('')
    setAdminNotes('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

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
  }, [open, handleClose])

  const handleSubmit = () => {
    const amount = Number(refundAmount.replace(/,/g, ''))

    if (!refundAmount.trim()) {
      toast.error('Refund amount is required')
      return
    }

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid refund amount')
      return
    }

    if (amount > maxRefundableAmount) {
      toast.error(`Maximum refundable amount is ${originalAmount}`)
      return
    }

    onSubmit?.({ refundAmount, reason, adminNotes })
    toast.success('Partial refund issued')
    handleClose()
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={cn(
          'flex w-full max-w-lg flex-col border border-white/[0.08] bg-[#1A1A1A] shadow-2xl',
          'max-h-[92dvh] sm:max-h-[min(90dvh,720px)]',
          'rounded-t-2xl sm:rounded-2xl',
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-partial-refund-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="issue-partial-refund-title"
            className="pr-2 text-[15px] leading-snug font-bold text-white sm:text-[16px]"
          >
            Issue Partial Refund
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close partial refund modal"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#121212] p-3.5 sm:gap-4 sm:p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-[#0F0F0F] text-[#888888] sm:size-11">
                <IndianRupee className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">Partial Refund</p>
                <p className="mt-0.5 text-[12px] break-words text-[#888888]">
                  Original amount: {originalAmount}
                </p>
              </div>
            </div>

            <Field label="Refund Amount (Required)">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-[#888888]">
                  ₹
                </span>
                <Input
                  value={refundAmount}
                  inputMode="decimal"
                  onChange={(event) => setRefundAmount(event.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="Enter Refund Amount"
                  className={cn(fieldInputClass, 'pl-8')}
                />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#666666]">
                Maximum refundable amount: {originalAmount}
              </p>
            </Field>

            <Field label="Reason">
              <div className="relative">
                <textarea
                  value={reason}
                  rows={3}
                  onChange={(event) => setReason(event.target.value.slice(0, MAX_REASON_LENGTH))}
                  placeholder="State Reason for Partial Refund"
                  className="min-h-24 w-full resize-none rounded-lg border border-white/[0.06] bg-[#0F0F0F] px-4 py-3 pb-8 text-sm text-white placeholder:text-[#666666] focus:ring-1 focus:ring-white/20 focus:outline-none sm:min-h-20"
                />
                <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-[#666666]">
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
                  placeholder="Enter Text Here"
                  className="min-h-28 w-full resize-none rounded-lg border border-white/[0.06] bg-[#0F0F0F] px-4 py-3 pb-8 text-sm text-white placeholder:text-[#666666] focus:ring-1 focus:ring-white/20 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-[#666666]">
                  {adminNotes.length}/{MAX_NOTES_LENGTH}
                </span>
              </div>
            </Field>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
          <div className="flex flex-col-reverse gap-3 sm:grid sm:grid-cols-2">
            <button type="button" onClick={handleClose} className={footerButtonClass}>
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className={footerButtonClass}>
              Issue Refund
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 sm:space-y-2.5">
      <span className="text-[13px] font-medium text-white">{label}</span>
      {children}
    </label>
  )
}
