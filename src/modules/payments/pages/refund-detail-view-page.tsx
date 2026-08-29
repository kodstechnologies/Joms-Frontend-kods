import type { ReactNode } from 'react'
import { useState } from 'react'
import { ArrowLeft, Check, Flag, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { DenyRefundModal } from '@/modules/payments/components/deny-refund-modal'
import { IssuePartialRefundModal } from '@/modules/payments/components/issue-partial-refund-modal'
import { IssueRefundModal } from '@/modules/payments/components/issue-refund-modal'
import {
  useFinanceRefund,
  useIssueRefund,
  useRejectRefund,
} from '@/modules/payments/hooks/use-finance'
import {
  formatDate,
  formatInr,
  mapRefundStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import { DetailViewSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
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

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Processed' || status === 'Resolved'
      ? 'border-brand-positive/40 bg-brand-positive/10 text-brand-positive'
      : status === 'Rejected'
        ? 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger'
        : 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'

  return (
    <span
      className={cn('text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5', tone)}
    >
      {status}
    </span>
  )
}

function TextBlock({ children }: { children: ReactNode }) {
  return <div className={textPanelClass}>{children}</div>
}

export function RefundDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useFinanceRefund(id)
  const issueMutation = useIssueRefund()
  const rejectMutation = useRejectRefund()
  const refund = data?.data
  const [isIssueRefundOpen, setIsIssueRefundOpen] = useState(false)
  const [isDenyRefundOpen, setIsDenyRefundOpen] = useState(false)
  const [isPartialRefundOpen, setIsPartialRefundOpen] = useState(false)

  const apiErrorMessage = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

  if (isLoading) {
    return <DetailViewSkeleton pillCount={6} cardCount={2} />
  }

  if (isError || !refund) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Refund not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Refunds
        </button>
      </div>
    )
  }

  const amountLabel = formatInr(refund.amount)
  const requestedBy = titleCase(refund.beneficiary) || '—'
  const canAct = refund.status === 'initiated' || refund.status === 'failed'

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Refund Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <Link to="/finance/refunds" className="hover:text-brand-text transition-colors">
            Refunds & Chargebacks
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Refund Details</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <InnerCard title="Refund Information">
          <DetailRow label="Refund ID" value={refund.refundId} />
          <DetailRow label="Transaction ID" value={String(refund.paymentId || '—')} />
          <DetailRow label="Requested Date" value={formatDate(refund.createdAt)} />
          <DetailRow
            label="Status"
            value={<StatusBadge status={mapRefundStatus(refund.status)} />}
          />
        </InnerCard>

        <InnerCard title="Payment Context">
          <DetailRow label="Requested By" value={requestedBy} />
          <DetailRow label="Service / Module" value={titleCase(refund.module)} />
          <DetailRow label="Refund Amount" value={amountLabel} />
          <DetailRow label="Payment Method" value={refund.refundMode || 'Razorpay'} />
          <DetailRow label="Refund Type" value={titleCase(refund.refundType)} />
        </InnerCard>
      </div>

      <InnerCard title="Reason">
        <TextBlock>{refund.reason || '—'}</TextBlock>
      </InnerCard>

      <InnerCard title="Admin Notes">
        <TextBlock>{refund.adminNote || '—'}</TextBlock>
      </InnerCard>

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="ui-cta ui-cta-secondary"
        >
          Close
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="ui-cta ui-cta-positive"
            disabled={!canAct || issueMutation.isPending}
            onClick={() => setIsIssueRefundOpen(true)}
          >
            <Check className="size-4" />
            Issue Refund
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-negative"
            disabled={!canAct || rejectMutation.isPending}
            onClick={() => setIsDenyRefundOpen(true)}
          >
            <X className="size-4" />
            Deny Refund
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-secondary"
            disabled={!canAct || issueMutation.isPending}
            onClick={() => setIsPartialRefundOpen(true)}
          >
            <Flag className="size-4" />
            Partial Refund
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-secondary"
            disabled={!canAct}
            onClick={() =>
              navigate(
                escalateUrl(id, {
                  kind: 'refund',
                  resourceType: 'Refund',
                  returnTo: `/finance/refunds/${id}`,
                }),
              )
            }
          >
            <Flag className="size-4" />
            Escalate
          </button>
        </div>
      </footer>

      <IssueRefundModal
        open={isIssueRefundOpen}
        originalAmount={amountLabel}
        maxRefundableAmount={refund.amount}
        defaultAmount={String(refund.amount)}
        onClose={() => setIsIssueRefundOpen(false)}
        onSubmit={async ({ refundAmount, reason, adminNotes }) => {
          try {
            await issueMutation.mutateAsync({
              id,
              amount: Number(String(refundAmount).replace(/,/g, '')),
              reason,
              adminNotes,
            })
            toast.success('Refund issued')
            setIsIssueRefundOpen(false)
            void refetch()
            navigate('/finance/refunds')
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to issue refund'))
            throw err
          }
        }}
      />
      <DenyRefundModal
        open={isDenyRefundOpen}
        originalAmount={amountLabel}
        denyingAmount={amountLabel}
        onClose={() => setIsDenyRefundOpen(false)}
        onSubmit={async ({ reason, adminNotes }) => {
          try {
            await rejectMutation.mutateAsync({ id, reason, adminNotes })
            toast.success('Refund denied')
            setIsDenyRefundOpen(false)
            void refetch()
            navigate('/finance/refunds')
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to deny refund'))
            throw err
          }
        }}
      />
      <IssuePartialRefundModal
        open={isPartialRefundOpen}
        originalAmount={amountLabel}
        maxRefundableAmount={refund.amount}
        onClose={() => setIsPartialRefundOpen(false)}
        onSubmit={async ({ refundAmount, reason, adminNotes }) => {
          try {
            await issueMutation.mutateAsync({
              id,
              amount: Number(String(refundAmount).replace(/,/g, '')),
              reason,
              adminNotes,
            })
            toast.success('Partial refund issued')
            setIsPartialRefundOpen(false)
            void refetch()
            navigate('/finance/refunds')
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to issue partial refund'))
            throw err
          }
        }}
      />
    </div>
  )
}
