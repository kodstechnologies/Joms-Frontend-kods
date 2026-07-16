import type { ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getServicePaymentDetailById } from '@/modules/payments/mock/service-payment-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

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
  if (status === 'Successful' || status === 'Completed') {
    return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  }
  if (status === 'Pending' || status === 'In Progress') {
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

export function ServicePaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'all-01' } = useParams<{ id: string }>()
  const detail = getServicePaymentDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/services')}
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
          <Link to="/finance/services" className="transition-colors hover:text-white">
            Service
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
            <Button onClick={() => toast.message('Add notes coming soon')}>
              <SquarePen className="size-4" />
              Add Notes
            </Button>
            <Button onClick={() => toast.message('Escalate coming soon')}>
              <SquarePen className="size-4" />
              Escalate
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailCard title="Payment Information">
            <DetailRow label="Payment ID" value={detail.paymentInformation.paymentId} />
            <DetailRow label="Transaction ID" value={detail.paymentInformation.transactionId} />
            <DetailRow label="Booking ID" value={detail.paymentInformation.bookingId} />
            <DetailRow label="Payment Method" value={detail.paymentInformation.paymentMethod} />
            <DetailRow label="Payment Gateway" value={detail.paymentInformation.paymentGateway} />
            <DetailRow label="Created On" value={detail.paymentInformation.createdOn} />
            <DetailRow
              label="Settlement Status"
              value={detail.paymentInformation.settlementStatus}
            />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge status={detail.paymentInformation.paymentStatus} />}
            />
          </DetailCard>

          <DetailCard title="Timeline Information">
            <DetailRow label="Booking Date" value={detail.timelineInformation.bookingDate} />
            <DetailRow label="Payment Date" value={detail.timelineInformation.paymentDate} />
            <DetailRow
              label="Service Completed On"
              value={detail.timelineInformation.serviceCompletedOn}
            />
            <DetailRow
              label="Payout Released On"
              value={detail.timelineInformation.payoutReleasedOn}
            />
          </DetailCard>

          <DetailCard title="Financial Breakdown">
            <DetailRow label="Payout ID" value={detail.financialBreakdown.payoutId} />
            <DetailRow label="Payout Method" value={detail.financialBreakdown.payoutMethod} />
            <DetailRow
              label="Service Completed On"
              value={detail.financialBreakdown.serviceCompletedOn}
            />
            <DetailRow label="Payout Date" value={detail.financialBreakdown.payoutDate} />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge status={detail.financialBreakdown.paymentStatus} />}
            />
          </DetailCard>
        </div>

        <div className="flex flex-col gap-5">
          <DetailCard title="Service Information">
            <DetailRow label="Service Name" value={detail.serviceInformation.serviceName} />
            <DetailRow label="Service Type" value={detail.serviceInformation.serviceType} />
            <DetailRow label="Category" value={detail.serviceInformation.category} />
            <DetailRow label="Start Date" value={detail.serviceInformation.startDate} />
            <DetailRow label="End Date" value={detail.serviceInformation.endDate} />
            <DetailRow
              label="Completion Status"
              value={<StatusBadge status={detail.serviceInformation.completionStatus} />}
            />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge status={detail.serviceInformation.paymentStatus} />}
            />
          </DetailCard>

          <DetailCard title="Parties">
            <DetailRow label="Client ID" value={detail.parties.clientId} />
            <DetailRow label="Client Name" value={detail.parties.clientName} />
            <DetailRow label="Expert ID" value={detail.parties.expertId} />
            <DetailRow label="Expert Name" value={detail.parties.expertName} />
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
