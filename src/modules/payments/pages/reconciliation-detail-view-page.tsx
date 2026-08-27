import { useState, type ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import {
  useAddFinanceNote,
  useFinanceReconciliationDetail,
} from '@/modules/payments/hooks/use-finance'
import { formatDate, formatInr, titleCase } from '@/modules/payments/utils/finance-mappers'
import { Button } from '@/shared/components/ui/button'
import { DetailViewSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
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
      <span className={cn('max-w-[60%] text-right', valueClass, valueClassName)}>{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Matched') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
        getStatusBadgeClass(status),
      )}
    >
      {status}
    </span>
  )
}

export function ReconciliationDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFinanceReconciliationDetail(id)
  const noteMutation = useAddFinanceNote()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const row = data?.data

  if (isLoading) {
    return <DetailViewSkeleton pillCount={6} cardCount={2} />
  }

  if (isError || !row) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Reconciliation record not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/reconciliation')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Reconciliation
        </button>
      </div>
    )
  }

  const statusLabel =
    row.status === 'matched' || row.status === 'resolved'
      ? 'Matched'
      : row.status === 'investigating'
        ? 'Pending'
        : 'Mismatch'

  const detail = {
    recordTitle: 'Reconciliation Information',
    recordDescription: `${titleCase(row.module)} · ${titleCase(row.pricingType)}`,
    reconciliationInformation: {
      reconciliationId: row.recordId,
      gateway: titleCase(row.gateway) || 'Razorpay',
      transactionId: String(row.paymentId),
      platformRecordId: row.recordId,
      settlementBatchId: row.razorpaySettlementId || '—',
      settlementDate: formatDate(row.settlementDate),
      bankCreditDate: formatDate(row.settlementDate),
      reconciledBy: 'Finance Admin',
      reconciliationDate: formatDate(row.createdAt),
      status: statusLabel as 'Matched' | 'Mismatch' | 'Pending',
    },
    gatewayDetails: {
      gatewayReportedAmount: formatInr(row.gatewayAmount),
      gatewayFee: '—',
      netSettledAmount: formatInr(row.platformReceivedAmount),
      currency: row.currency || 'INR',
      gatewayReferenceId: row.gatewayReference || '—',
    },
    platformRecordSummary: {
      platformGrossAmount: formatInr(row.platformReceivedAmount),
      refundRecorded: '—',
      platformCommission: '—',
      taxCollected: '—',
      expectedSettlementAmount: formatInr(row.gatewayAmount - row.differenceAmount),
    },
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/reconciliation')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Reconciliation Report</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <span>Payment & Finance</span>
          <span> / </span>
          <Link to="/finance/reconciliation" className="hover:text-brand-text transition-colors">
            Financial Reconciliation
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Tax Record View</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={sectionTitleClass}>{detail.recordTitle}</h2>
            <p className={cn(sectionSubtitleClass, 'leading-[20px]')}>{detail.recordDescription}</p>
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
            <Button onClick={() => setIsNoteModalOpen(true)}>
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
              valueClassName="text-body-sm-semibold"
            />
          </DetailCard>
        </div>
      </div>

      <AddFinanceNoteModal
        open={isNoteModalOpen}
        isSubmitting={noteMutation.isPending}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={(adminNote) => {
          noteMutation.mutate(
            { id: row._id, resourceType: 'ReconciliationRecord', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setIsNoteModalOpen(false)
              },
              onError: () => toast.error('Failed to save note'),
            },
          )
        }}
      />
    </div>
  )
}
