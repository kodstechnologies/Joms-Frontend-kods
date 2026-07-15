import type { ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getPaymentDetailById } from '@/modules/payments/mock/payment-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
      <h2 className="mb-4 text-[14px] font-bold text-white">{title}</h2>
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
      <span className={cn('text-right text-[12px] font-medium text-white', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Successful') {
    return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  }
  if (status === 'Pending') {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  }
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

export function PaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'rev-01' } = useParams<{ id: string }>()
  const detail = getPaymentDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigate('/finance/revenue')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/dashboard" className="transition-colors hover:text-white">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/revenue" className="transition-colors hover:text-white">
            Revenue Overview
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Payment View Details</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-white">{detail.serviceTitle}</h2>
            <p className="mt-1 text-[12px] text-[#888888]">{detail.serviceDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.message('Download report coming soon')}>
              <Download className="size-4" />
              Download Report
            </Button>
            <Button
              variant="secondary"
              className="border-[#F0C27B]/60 bg-transparent text-[#F0C27B] hover:border-[#F0C27B] hover:bg-[#F0C27B]/10"
              onClick={() => toast.message('Add notes coming soon')}
            >
              <SquarePen className="size-4" />
              Add Notes
            </Button>
            <Button
              variant="secondary"
              className="border-[#F0C27B]/60 bg-transparent text-[#F0C27B] hover:border-[#F0C27B] hover:bg-[#F0C27B]/10"
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
                    'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
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
              valueClassName="font-bold"
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
              valueClassName="font-bold"
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
              valueClassName="font-bold"
            />
            <DetailRow
              label="Host Payout"
              value={detail.revenueFlow.hostPayout}
              valueClassName="font-bold"
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
