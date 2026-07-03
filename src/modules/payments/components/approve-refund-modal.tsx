import { AlertTriangle, Check, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

export type RefundApprovalType = 'full' | 'partial'

export type ApproveRefundModalData = {
  disputeId: string
  transactionId: string
  userName: string
  userId: string
  moduleType: string
  paymentMethod: string
  refundAmount: string
  supportRecommendation: string
  reason: string
  maxRefundableAmount: number
  platformRetainAmount: string
}

type ApproveRefundModalProps = {
  open: boolean
  data: ApproveRefundModalData
  onClose: () => void
  onConfirm?: (payload: {
    refundType: RefundApprovalType
    partialAmount: string
    decisionNotes: string
    confirmed: boolean
  }) => void
}

const partialRefundInputClass =
  'h-[38px] w-full max-w-[382px] rounded-[10px] border-0 bg-[#141414] px-4 font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white placeholder:text-[#666666] focus-visible:ring-1 focus-visible:ring-white/20'

const confirmButtonClass =
  'inline-flex h-10 w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#00A63E] p-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-[#050505] transition-colors hover:bg-[#009636] sm:ml-auto sm:w-[238px]'

const outlineButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5'

export function ApproveRefundModal({ open, data, onClose, onConfirm }: ApproveRefundModalProps) {
  const [refundType, setRefundType] = useState<RefundApprovalType>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleClose = useCallback(() => {
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

  useEffect(() => {
    if (open) {
      setRefundType('full')
      setPartialAmount('')
      setDecisionNotes('')
      setConfirmed(false)
    }
  }, [open])

  const retainedAmount = useMemo(() => {
    if (refundType === 'full') return data.platformRetainAmount
    const partial = Number(partialAmount.replace(/,/g, ''))
    if (Number.isNaN(partial)) return data.platformRetainAmount
    return data.platformRetainAmount
  }, [data.platformRetainAmount, partialAmount, refundType])

  const handleConfirm = () => {
    if (!decisionNotes.trim()) {
      toast.error('Decision notes are required')
      return
    }

    if (!confirmed) {
      toast.error('Please confirm the refund decision')
      return
    }

    if (refundType === 'partial') {
      const amount = Number(partialAmount.replace(/,/g, ''))
      if (!partialAmount.trim() || Number.isNaN(amount) || amount <= 0) {
        toast.error('Enter a valid partial refund amount')
        return
      }
      if (amount > data.maxRefundableAmount) {
        toast.error(`Cannot exceed ₹${data.maxRefundableAmount.toLocaleString('en-IN')}`)
        return
      }
    }

    onConfirm?.({ refundType, partialAmount, decisionNotes, confirmed })
    toast.success('Refund decision confirmed')
    handleClose()
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={cn(
          'flex w-full max-w-xl flex-col rounded-2xl border border-white/[0.08] bg-[#1A1A1A] shadow-2xl',
          'max-h-[92dvh] sm:max-h-[min(92dvh,860px)]',
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-refund-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="approve-refund-title"
            className="font-figtree text-[24px] font-semibold leading-6 tracking-normal text-white"
          >
            Approve Refund
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close approve refund modal"
            className="grid size-9 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-5">
            <div className="text-center">
              <div
                className="mx-auto grid size-[70px] place-items-center rounded-full bg-[#00A63E33]"
                aria-hidden="true"
              >
                <Check className="size-8 text-[#00A63E]" strokeWidth={2.5} />
              </div>
              <p className="mx-auto mt-4 max-w-[343px] text-center font-figtree text-[14px] font-semibold leading-6 tracking-normal text-white">
                {refundType === 'full'
                  ? 'You are about to approve a full refund for this dispute.'
                  : 'You are about to approve a partial refund for this dispute.'}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-[#121212] p-4">
              <DetailRow label="Dispute ID" value={data.disputeId} />
              <DetailRow label="Transaction ID" value={data.transactionId} />
              <DetailRow label="User Name" value={data.userName} />
              <DetailRow label="User ID" value={data.userId} />
              <DetailRow label="Module Type" value={data.moduleType} />
              <DetailRow label="Payment Method" value={data.paymentMethod} />
              <DetailRow label="Refund Amount" value={data.refundAmount} />
              <DetailRow label="Support Recommendation" value={data.supportRecommendation} />
              <DetailRow label="Reason" value={data.reason} />
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 sm:p-5">
              <h3 className="font-figtree text-[14px] font-semibold leading-[20px] tracking-normal text-white">
                Admin Decisions
              </h3>

              <p className="mt-4 font-figtree text-[14px] font-medium leading-[20px] tracking-normal text-white">
                Select Refund Type
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <RadioOption
                  label="Full Refund"
                  checked={refundType === 'full'}
                  onChange={() => setRefundType('full')}
                />
                <RadioOption
                  label="Partial Refund"
                  checked={refundType === 'partial'}
                  onChange={() => setRefundType('partial')}
                />
              </div>

              <div className="mt-4">
                <Input
                  value={partialAmount}
                  disabled={refundType === 'full'}
                  onChange={(event) => setPartialAmount(event.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="Enter Partial Refund"
                  className={cn(
                    partialRefundInputClass,
                    refundType === 'full' && 'opacity-50',
                  )}
                />
                <p className="mt-2 text-[11px] text-[#666666]">Platform will retain: {retainedAmount}</p>
              </div>

              <div className="mt-4 rounded-lg border border-amber-500/20 bg-[#0F0F0F] p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-400" aria-hidden="true" />
                  <p className="text-[12px] font-semibold text-white">Validation Rules</p>
                </div>
                <ul className="mt-3 space-y-2 text-[11px] text-[#CCCCCC]">
                  <li>Cannot exceed ₹{data.maxRefundableAmount.toLocaleString('en-IN')}</li>
                  <li>Cannot be 0</li>
                  <li>Show remaining retained amount automatically</li>
                </ul>
              </div>
            </div>

            <label className="block space-y-2.5">
              <span className="text-[12px] font-medium text-white">Decision Notes (Mandatory)</span>
              <textarea
                value={decisionNotes}
                onChange={(event) => setDecisionNotes(event.target.value)}
                placeholder="Provide reason for approving full/partial refund for audit and compliance."
                rows={4}
                className="min-h-28 w-full resize-none rounded-lg border border-white/[0.06] bg-[#0F0F0F] px-4 py-3 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 rounded border-slate-600 bg-transparent"
              />
              <span className="text-[12px] leading-relaxed text-white">
                I confirm that this refund decision is final and based on reviewed evidence
              </span>
            </label>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-3 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-2 sm:px-6 sm:py-5">
          <button type="button" onClick={handleClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className={confirmButtonClass}>
            Confirm Decision
            <Check className="size-[16.67px] shrink-0 text-[#050505]" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const detailLabelClass =
  'font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-[#888888]'

const detailValueClass =
  'block shrink-0 text-right font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-b-0">
      <span className={detailLabelClass}>{label}</span>
      <span className={detailValueClass}>{value}</span>
    </div>
  )
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5">
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={cn(
          'grid size-4 place-items-center rounded-full border-2',
          checked ? 'border-white bg-white' : 'border-[#666666] bg-transparent',
        )}
      >
        {checked ? <span className="size-1.5 rounded-full bg-black" /> : null}
      </span>
      <span className="font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white">
        {label}
      </span>
    </label>
  )
}
