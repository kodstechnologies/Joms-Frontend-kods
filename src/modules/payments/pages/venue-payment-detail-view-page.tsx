import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { useAddFinanceNote, useFinancePayment } from '@/modules/payments/hooks/use-finance'
import {
  formatDate,
  formatInr,
  mapPaymentStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import {
  downloadKeyValueReport,
  flattenExportPairs,
} from '@/modules/payments/hooks/use-finance-list-filters'

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
      <span className={cn('text-right', valueClass, valueClassName)}>{value}</span>
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
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'In Progress') {
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

export function VenuePaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFinancePayment(id)
  const noteMutation = useAddFinanceNote()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const payment = data?.data
  const snapshot = (payment?.moduleSnapshot || {}) as Record<string, unknown>
  const moduleData = (payment?.moduleData || {}) as Record<string, unknown>
  const ownerIdForLookup =
    (typeof payment?.partnerId === 'string' && payment.partnerId) ||
    (typeof snapshot.partnerId === 'string' && snapshot.partnerId) ||
    null
  const snapshotOwnerName = typeof snapshot.partnerName === 'string' ? snapshot.partnerName : null
  const clientIdForCompare =
    (typeof payment?.userId === 'string' && payment.userId) ||
    (typeof snapshot.userId === 'string' && snapshot.userId) ||
    (typeof moduleData.userName === 'string' && moduleData.userName) ||
    null
  const needsOwnerLookup =
    !!ownerIdForLookup &&
    (!snapshotOwnerName ||
      snapshotOwnerName === clientIdForCompare ||
      snapshotOwnerName === moduleData.userName ||
      snapshotOwnerName === moduleData.clientName)
  const { data: partnerNameMap } = useQuery({
    queryKey: ['finance-partner-name', ownerIdForLookup],
    queryFn: () => fetchPartnerDisplayNames([String(ownerIdForLookup)]),
    enabled: needsOwnerLookup,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading payment details...</p>
  }

  if (isError || !payment) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Payment not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/venues')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Venues
        </button>
      </div>
    )
  }

  const fulfilled = (payment.fulfillmentResult || {}) as Record<string, unknown>
  const str = (...vals: unknown[]) => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim()) return v.trim()
      if (typeof v === 'number' && Number.isFinite(v)) return String(v)
    }
    return null
  }
  const status = mapPaymentStatus(payment.status)
  const bookingStatus =
    status === 'Paid' ? 'Confirmed' : status === 'Failed' ? 'Cancelled' : 'Pending'

  const venueId = str(snapshot.venueId, fulfilled.venueId, moduleData.venueId) || '—'
  const bookingId =
    str(
      fulfilled.bookingId,
      snapshot.bookingId,
      payment.referenceType === 'VenueBooking' ? payment.referenceId : null,
    ) || payment.orderId
  const venueName =
    str(snapshot.venueName, fulfilled.venueName) ||
    str(snapshot.title, payment.description)?.split('·')[0]?.trim() ||
    'Venue booking'
  const bookingTitle = str(snapshot.title, fulfilled.title, payment.description) || venueName
  const ownerId = str(payment.partnerId, snapshot.partnerId) || '—'
  const clientId = str(payment.userId, snapshot.userId) || '—'
  const clientName = str(snapshot.userName, moduleData.userName, moduleData.clientName) || clientId
  // Older rows wrongly stored payer name as partnerName — never show client as owner.
  const rawOwnerName = str(snapshot.partnerName)
  const lookedUpOwner = ownerId !== '—' ? partnerNameMap?.[ownerId] : null
  const ownerName =
    rawOwnerName && rawOwnerName !== clientName && rawOwnerName !== clientId
      ? rawOwnerName
      : lookedUpOwner || ownerId

  const amount = Number(payment.amount) || 0
  const platformRate =
    typeof snapshot.platformFeeRate === 'number' ? snapshot.platformFeeRate : 0.05
  const gstRate = typeof snapshot.gstRate === 'number' ? snapshot.gstRate : 0.18
  const platformFee = Math.round(amount * platformRate)
  const gst = Math.round(amount * gstRate)
  const netPayable = Math.max(0, amount - platformFee)

  const startAt = str(snapshot.startAt, fulfilled.startAt)
  const endAt = str(snapshot.endAt, fulfilled.endAt)
  const durationHours =
    typeof snapshot.bookingDurationHours === 'number'
      ? snapshot.bookingDurationHours
      : startAt && endAt
        ? Math.max(
            0,
            Math.round(
              (new Date(endAt).getTime() - new Date(startAt).getTime()) / (60 * 60 * 1000),
            ),
          )
        : null
  const numberOfDays =
    typeof snapshot.numberOfDays === 'number'
      ? snapshot.numberOfDays
      : startAt && endAt
        ? Math.max(
            1,
            Math.ceil(
              (new Date(endAt).getTime() - new Date(startAt).getTime()) / (24 * 60 * 60 * 1000),
            ),
          )
        : null

  const location =
    str(snapshot.location) ||
    (snapshot.location && typeof snapshot.location === 'object'
      ? [
          (snapshot.location as { address?: string }).address,
          (snapshot.location as { city?: string }).city,
          (snapshot.location as { state?: string }).state,
        ]
          .filter(Boolean)
          .join(', ')
      : null) ||
    '—'

  const detail = {
    venueTitle: venueName,
    venueDescription: bookingTitle !== venueName ? bookingTitle : 'Venue payment details',
    paymentInformation: {
      bookingId,
      venueId,
      transactionId: str(payment.razorpayPaymentId, payment._id) || payment._id,
      orderId: payment.orderId,
      entityType: titleCase(payment.pricingType || payment.module),
      bookingTitle,
      createdOn: formatDate(payment.createdAt),
      bookingDuration: durationHours != null ? `${durationHours} hour(s)` : '—',
      bookingStatus: bookingStatus as 'Confirmed' | 'Pending' | 'Cancelled',
    },
    timelineInformation: {
      bookingRequestedOn: formatDate(payment.createdAt),
      paymentCompletedOn:
        status === 'Paid' ? formatDate(payment.updatedAt || payment.createdAt) : '—',
      eventCompletedOn: endAt ? formatDate(endAt) : '—',
      // Not modeled on Payment / venue booking today — only escrow holds have expectedReleaseAt.
      depositReleaseDate: str(snapshot.depositReleaseDate) || 'Not applicable',
      // Payment has settlementStatus only (pending|settled), no calendar settlement date field.
      finalSettlementDate:
        str(snapshot.finalSettlementDate) ||
        (payment.settlementStatus ? titleCase(payment.settlementStatus) : 'Not set'),
    },
    financialBreakdown: {
      rentalFee: formatInr(amount),
      numberOfDays: numberOfDays != null ? String(numberOfDays) : '—',
      depositStatus: status === 'Paid' ? 'Collected with rental' : 'Pending',
      platformFee: formatInr(platformFee),
      gst: formatInr(gst),
    },
    venueInformation: {
      venueName,
      ownerName,
      ownerId,
      venueType: titleCase(str(snapshot.venueType, snapshot.category) || '—'),
      capacity:
        str(snapshot.capacity) ||
        (snapshot.spaceId || moduleData.spaceId ? '—' : 'No space on booking'),
      location,
      approvedStatus: (status === 'Paid' ? 'Approved' : 'Pending') as
        | 'Approved'
        | 'Pending'
        | 'Rejected',
    },
    parties: {
      clientId,
      clientName,
      ownerId,
      ownerName,
    },
    finalCalculation: {
      totalCollected: formatInr(amount),
      platformEarnings: formatInr(platformFee),
      netPayableToVenueOwner: formatInr(netPayable),
      ownerName,
    },
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/venues')}
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
          <Link to="/finance/venues" className="hover:text-brand-text transition-colors">
            Venues
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={sectionTitleClass}>{detail.venueTitle}</h2>
            <p className={sectionSubtitleClass}>{detail.venueDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() =>
                downloadKeyValueReport(
                  'venue_payment_report',
                  flattenExportPairs({
                    Payment: detail.paymentInformation,
                    Timeline: detail.timelineInformation,
                    Financial: detail.financialBreakdown,
                    Venue: detail.venueInformation,
                    Parties: detail.parties,
                    Settlement: detail.finalCalculation,
                  }),
                )
              }
            >
              <Download className="size-4" />
              Download Report
            </Button>
            <Button onClick={() => setIsNoteModalOpen(true)}>
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
            <DetailRow label="Order ID" value={detail.paymentInformation.orderId} />
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
              valueClassName="text-body-sm-semibold"
            />
            <DetailRow label="Owner Name" value={detail.finalCalculation.ownerName} />
          </DetailCard>
        </div>
      </div>

      <FinanceInternalNotesCard resourceId={payment._id} />

      <AddFinanceNoteModal
        open={isNoteModalOpen}
        isSubmitting={noteMutation.isPending}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={(adminNote) => {
          noteMutation.mutate(
            { id: payment._id, resourceType: 'Payment', adminNote },
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
