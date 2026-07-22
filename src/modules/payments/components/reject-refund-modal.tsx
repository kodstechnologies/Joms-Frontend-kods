import { AlertCircle, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

export type RejectRefundModalData = {
  disputeId: string
  transactionId: string
  userName: string
  userId: string
  moduleType: string
  paymentMethod: string
  refundAmount: string
  supportRecommendation: string
  reason: string
  userStatement: string
  denyAmount: string
  denyFromName: string
}

type RejectRefundModalProps = {
  open: boolean
  data: RejectRefundModalData
  onClose: () => void
  onConfirm?: (payload: { rejectionReason: string; adminNotes: string; confirmed: boolean }) => void
}

const IMPORTANT_NOTICE_ITEMS = [
  'Rejecting this dispute means:',
  'No refund will be issued',
  'Dispute will be marked as Resolved – Rejected',
  'User will be notified with your explanation',
  'This action will be logged in the audit trail',
]

function ProCancelIcon({
  color = 'currentColor',
  size = 24,
  className,
}: {
  color?: string
  size?: number
  className?: string
}) {
  const innerSize = (14 / 24) * size
  const offset = (size - innerSize) / 2
  const center = innerSize / 2
  const radius = center - 0.75
  const arm = center * 0.45

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <g transform={`translate(${offset} ${offset})`}>
        <circle cx={center} cy={center} r={radius} stroke={color} strokeWidth="1.5" />
        <path
          d={`M${center - arm} ${center - arm}L${center + arm} ${center + arm}M${center + arm} ${center - arm}L${center - arm} ${center + arm}`}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

function RejectStatusIcon() {
  return (
    <div
      className="bg-brand-danger/30 mx-auto grid size-[70px] place-items-center rounded-full"
      aria-hidden="true"
    >
      <X className="text-brand-danger size-8" strokeWidth={2.5} />
    </div>
  )
}

export function RejectRefundModal({ open, data, onClose, onConfirm }: RejectRefundModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleClose = useCallback(() => {
    setRejectionReason('')
    setAdminNotes('')
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

  const handleConfirm = () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    if (!confirmed) {
      toast.error('Please confirm you have reviewed all evidence')
      return
    }

    onConfirm?.({ rejectionReason, adminNotes, confirmed })
    toast.success('Refund rejection confirmed')
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
        className="ui-modal-shell max-h-[92dvh] max-w-xl sm:max-h-[min(92dvh,860px)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-refund-title"
      >
        <div className="ui-modal-header">
          <h2 id="reject-refund-title" className="text-h2 text-brand-text">
            Reject Refund
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close reject refund modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="text-center">
            <RejectStatusIcon />
            <p className="text-body-md text-brand-text mx-auto mt-4 max-w-[343px] text-center">
              You are about to deny the refund request of{' '}
              <span className="font-semibold">{data.denyAmount}</span> from{' '}
              <span className="font-semibold">{data.denyFromName}</span>.
            </p>
          </div>

          <div className="radius-lg bg-brand-bg space-y-3 border border-white/10 p-4">
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

          <div className="space-y-2.5">
            <p className="text-body-md-semibold text-brand-text">User Statement</p>
            <div className="radius-md bg-brand-surface border border-white/10 p-4">
              <p className="text-body-md text-brand-text/80">{data.userStatement}</p>
            </div>
          </div>

          <div className="radius-md border-brand-danger/20 bg-brand-surface border p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="icon-sm text-brand-danger shrink-0" aria-hidden="true" />
              <p className="text-body-md-semibold text-brand-danger">Important Notice</p>
            </div>
            <ul className="mt-3 space-y-2 pl-4">
              {IMPORTANT_NOTICE_ITEMS.map((item) => (
                <li key={item} className="text-body-sm text-brand-text/80 list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">
              Rejection Reason (Required)
            </span>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter Text Here"
              rows={3}
              className="ui-textarea min-h-[88px]"
            />
          </label>

          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">Admin Notes</span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Enter Text Here"
              rows={3}
              className="ui-textarea min-h-[88px]"
            />
          </label>

          <label className="text-body-sm text-brand-text flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="accent-brand-accent mt-1 rounded border-white/20 bg-transparent"
            />
            <span>I confirm I have reviewed all evidence before rejecting this dispute.</span>
          </label>
        </div>

        <div className="ui-modal-footer flex-col sm:flex-row">
          <button type="button" onClick={handleClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="ui-modal-btn ui-modal-btn-negative"
          >
            Confirm Rejection
            <ProCancelIcon color="currentColor" size={24} />
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
