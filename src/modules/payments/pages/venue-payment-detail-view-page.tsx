import type { ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getVenuePaymentDetailById } from '@/modules/payments/mock/venue-payment-detail.mock'
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
  if (
    status === 'Successful' ||
    status === 'Completed' ||
    status === 'Confirmed' ||
    status === 'Approved'
  ) {
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

export function VenuePaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'venue-01' } = useParams<{ id: string }>()
  const detail = getVenuePaymentDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/venues')}
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
          <Link to="/finance/venues" className="transition-colors hover:text-white">
            Venues
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Payment View Details</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-white">{detail.venueTitle}</h2>
            <p className="mt-1 text-[12px] text-[#888888]">{detail.venueDescription}</p>
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
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailCard title="Payment Information">
            <DetailRow label="Booking ID" value={detail.paymentInformation.bookingId} />
            <DetailRow label="Venue ID" value={detail.paymentInformation.venueId} />
            <DetailRow label="Transaction ID" value={detail.paymentInformation.transactionId} />
            <DetailRow label="Entity Type" value={detail.paymentInformation.entityType} />
            <DetailRow label="Booking Title" value={detail.paymentInformation.bookingTitle} />
            <DetailRow label="Created On" value={detail.paymentInformation.createdOn} />
            <DetailRow label="Booking Duration" value={detail.paymentInformation.bookingDuration} />
            <DetailRow
              label="Booking Status"
              value={<StatusBadge status={detail.paymentInformation.bookingStatus} />}
            />
          </DetailCard>

          <DetailCard title="Timeline Information">
            <DetailRow
              label="Booking Requested On"
              value={detail.timelineInformation.bookingRequestedOn}
            />
            <DetailRow
              label="Payment Completed On"
              value={detail.timelineInformation.paymentCompletedOn}
            />
            <DetailRow
              label="Event Completed On"
              value={detail.timelineInformation.eventCompletedOn}
            />
            <DetailRow
              label="Deposit Release Date"
              value={detail.timelineInformation.depositReleaseDate}
            />
            <DetailRow
              label="Final Settlement Date"
              value={detail.timelineInformation.finalSettlementDate}
            />
          </DetailCard>

          <DetailCard title="Financial Breakdown">
            <DetailRow label="Rental Fee" value={detail.financialBreakdown.rentalFee} />
            <DetailRow label="Number of Days" value={detail.financialBreakdown.numberOfDays} />
            <DetailRow label="Deposit Status" value={detail.financialBreakdown.depositStatus} />
            <DetailRow label="Platform Fee (5%)" value={detail.financialBreakdown.platformFee} />
            <DetailRow label="GST (18%)" value={detail.financialBreakdown.gst} />
          </DetailCard>
        </div>

        <div className="flex flex-col gap-5">
          <DetailCard title="Venue Information">
            <DetailRow label="Venue Name" value={detail.venueInformation.venueName} />
            <DetailRow label="Owner Name" value={detail.venueInformation.ownerName} />
            <DetailRow label="Owner ID" value={detail.venueInformation.ownerId} />
            <DetailRow label="Venue Type" value={detail.venueInformation.venueType} />
            <DetailRow label="Capacity" value={detail.venueInformation.capacity} />
            <DetailRow label="Location" value={detail.venueInformation.location} />
            <DetailRow
              label="Approved Status"
              value={<StatusBadge status={detail.venueInformation.approvedStatus} />}
            />
          </DetailCard>

          <DetailCard title="Parties">
            <DetailRow label="Client ID" value={detail.parties.clientId} />
            <DetailRow label="Client Name" value={detail.parties.clientName} />
            <DetailRow label="Owner ID" value={detail.parties.ownerId} />
            <DetailRow label="Owner Name" value={detail.parties.ownerName} />
          </DetailCard>

          <DetailCard title="Final Calculation">
            <DetailRow label="Total Collected" value={detail.finalCalculation.totalCollected} />
            <DetailRow label="Platform Earnings" value={detail.finalCalculation.platformEarnings} />
            <DetailRow
              label="Net Payable to Venue Owner"
              value={detail.finalCalculation.netPayableToVenueOwner}
              valueClassName="font-bold"
            />
            <DetailRow label="Owner Name" value={detail.finalCalculation.ownerName} />
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
