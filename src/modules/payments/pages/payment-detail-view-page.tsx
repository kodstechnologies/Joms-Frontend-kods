import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, SquareArrowOutUpRight, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import {
  FinanceDetailCard as DetailCard,
  FinanceDetailRow as DetailRow,
  FinanceDetailShell,
  financeDetailCardClass,
} from '@/modules/payments/components/finance-detail-layout'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { FinanceStatusBadge } from '@/modules/payments/components/finance-status-badge'
import { financePaymentDetailStatusClass } from '@/modules/payments/utils/finance-status-tones'
import { useAddFinanceNote, useFinancePayment } from '@/modules/payments/hooks/use-finance'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import {
  formatDate,
  formatLongDate,
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

const cardClass = financeDetailCardClass
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1'

const num = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const round2 = (value: number) => Math.round(value * 100) / 100

const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null)

const formatPlainAmount = (value: number) =>
  Math.round(Math.abs(value)).toLocaleString('en-IN', { maximumFractionDigits: 0 })

const formatSignedPlain = (value: number) => (value ? `-${formatPlainAmount(value)}` : '0')

const formatInrWhole = (value: number) => `₹${formatPlainAmount(value)}`

const padDuration = (value: unknown) => {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return String(Math.round(n)).padStart(2, '0')
}

const sourceTypeLabel = (
  module: string,
  pricingType?: string | null,
  referenceType?: string | null,
) => {
  if (module === 'venue') return 'Venue Booking'
  if (module === 'event') return 'Paid Event'
  if (module === 'membership') return 'Membership'
  return titleCase(pricingType || referenceType || module)
}

const venueCode = (id?: string | null) => {
  if (!id) return '—'
  if (/^(VEN|EVT)-/i.test(id)) return id
  return `VEN-${id.slice(-4).toUpperCase()}`
}

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
  const isVenue = payment.module === 'venue' || Boolean(str(snapshot.venueId))

  const gross = num(payment.amount)
  const discounts = num(
    snapshot.discountAmount ??
      snapshot.discounts ??
      moduleData.discountAmount ??
      moduleData.discounts,
  )
  const refunds = num(
    snapshot.refundAmount ?? snapshot.refunds ?? moduleData.refundAmount ?? moduleData.refunds,
  )
  const afterDiscounts = round2(gross - discounts)
  const afterRefunds = round2(afterDiscounts - refunds)
  const gstRate = num(snapshot.taxRate ?? snapshot.taxRateApplied, 18)
  const gstAmount = num(snapshot.taxAmount, round2((afterRefunds * gstRate) / 100))
  const commissionPct = num(
    snapshot.platformCommissionPercent,
    payment.module === 'membership' ? 0 : isVenue ? 20 : 10,
  )
  const gatewayPct = num(snapshot.convenienceFeePercent, 2)
  const platformFee = round2((afterRefunds * commissionPct) / 100)
  const gatewayFee = num(
    snapshot.gatewayFee ?? snapshot.convenienceFee,
    round2((gross * gatewayPct) / 100),
  )
  const netRevenue = afterRefunds
  const isReceivable = payment.direction === 'receivable' || payment.module === 'membership'
  const hostPayout = isReceivable ? 0 : round2(afterRefunds - platformFee)
  const netPlatformEarnings = round2(platformFee - gatewayFee)

  const venueId =
    str(snapshot.venueId) ||
    str(fulfilled.venueId) ||
    str(moduleData.venueId) ||
    (isVenue ? String(referenceId) : null)
  const showVenueContext = isVenue

  const startAt = str(snapshot.startAt) || str(snapshot.bookingStartAt)
  const endAt = str(snapshot.endAt) || str(snapshot.bookingEndAt)
  const durationHours = snapshot.bookingDurationHours ?? snapshot.durationHours
  const bookingDates =
    startAt && endAt
      ? `${formatLongDate(startAt)} - ${formatLongDate(endAt)}`
      : formatLongDate(payment.createdAt)

  const detail = {
    serviceTitle: title,
    serviceDescription: payment.description || `${titleCase(payment.module)} payment details`,
    revenueId: payment.orderId,
    sourceModule: isVenue ? 'Venue' : titleCase(payment.module),
    sourceType: sourceTypeLabel(payment.module, pricingType, referenceType),
    sourceId: String(referenceId),
    sourceName: title,
    hostOwner: partnerName || partnerId || '—',
    transactionDate: formatDate(payment.createdAt),
    currency: payment.currency || 'INR',
    paymentStatus: paymentStatus as 'Successful' | 'Pending' | 'Failed',
    payoutLabel: isVenue ? 'Venue Partner Payout' : 'Host Payout',
    revenueBreakdown: {
      grossAmount: formatPlainAmount(gross),
      discounts: formatSignedPlain(discounts),
      refunds: formatSignedPlain(refunds),
      netRevenue: formatPlainAmount(netRevenue),
    },
    taxFeeBreakdown: {
      taxCollected: formatPlainAmount(gstAmount),
      paymentGatewayFee: formatPlainAmount(gatewayFee),
      platformFee: formatPlainAmount(platformFee),
      netPlatformEarnings: formatPlainAmount(netPlatformEarnings),
    },
    revenueFlow: {
      customerPaid: formatInrWhole(gross),
      afterDiscounts: formatInrWhole(afterDiscounts),
      afterRefunds: formatInrWhole(afterRefunds),
      platformCommission: formatInrWhole(platformFee),
      gatewayDeduction: formatInrWhole(gatewayFee),
      finalPlatformEarnings: formatInrWhole(netPlatformEarnings),
      hostPayout: isReceivable ? '—' : formatInrWhole(hostPayout),
    },
    transactionReferences: {
      gatewayName: 'Razorpay',
      gatewayTransactionId: payment.razorpayPaymentId || payment.razorpayOrderId || '—',
      platformRecordId: payment.orderId,
      settlementDate: formatLongDate(payment.updatedAt || payment.createdAt),
    },
    additionalVenueContext: showVenueContext
      ? {
          bookingDates,
          duration: padDuration(durationHours),
          eventType:
            str(snapshot.eventType) || str(snapshot.venueType) || str(snapshot.category) || '—',
          cancellationPolicy: str(snapshot.cancellationPolicy) || '48-hour Partial Refund',
          venueId: venueCode(venueId),
          ownerId: venueCode(str(snapshot.ownerId) || partnerId || venueId),
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
            Payment &amp; Finance
          </Link>
          <span> / </span>
          <Link to="/finance/revenue" className="hover:text-brand-text transition-colors">
            Revenue Overview
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <FinanceDetailShell>
        <section className={cn(cardClass, 'p-5')}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className={sectionTitleClass}>Service Information</h2>
              <p className={cn(sectionSubtitleClass, 'leading-[20px]')}>
                Provide details about your Consultation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
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
                <Download className="size-4 shrink-0" />
                Download Report
              </Button>
              <Button type="button" onClick={() => setIsNoteModalOpen(true)}>
                <SquarePen className="size-4 shrink-0" />
                Add Notes
              </Button>
              <Button
                type="button"
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
                <SquareArrowOutUpRight className="size-4 shrink-0" />
                Escalate
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
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
                <FinanceStatusBadge
                  status={detail.paymentStatus}
                  toneClass={financePaymentDetailStatusClass(detail.paymentStatus)}
                />
              }
            />
          </DetailCard>

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
              label={detail.payoutLabel}
              value={detail.revenueFlow.hostPayout}
              valueClassName="text-body-sm-semibold"
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

          <DetailCard title="Additional Venue Context">
            <DetailRow
              label="Booking Dates"
              value={detail.additionalVenueContext?.bookingDates || '—'}
            />
            <DetailRow label="Duration" value={detail.additionalVenueContext?.duration || '—'} />
            <DetailRow label="Event Type" value={detail.additionalVenueContext?.eventType || '—'} />
            <DetailRow
              label="Cancellation Policy"
              value={detail.additionalVenueContext?.cancellationPolicy || '—'}
            />
            <DetailRow label="Venue ID" value={detail.additionalVenueContext?.venueId || '—'} />
            <DetailRow label="Owner ID" value={detail.additionalVenueContext?.ownerId || '—'} />
          </DetailCard>
        </div>

        <FinanceInternalNotesCard resourceId={payment._id} />
      </FinanceDetailShell>

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
              onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save note')),
            },
          )
        }}
      />
    </div>
  )
}
