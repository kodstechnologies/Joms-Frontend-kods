import type { ReactNode } from 'react'
import { useState } from 'react'
import { ArrowLeft, Check, Flag, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { IssuePartialRefundModal } from '@/modules/payments/components/issue-partial-refund-modal'
import { EscalateToSuperAdminModal } from '@/modules/payments/components/escalate-to-super-admin-modal'
import { getRefundDetailById } from '@/modules/payments/mock/refund-detail.mock'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'
const textPanelClass =
  'radius-lg border border-white/[0.06] bg-brand-bg p-4 text-body-sm text-brand-text/80'

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
    <section className={cn(cardClass, 'p-5')}>
      <div className={cn('mb-3', icon && 'flex items-center gap-2')}>
        {icon}
        <h3 className={sectionTitleClass}>{title}</h3>
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
      <span className={labelClass}>{label}</span>
      <span className={cn('max-w-[60%] text-right', valueClass, valueClassName)}>{value}</span>
    </div>
  )
}

function PendingBadge() {
  return (
    <span className="text-body-sm-semibold border-brand-accent/40 bg-brand-accent/10 text-brand-accent inline-flex rounded-full border px-2.5 py-0.5">
      Pending
    </span>
  )
}

function TextBlock({ children }: { children: ReactNode }) {
  return <div className={textPanelClass}>{children}</div>
}

export function RefundDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'refund-01' } = useParams<{ id: string }>()
  const detail = getRefundDetailById(id)
  const [isPartialRefundOpen, setIsPartialRefundOpen] = useState(false)
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <Link to="/finance/refunds" className="hover:text-brand-text transition-colors">
            Refunds & Chargebacks
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="mb-4">
          <h2 className={sectionTitleClass}>Refund Details</h2>
          <p className={sectionSubtitleClass}>Provide details about your Consultation</p>
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

          <InnerCard title="Reason">
            <TextBlock>{detail.reason}</TextBlock>
          </InnerCard>

          <InnerCard title="Admin Notes">
            <TextBlock>{detail.adminNotes}</TextBlock>
          </InnerCard>
        </div>
      </section>

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="ui-cta ui-cta-secondary"
        >
          Close
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => toast.success('Refund issued')}
            className="ui-cta ui-cta-positive"
          >
            <Check className="icon-sm shrink-0" />
            Issue Refund
          </button>
          <button
            type="button"
            onClick={() => toast.error('Refund denied')}
            className="ui-cta ui-cta-negative"
          >
            <X className="icon-sm shrink-0" />
            Deny Refund
          </button>
          <button
            type="button"
            onClick={() => setIsPartialRefundOpen(true)}
            className="ui-cta ui-cta-secondary"
          >
            <Flag className="icon-sm shrink-0" />
            Partial Refund
          </button>
          <button
            type="button"
            onClick={() => setIsEscalateOpen(true)}
            className="ui-cta ui-cta-secondary"
          >
            <Flag className="icon-sm shrink-0" />
            Escalate
          </button>
        </div>
      </footer>

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
