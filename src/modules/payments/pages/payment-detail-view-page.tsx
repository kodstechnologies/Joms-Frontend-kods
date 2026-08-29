import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { useAddFinanceNote, useFinancePayment } from '@/modules/payments/hooks/use-finance'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import {
  formatDate,
  formatInr,
  mapPaymentStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { Button } from '@/shared/components/ui/button'
import { DetailViewSkeleton } from '@/shared/components/ui/skeleton'
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
  if (status === 'Successful' || status === 'Paid') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

const num = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const round2 = (value: number) => Math.round(value * 100) / 100

export function PaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFinancePayment(id)
  const noteMutation = useAddFinanceNote()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const payment = data?.data
  const snapshot = (payment?.moduleSnapshot || {}) as Record<string, unknown>
  const moduleData = (payment?.moduleData || {}) as Record<string, unknown>
  const fulfilled = (payment?.fulfillmentResult || {}) as Record<string, unknown>

  const partnerId =
    payment?.partnerId ||
    (payment?.userType === 'partner' ? payment.userId : null) ||
    (typeof snapshot.partnerId === 'string' ? snapshot.partnerId : null)

  const snapshotPartnerName =
    (typeof snapshot.partnerName === 'string' && snapshot.partnerName) ||
    (typeof moduleData.partnerName === 'string' && moduleData.partnerName) ||
    null

  const { data: partnerNameMap } = useQuery({
    queryKey: ['finance-partner-name', partnerId],
    queryFn: () => fetchPartnerDisplayNames([String(partnerId)]),
    enabled: !!partnerId && !snapshotPartnerName,
    staleTime: 1000 * 60 * 5,
  })

  const partnerName =
    snapshotPartnerName || (partnerId ? partnerNameMap?.[String(partnerId)] : null) || null

  if (isLoading) {
    return <DetailViewSkeleton pillCount={6} cardCount={3} />
  }

  if (isError || !payment) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Payment not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/revenue')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Revenue
        </button>
      </div>
    )
  }

  const mappedStatus = mapPaymentStatus(payment.status)
  const paymentStatus =
    mappedStatus === 'Paid' ? 'Successful' : mappedStatus === 'Failed' ? 'Failed' : 'Pending'

  const title =
    (typeof snapshot.title === 'string' && snapshot.title) ||
    (typeof snapshot.planName === 'string' &&
      `${snapshot.planName}${snapshot.billingCycleName ? ` - ${snapshot.billingCycleName}` : ''}`) ||
    payment.description ||
    payment.orderId

  const referenceType =
    payment.referenceType ||
    (payment.module === 'membership' ? 'MembershipPlan' : null) ||
    (typeof snapshot.referenceType === 'string' ? snapshot.referenceType : null)

  const referenceId =
    payment.referenceId ||
    (typeof snapshot.membershipPlanId === 'string' ? snapshot.membershipPlanId : null) ||
    (typeof moduleData.membershipPlanId === 'string' ? moduleData.membershipPlanId : null) ||
    payment.orderId

  const pricingType = payment.pricingType || (payment.module === 'membership' ? 'membership' : null)

  const gross = num(payment.amount)
  const gstRate = num(snapshot.taxRate ?? snapshot.taxRateApplied, 18)
  const gstAmount = num(snapshot.taxAmount, round2((gross * gstRate) / 100))
  const commissionPct = num(
    snapshot.platformCommissionPercent,
    payment.module === 'membership' ? 0 : 10,
  )
  const gatewayPct = num(snapshot.convenienceFeePercent, 2)
  const platformFee = round2((gross * commissionPct) / 100)
  const gatewayFee = round2((gross * gatewayPct) / 100)
  const discounts = 0
  const refunds = 0
  const afterDiscounts = round2(gross - discounts)
  const afterRefunds = round2(afterDiscounts - refunds)
  const netRevenue = afterRefunds
  const isReceivable = payment.direction === 'receivable' || payment.module === 'membership'
  const hostPayout = isReceivable ? 0 : round2(afterRefunds - platformFee - gatewayFee)
  const netPlatformEarnings = isReceivable
    ? round2(afterRefunds - gatewayFee)
    : round2(platformFee + gstAmount)

  const venueId =
    (typeof snapshot.venueId === 'string' && snapshot.venueId) ||
    (typeof fulfilled.venueId === 'string' && fulfilled.venueId) ||
    null
  const showVenueContext = payment.module === 'venue' || Boolean(venueId)

  const startAt = typeof snapshot.startAt === 'string' ? snapshot.startAt : null
  const endAt = typeof snapshot.endAt === 'string' ? snapshot.endAt : null
  const durationHours = snapshot.bookingDurationHours
  const bookingDates =
    startAt && endAt
      ? `${formatDate(startAt)} - ${formatDate(endAt)}`
      : formatDate(payment.createdAt)

  const detail = {
    serviceTitle: title,
    serviceDescription: payment.description || `${titleCase(payment.module)} payment details`,
    revenueId: payment.orderId,
    sourceModule: titleCase(payment.module),
    sourceType: titleCase(pricingType || referenceType || payment.module),
    sourceId: String(referenceId),
    sourceName: title,
    hostOwner: partnerName || partnerId || '—',
    transactionDate: formatDate(payment.createdAt),
    currency: payment.currency || 'INR',
    paymentStatus: paymentStatus as 'Successful' | 'Pending' | 'Failed',
    revenueBreakdown: {
      grossAmount: formatInr(gross),
      discounts: discounts ? `-${formatInr(discounts)}` : formatInr(0),
      refunds: refunds ? `-${formatInr(refunds)}` : formatInr(0),
      netRevenue: formatInr(netRevenue),
    },
    taxFeeBreakdown: {
      taxCollected: formatInr(gstAmount),
      paymentGatewayFee: formatInr(gatewayFee),
      platformFee: formatInr(platformFee),
      netPlatformEarnings: formatInr(netPlatformEarnings),
    },
    revenueFlow: {
      customerPaid: formatInr(gross),
      afterDiscounts: formatInr(afterDiscounts),
      afterRefunds: formatInr(afterRefunds),
      platformCommission: formatInr(platformFee),
      gatewayDeduction: formatInr(gatewayFee),
      finalPlatformEarnings: formatInr(netPlatformEarnings),
      hostPayout: isReceivable ? '—' : formatInr(hostPayout),
    },
    transactionReferences: {
      gatewayName: 'Razorpay',
      gatewayTransactionId: payment.razorpayPaymentId || payment.razorpayOrderId || '—',
      platformRecordId: payment.orderId,
      settlementDate: formatDate(payment.updatedAt || payment.createdAt),
    },
    additionalVenueContext: showVenueContext
      ? {
          bookingDates,
          duration: durationHours != null ? String(durationHours) : '—',
          eventType:
            (typeof snapshot.venueType === 'string' && snapshot.venueType) ||
            (typeof snapshot.category === 'string' && snapshot.category) ||
            '—',
          cancellationPolicy: '—',
          venueId: venueId || '—',
          ownerId: partnerId || '—',
        }
      : null,
  }

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
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
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
            <p className={cn(sectionSubtitleClass, 'leading-[20px]')}>
              {detail.serviceDescription}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() =>
                void downloadKeyValueReport(
                  'payment_report',
                  flattenExportPairs({
                    Overview: {
                      title: detail.serviceTitle,
                      revenueId: detail.revenueId,
                      sourceModule: detail.sourceModule,
                      sourceType: detail.sourceType,
                      sourceId: detail.sourceId,
                      sourceName: detail.sourceName,
                      hostOwner: detail.hostOwner,
                      transactionDate: detail.transactionDate,
                      currency: detail.currency,
                      paymentStatus: detail.paymentStatus,
                    },
                    Breakdown: detail.revenueBreakdown,
                    TaxAndFees: detail.taxFeeBreakdown,
                    RevenueFlow: detail.revenueFlow,
                    References: detail.transactionReferences,
                    Venue: detail.additionalVenueContext,
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
            <Button
              onClick={() =>
                navigate(
                  escalateUrl(payment._id, {
                    kind: 'resource',
                    resourceType: 'Payment',
                    returnTo: `/finance/revenue/${id}`,
                  }),
                )
              }
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
              label={`Tax Collected (GST ${gstRate}%)`}
              value={detail.taxFeeBreakdown.taxCollected}
            />
            <DetailRow
              label="Payment Gateway Fee"
              value={detail.taxFeeBreakdown.paymentGatewayFee}
            />
            <DetailRow
              label={`Platform Fee (${commissionPct}%)`}
              value={detail.taxFeeBreakdown.platformFee}
            />
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

          {detail.additionalVenueContext ? (
            <DetailCard title="Additional Venue Context">
              <DetailRow label="Booking Dates" value={detail.additionalVenueContext.bookingDates} />
              <DetailRow label="Duration" value={detail.additionalVenueContext.duration} />
              <DetailRow label="Event Type" value={detail.additionalVenueContext.eventType} />
              <DetailRow
                label="Cancellation Policy"
                value={detail.additionalVenueContext.cancellationPolicy}
              />
              <DetailRow label="Venue ID" value={detail.additionalVenueContext.venueId} />
              <DetailRow label="Owner ID" value={detail.additionalVenueContext.ownerId} />
            </DetailCard>
          ) : null}
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
