import type { ReactNode } from 'react'
import { useState } from 'react'
import { ArrowLeft, Check, Clock, Flag, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { IssuePartialRefundModal } from '@/modules/payments/components/issue-partial-refund-modal'
import { EscalateToSuperAdminModal } from '@/modules/payments/components/escalate-to-super-admin-modal'
import { getRefundDetailById } from '@/modules/payments/mock/refund-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

function InnerCard({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-[14px] font-bold text-white">{title}</h3>
      </div>
      <div className="mb-4 border-b border-white/5" />
      {children}
    </section>
  )
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span
        className={cn('max-w-[60%] text-right text-[12px] font-medium text-white', valueClassName)}
      >
        {value}
      </span>
    </div>
  )
}

function PendingBadge() {
  return (
    <span className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
      Pending
    </span>
  )
}

function TextBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0F0F0F] p-4 text-[12px] leading-relaxed text-[#CCCCCC]">
      {children}
    </div>
  )
}

export function RefundDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'refund-01' } = useParams<{ id: string }>()
  const detail = getRefundDetailById(id)
  const [isPartialRefundOpen, setIsPartialRefundOpen] = useState(false)
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/refunds" className="transition-colors hover:text-white">
            Refunds & Chargebacks
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Payment View Details</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
        <div className="mb-4">
          <h2 className="text-[14px] font-bold text-white">Refund Details</h2>
          <p className="mt-1 text-[12px] text-[#888888]">Provide details about your Consultation</p>
        </div>
        <div className="mb-5 border-b border-white/5" />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <InnerCard title="Refund Information">
            <DetailRow label="Refund ID" value={detail.refundInformationPrimary.refundId} />
            <DetailRow
              label="Transaction ID"
              value={detail.refundInformationPrimary.transactionId}
            />
            <DetailRow
              label="Requested Date"
              value={detail.refundInformationPrimary.requestedDate}
            />
            <DetailRow label="Status" value={<PendingBadge />} />
          </InnerCard>

          <InnerCard title="Refund Information">
            <DetailRow label="Requested By" value={detail.refundInformationSecondary.requestedBy} />
            <DetailRow label="Service" value={detail.refundInformationSecondary.service} />
            <DetailRow
              label="Refund Amount"
              value={detail.refundInformationSecondary.refundAmount}
            />
            <DetailRow
              label="Payment Method"
              value={detail.refundInformationSecondary.paymentMethod}
            />
          </InnerCard>

          <InnerCard
            title="Reason"
            icon={<Clock className="size-4 text-[#888888]" aria-hidden="true" />}
          >
            <TextBlock>{detail.reason}</TextBlock>
          </InnerCard>

          <InnerCard
            title="Admin Notes"
            icon={<Clock className="size-4 text-[#888888]" aria-hidden="true" />}
          >
            <TextBlock>{detail.adminNotes}</TextBlock>
          </InnerCard>
        </div>

        <footer className="mt-5 flex flex-col gap-3 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          >
            Close
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => toast.success('Refund issued')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <Check className="size-4" />
              Issue Refund
            </button>
            <button
              type="button"
              onClick={() => toast.error('Refund denied')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              <X className="size-4" />
              Deny Refund
            </button>
            <Button variant="secondary" onClick={() => setIsPartialRefundOpen(true)}>
              <Flag className="size-4" />
              Partial Refund
            </Button>
            <Button variant="secondary" onClick={() => setIsEscalateOpen(true)}>
              <Flag className="size-4" />
              Escalate
            </Button>
          </div>
        </footer>
      </section>

      <IssuePartialRefundModal
        open={isPartialRefundOpen}
        originalAmount={detail.refundInformationSecondary.refundAmount}
        maxRefundableAmount={detail.refundInformationSecondary.maxRefundableAmount}
        onClose={() => setIsPartialRefundOpen(false)}
      />

      <EscalateToSuperAdminModal
        open={isEscalateOpen}
        refundId={detail.refundInformationPrimary.refundId}
        requestedBy={detail.refundInformationSecondary.requestedBy}
        amount={detail.refundInformationSecondary.refundAmount}
        onClose={() => setIsEscalateOpen(false)}
        onSubmit={() => navigate(`/finance/refunds/${id}/escalate`)}
      />
    </div>
  )
}
