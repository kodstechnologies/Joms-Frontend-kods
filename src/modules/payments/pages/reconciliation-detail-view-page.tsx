import type { ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getReconciliationDetailById } from '@/modules/payments/mock/reconciliation-detail.mock'
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
      <span
        className={cn('max-w-[60%] text-right text-[12px] font-medium text-white', valueClassName)}
      >
        {value}
      </span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Matched') {
    return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  }
  if (status === 'Pending') {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  }
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        getStatusBadgeClass(status),
      )}
    >
      {status}
    </span>
  )
}

export function ReconciliationDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'recon-01' } = useParams<{ id: string }>()
  const detail = getReconciliationDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigate('/finance/reconciliation')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Reconciliation Report</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <span>Payment & Finance</span>
          <span> / </span>
          <Link to="/finance/reconciliation" className="transition-colors hover:text-white">
            Financial Reconciliation
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Tax Record View</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-white">{detail.recordTitle}</h2>
            <p className="mt-1 text-[12px] text-[#888888]">{detail.recordDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.message('Download report coming soon')}>
              <Download className="size-4" />
              Download Report
            </Button>
            <Button onClick={() => toast.message('Edit tax record coming soon')}>
              <SquarePen className="size-4" />
              Edit Tax Record
            </Button>
            <Button onClick={() => toast.message('Add notes coming soon')}>
              <SquarePen className="size-4" />
              Add Notes
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DetailCard title="Reconciliation Information">
          <DetailRow
            label="Reconciliation ID"
            value={detail.reconciliationInformation.reconciliationId}
          />
          <DetailRow label="Gateway" value={detail.reconciliationInformation.gateway} />
          <DetailRow
            label="Transaction ID"
            value={detail.reconciliationInformation.transactionId}
          />
          <DetailRow
            label="Platform Record ID"
            value={detail.reconciliationInformation.platformRecordId}
          />
          <DetailRow
            label="Settlement Batch ID"
            value={detail.reconciliationInformation.settlementBatchId}
          />
          <DetailRow
            label="Settlement Date"
            value={detail.reconciliationInformation.settlementDate}
          />
          <DetailRow
            label="Bank Credit Date"
            value={detail.reconciliationInformation.bankCreditDate}
          />
          <DetailRow label="Reconciled By" value={detail.reconciliationInformation.reconciledBy} />
          <DetailRow
            label="Reconciliation Date"
            value={detail.reconciliationInformation.reconciliationDate}
          />
          <DetailRow
            label="Status"
            value={<StatusBadge status={detail.reconciliationInformation.status} />}
          />
        </DetailCard>

        <div className="flex flex-col gap-5">
          <DetailCard title="Gateway Details">
            <DetailRow
              label="Gateway Reported Amount"
              value={detail.gatewayDetails.gatewayReportedAmount}
            />
            <DetailRow label="Gateway Fee" value={detail.gatewayDetails.gatewayFee} />
            <DetailRow label="Net Settled Amount" value={detail.gatewayDetails.netSettledAmount} />
            <DetailRow label="Currency" value={detail.gatewayDetails.currency} />
            <DetailRow
              label="Gateway Reference ID"
              value={detail.gatewayDetails.gatewayReferenceId}
            />
          </DetailCard>

          <DetailCard title="Platform Record Summary">
            <DetailRow
              label="Platform Gross Amount"
              value={detail.platformRecordSummary.platformGrossAmount}
            />
            <DetailRow
              label="Refund Recorded"
              value={detail.platformRecordSummary.refundRecorded}
            />
            <DetailRow
              label="Platform Commission"
              value={detail.platformRecordSummary.platformCommission}
            />
            <DetailRow label="Tax Collected" value={detail.platformRecordSummary.taxCollected} />
            <DetailRow
              label="Expected Settlement Amount"
              value={detail.platformRecordSummary.expectedSettlementAmount}
              valueClassName="font-bold"
            />
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
