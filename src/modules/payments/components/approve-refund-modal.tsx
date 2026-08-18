import { AlertTriangle, Check, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { formatInr } from '@/modules/payments/utils/finance-mappers'
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
  /** Optional static override; otherwise retain is computed from max − refunded. */
  platformRetainAmount?: string
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
  }) => void | Promise<void>
}

export function ApproveRefundModal({ open, data, onClose, onConfirm }: ApproveRefundModalProps) {
  const [refundType, setRefundType] = useState<RefundApprovalType>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleClose = useCallback(() => {
    setRefundType('full')
    setPartialAmount('')
    setDecisionNotes('')
    setConfirmed(false)
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

  const maxRefundable = Number(data.maxRefundableAmount) || 0

  const selectedRefundAmount = useMemo(() => {
    if (refundType === 'full') return maxRefundable
    const partial = Number(String(partialAmount).replace(/,/g, ''))
    if (!partialAmount.trim() || Number.isNaN(partial) || partial < 0) return null
    return partial
  }, [maxRefundable, partialAmount, refundType])

  const retainedAmountLabel = useMemo(() => {
    if (refundType === 'full') return formatInr(0)
    if (selectedRefundAmount === null) return formatInr(maxRefundable)
    return formatInr(Math.max(0, maxRefundable - selectedRefundAmount))
  }, [maxRefundable, refundType, selectedRefundAmount])

  const displayedRefundAmount = useMemo(() => {
    if (refundType === 'full') return formatInr(maxRefundable) || data.refundAmount
    if (selectedRefundAmount === null) return '—'
    return formatInr(selectedRefundAmount)
  }, [data.refundAmount, maxRefundable, refundType, selectedRefundAmount])

  const handleConfirm = async () => {
    if (!decisionNotes.trim()) {
      toast.error('Decision notes are required')
      return
    }

    if (!confirmed) {
      toast.error('Please confirm the refund decision')
      return
    }

    if (refundType === 'partial') {
      const amount = Number(String(partialAmount).replace(/,/g, ''))
      if (!partialAmount.trim() || Number.isNaN(amount) || amount <= 0) {
        toast.error('Enter a valid partial refund amount')
        return
      }
      if (amount > maxRefundable) {
        toast.error(`Cannot exceed ${formatInr(maxRefundable)}`)
        return
      }
    }

    try {
      await onConfirm?.({ refundType, partialAmount, decisionNotes, confirmed })
      handleClose()
    } catch {
      // Parent surfaces API errors via toast
    }
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="ui-modal-shell max-h-[92dvh] max-w-xl sm:max-h-[min(92dvh,860px)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-refund-title"
      >
        <div className="ui-modal-header">
          <h2 id="approve-refund-title" className="text-h2 text-brand-text">
            Approve Dispute
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close approve dispute modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="text-center">
            <div
              className="bg-brand-positive/20 mx-auto grid size-[70px] place-items-center rounded-full"
              aria-hidden="true"
            >
              <Check className="text-brand-positive size-8" strokeWidth={2.5} />
            </div>
            <p className="text-body-md-semibold text-brand-text mx-auto mt-4 max-w-[343px] text-center">
              {refundType === 'full'
                ? 'You are about to approve a full refund for this dispute.'
                : 'You are about to approve a partial refund for this dispute.'}
            </p>
          </div>

          <div className="radius-lg bg-brand-bg space-y-3 border border-white/10 p-4">
            <DetailRow label="Dispute ID" value={data.disputeId} />
            <DetailRow label="Transaction ID" value={data.transactionId} />
            <DetailRow label="User Name" value={data.userName} />
            <DetailRow label="User ID" value={data.userId} />
            <DetailRow label="Module Type" value={data.moduleType} />
            <DetailRow label="Payment Method" value={data.paymentMethod} />
            <DetailRow label="Refund Amount" value={displayedRefundAmount} />
            <DetailRow label="Support Recommendation" value={data.supportRecommendation} />
            <DetailRow label="Reason" value={data.reason} />
          </div>

          <div className="radius-lg bg-brand-bg border border-white/10 p-4 sm:p-5">
            <h3 className="text-body-md-semibold text-brand-text">Admin Decisions</h3>

            <p className="text-body-md-medium text-brand-text mt-4">Select Refund Type</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <RadioOption
                label="Full Refund"
                checked={refundType === 'full'}
                onChange={() => {
                  setRefundType('full')
                  setPartialAmount('')
                }}
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
                inputMode="decimal"
                onChange={(event) => setPartialAmount(event.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Enter Partial Refund"
                className={cn('max-w-[382px]', refundType === 'full' && 'opacity-50')}
              />
              <p className="text-body-sm text-muted mt-2">
                Platform will retain: {retainedAmountLabel}
              </p>
            </div>

            <div className="radius-md border-brand-accent/20 bg-brand-bg mt-4 border p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="icon-sm text-brand-accent" aria-hidden="true" />
                <p className="text-body-sm-semibold text-brand-text">Validation Rules</p>
              </div>
              <ul className="text-body-sm text-brand-text/80 mt-3 space-y-2">
                <li>Cannot exceed {formatInr(maxRefundable)}</li>
                <li>Cannot be 0</li>
                <li>Remaining retained amount updates automatically ({retainedAmountLabel})</li>
              </ul>
            </div>
          </div>

          <label className="block space-y-2.5">
            <span className="text-body-sm-medium text-brand-text">Decision Notes (Mandatory)</span>
            <textarea
              value={decisionNotes}
              onChange={(event) => setDecisionNotes(event.target.value)}
              placeholder={
                refundType === 'full'
                  ? 'Provide reason for approving full refund for audit and compliance.'
                  : 'Provide reason for approving partial refund for audit and compliance.'
              }
              rows={4}
              className="ui-textarea"
            />
          </label>

          <label className="text-body-sm text-brand-text flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 rounded border-white/20 bg-transparent accent-white"
            />
            <span>I confirm that this refund decision is final and based on reviewed evidence</span>
          </label>
        </div>

        <div className="ui-modal-footer flex-col sm:flex-row">
          <button type="button" onClick={handleClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="ui-modal-btn ui-modal-btn-positive"
          >
            Confirm Decision
            <Check className="icon-sm shrink-0" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-b-0">
      <span className="text-body-md text-muted">{label}</span>
      <span className="text-body-md text-brand-text block shrink-0 text-right">{value}</span>
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
          checked ? 'border-brand-text bg-brand-text' : 'border-brand-muted bg-transparent',
        )}
      >
        {checked ? <span className="bg-brand-bg size-1.5 rounded-full" /> : null}
      </span>
      <span className="text-body-md text-brand-text">{label}</span>
    </label>
  )
}
