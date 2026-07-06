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
  onConfirm?: (payload: {
    rejectionReason: string
    adminNotes: string
    confirmed: boolean
  }) => void
}

const textareaClass =
  'min-h-[88px] w-full resize-none rounded-[10px] border-0 bg-[#141414] px-4 py-3 font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-white/20'

const outlineButtonClass =
  'inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-white/20 bg-transparent px-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-white transition-colors hover:bg-white/5'

const confirmRejectionButtonClass =
  'inline-flex h-10 w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#D3191C] p-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-white transition-colors hover:bg-[#B81417] sm:ml-auto sm:w-[238px]'

const detailLabelClass =
  'font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-[#888888]'

const detailValueClass =
  'block shrink-0 text-right font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white'

const IMPORTANT_NOTICE_ITEMS = [
  'Rejecting this dispute means:',
  'No refund will be issued',
  'Dispute will be marked as Resolved – Rejected',
  'User will be notified with your explanation',
  'This action will be logged in the audit trail',
]

function ProCancelIcon({
  color = '#D3191C',
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
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth="1.5"
        />
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
      className="mx-auto grid size-[70px] place-items-center rounded-full bg-[#D3191C4D]"
      aria-hidden="true"
    >
      <X className="size-8 text-[#D3191C]" strokeWidth={2.5} />
    </div>
  )
}

export function RejectRefundModal({ open, data, onClose, onConfirm }: RejectRefundModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
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
      setRejectionReason('')
      setAdminNotes('')
      setConfirmed(false)
    }
  }, [open])

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
        className={cn(
          'flex w-full max-w-xl flex-col rounded-2xl border border-white/[0.08] bg-[#1A1A1A] shadow-2xl',
          'max-h-[92dvh] sm:max-h-[min(92dvh,860px)]',
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-refund-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="reject-refund-title"
            className="font-figtree text-[24px] font-semibold leading-6 tracking-normal text-white"
          >
            Reject Refund
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close reject refund modal"
            className="grid size-9 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-5">
            <div className="text-center">
              <RejectStatusIcon />
              <p className="mx-auto mt-4 max-w-[343px] text-center font-figtree text-[14px] font-normal leading-6 tracking-normal text-white">
                You are about to deny the refund request of{' '}
                <span className="font-semibold">{data.denyAmount}</span> from{' '}
                <span className="font-semibold">{data.denyFromName}</span>.
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

            <div className="space-y-2.5">
              <p className="font-figtree text-[14px] font-semibold leading-[20px] text-white">
                User Statement
              </p>
              <div className="rounded-[10px] border border-white/[0.06] bg-[#141414] p-4">
                <p className="font-figtree text-[14px] font-normal leading-[20px] text-[#CCCCCC]">
                  {data.userStatement}
                </p>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#D3191C]/20 bg-[#141414] p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-[#D3191C]" aria-hidden="true" />
                <p className="font-figtree text-[14px] font-semibold leading-[20px] text-[#D3191C]">
                  Important Notice
                </p>
              </div>
              <ul className="mt-3 space-y-2 pl-4">
                {IMPORTANT_NOTICE_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="list-disc font-figtree text-[12px] font-normal leading-[20px] text-[#CCCCCC]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <label className="block space-y-2.5">
              <span className="font-figtree text-[14px] font-semibold leading-[20px] text-white">
                Rejection Reason (Required)
              </span>
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Enter Text Here"
                rows={3}
                className={textareaClass}
              />
            </label>

            <label className="block space-y-2.5">
              <span className="font-figtree text-[14px] font-semibold leading-[20px] text-white">
                Admin Notes
              </span>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                placeholder="Enter Text Here"
                rows={3}
                className={textareaClass}
              />
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 rounded border-slate-600 bg-transparent"
              />
              <span className="font-figtree text-[12px] font-normal leading-[20px] text-white">
                I confirm I have reviewed all evidence before rejecting this dispute.
              </span>
            </label>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-3 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-2 sm:px-6 sm:py-5">
          <button type="button" onClick={handleClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className={confirmRejectionButtonClass}>
            Confirm Rejection
            <ProCancelIcon color="#FFFFFF" size={24} />
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
      <span className={detailLabelClass}>{label}</span>
      <span className={detailValueClass}>{value}</span>
    </div>
  )
}
