import type { ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getPaymentDetailById } from '@/modules/payments/mock/payment-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(cardClass, 'p-5')}>
      <h2 className={cn(sectionTitleClass, 'mb-4')}>{title}</h2>
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
      <span className={cn('text-right', valueClass, valueClassName)}>{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Successful') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function PaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'rev-01' } = useParams<{ id: string }>()
  const detail = getPaymentDetailById(id)

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/revenue')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/revenue" className="hover:text-brand-text transition-colors">
            Revenue Overview
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={sectionTitleClass}>{detail.serviceTitle}</h2>
            <p className={sectionSubtitleClass}>{detail.serviceDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.message('Download report coming soon')}>
              <Download className="size-4" />
              Download Report
            </Button>
            <Button
              variant="secondary"
              className="border-brand-accent/60 text-brand-accent hover:border-brand-accent hover:bg-brand-accent/10 bg-transparent"
              onClick={() => toast.message('Add notes coming soon')}
            >
              <SquarePen className="size-4" />
              Add Notes
            </Button>
            <Button
              variant="secondary"
              className="border-brand-accent/60 text-brand-accent hover:border-brand-accent hover:bg-brand-accent/10 bg-transparent"
              onClick={() => toast.message('Escalate coming soon')}
            >
              <SquarePen className="size-4" />
              Escalate
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailCard title="Revenue Information">
            <DetailRow label="Revenue ID" value={detail.revenueId} />
            <DetailRow label="Source Module" value={detail.sourceModule} />
            <DetailRow label="Source Type" value={detail.sourceType} />
            <DetailRow label="Source ID" value={detail.sourceId} />
            <DetailRow label="Source Name" value={detail.sourceName} />
            <DetailRow label="Host / Owner" value={detail.hostOwner} />
            <DetailRow label="Transaction Date" value={detail.transactionDate} />
            <DetailRow label="Currency" value={detail.currency} />
            <DetailRow
              label="Payment Status"
              value={
                <span
                  className={cn(
                    'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
                    getStatusBadgeClass(detail.paymentStatus),
                  )}
                >
                  {detail.paymentStatus}
                </span>
              }
            />
          </DetailCard>

          <DetailCard title="Revenue Breakdown">
            <DetailRow label="Gross Amount" value={detail.revenueBreakdown.grossAmount} />
            <DetailRow label="Discounts" value={detail.revenueBreakdown.discounts} />
            <DetailRow label="Refunds" value={detail.revenueBreakdown.refunds} />
            <DetailRow
              label="Net Revenue"
              value={detail.revenueBreakdown.netRevenue}
              valueClassName="text-body-sm-semibold"
            />
          </DetailCard>

          <DetailCard title="Tax & Fee Breakdown">
            <DetailRow
              label="Tax Collected (GST 18%)"
              value={detail.taxFeeBreakdown.taxCollected}
            />
            <DetailRow
              label="Payment Gateway Fee"
              value={detail.taxFeeBreakdown.paymentGatewayFee}
            />
            <DetailRow label="Platform Fee (20%)" value={detail.taxFeeBreakdown.platformFee} />
            <DetailRow
              label="Net Platform Earnings"
              value={detail.taxFeeBreakdown.netPlatformEarnings}
              valueClassName="text-body-sm-semibold"
            />
          </DetailCard>
        </div>

        <div className="flex flex-col gap-5">
          <DetailCard title="Revenue Flow Summary">
            <DetailRow label="Customer Paid" value={detail.revenueFlow.customerPaid} />
            <DetailRow label="After Discounts" value={detail.revenueFlow.afterDiscounts} />
            <DetailRow label="After Refunds" value={detail.revenueFlow.afterRefunds} />
            <DetailRow label="Platform Commission" value={detail.revenueFlow.platformCommission} />
            <DetailRow label="Gateway Deduction" value={detail.revenueFlow.gatewayDeduction} />
            <DetailRow
              label="Final Platform Earnings"
              value={detail.revenueFlow.finalPlatformEarnings}
              valueClassName="text-body-sm-semibold"
            />
            <DetailRow
              label="Host Payout"
              value={detail.revenueFlow.hostPayout}
              valueClassName="text-body-sm-semibold"
            />
          </DetailCard>

          <DetailCard title="Transaction References">
            <DetailRow label="Gateway Name" value={detail.transactionReferences.gatewayName} />
            <DetailRow
              label="Gateway Transaction ID"
              value={detail.transactionReferences.gatewayTransactionId}
            />
            <DetailRow
              label="Platform Record ID"
              value={detail.transactionReferences.platformRecordId}
            />
            <DetailRow
              label="Settlement Date"
              value={detail.transactionReferences.settlementDate}
            />
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
