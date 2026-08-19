import type { ReactNode } from 'react'
import { Check, Image as ImageIcon } from 'lucide-react'

import { BaseModal } from '@/shared/components/modal/base-modal'
import { cn } from '@/shared/lib/cn'

import { useAdminOrderPayment } from '../../hooks/use-service-drilldown'
import type {
  AdminOrderPayment,
  OrderMilestone,
  PaymentMilestoneCard,
} from '../../type/service-drilldown'
import { EmptyState, ShimmerBlock } from './drilldown-primitives'
import { DASH, formatCurrency, formatDateTime, titleCase } from './drilldown-format'

type ServicePreview = {
  title?: string | null
  category?: string | null
  pricingType?: string | null
  image?: string | null
  serviceCode?: string | null
}

type PaymentDetailsModalProps = {
  open: boolean
  orderId: string | null
  orderType?: 'order' | 'proposal'
  fallbackService?: ServicePreview | null
  onClose: () => void
}

const money = (value?: number | null, currency = 'INR') => formatCurrency(value, currency, 2)

const durationLabel = (start?: string | null, end?: string | null) => {
  if (!start || !end) return DASH
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return DASH
  const days = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000))
  return `${days} day${days === 1 ? '' : 's'}`
}

const milestoneStatusTone = (status?: string | null) => {
  const normalized = String(status || '').toLowerCase()
  if (
    normalized === 'paid' ||
    normalized === 'approved' ||
    normalized === 'payment_completed' ||
    normalized === 'released'
  ) {
    return { label: 'Paid', className: 'bg-brand-positive/20 text-brand-positive' }
  }
  if (normalized === 'in_progress' || normalized === 'ongoing' || normalized === 'held') {
    return { label: 'In Progress', className: 'bg-[#6B4A3A] text-white' }
  }
  return { label: titleCase(status), className: 'bg-white/10 text-white' }
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-body-sm text-muted">{label}</span>
      <span className={cn('text-body-sm text-right font-medium text-white', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

function TimelineStep({ label, at }: { label: string; at?: string | null }) {
  const complete = Boolean(at)
  return (
    <li className="flex items-start justify-between gap-4 py-2">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
            complete ? 'bg-brand-positive text-black' : 'border border-white/30',
          )}
        >
          {complete ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
        <span className="text-body-sm text-white">{label}</span>
      </div>
      <span className="text-muted shrink-0 text-[11px]">{at ? formatDateTime(at) : DASH}</span>
    </li>
  )
}

const buildMilestoneCards = (detail: AdminOrderPayment) => {
  const financeCards = detail.payment?.milestones ?? []
  if (financeCards.length) return financeCards

  return detail.milestones.map(
    (milestone: OrderMilestone): PaymentMilestoneCard => ({
      id: milestone._id,
      milestoneIndex: milestone.index,
      title: milestone.title,
      status: milestone.status,
      clientPaid: milestone.advanceAmount ?? milestone.price,
      platformCommission: 0,
      taxAmount: 0,
      finalPayoutAmount: milestone.price,
      startDate: milestone.paidAt ?? null,
      endDate: milestone.approvedAt ?? milestone.completedAt ?? null,
      paymentTimeline: {
        milestoneFunded: milestone.paidAt ?? null,
        milestoneApprovedByUser: milestone.approvedAt ?? null,
        payoutReleasedToExpert: null,
        milestoneCompleted: milestone.completedAt ?? milestone.approvedAt ?? null,
      },
    }),
  )
}

export function PaymentDetailsModal({
  open,
  orderId,
  orderType = 'order',
  fallbackService,
  onClose,
}: PaymentDetailsModalProps) {
  const { data, isLoading, isError, error } = useAdminOrderPayment(
    orderId ?? undefined,
    orderType,
    open,
  )
  const detail = data?.data
  const payment = detail?.payment
  const breakdown = payment?.breakdown
  const currency = payment?.currency || detail?.order.currency || 'INR'
  const primaryPayment = payment?.payments?.[payment.payments.length - 1] ?? null

  const service = {
    title: detail?.service?.title || fallbackService?.title || detail?.order.title || DASH,
    category: detail?.service?.category || fallbackService?.category || DASH,
    pricingType:
      detail?.service?.pricingType || fallbackService?.pricingType || detail?.order.pricingType,
    image: detail?.service?.image || fallbackService?.image || null,
    serviceCode: detail?.service?.serviceCode || fallbackService?.serviceCode || null,
  }

  const originalPrice = breakdown?.servicePrice ?? detail?.order.price
  const discountedPrice = breakdown?.discountedPrice ?? originalPrice
  const hasDiscount = Boolean(breakdown?.discountPercent) || (breakdown?.discountAmount || 0) > 0
  const milestoneCards = detail ? buildMilestoneCards(detail) : []
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
      ?.message ||
    (error as { message?: string })?.message ||
    'This order could not be loaded.'

  return (
    <BaseModal
      open={open}
      title="Payment Details"
      onClose={onClose}
      className="max-w-[720px] !bg-[#141414]"
    >
      {isLoading ? (
        <div className="space-y-3">
          <ShimmerBlock className="h-28 w-full" />
          <ShimmerBlock className="h-32 w-full" />
          <ShimmerBlock className="h-24 w-full" />
        </div>
      ) : isError && !detail ? (
        <EmptyState message={errorMessage} />
      ) : !detail ? (
        <EmptyState message="This order could not be loaded." />
      ) : (
        <div className="space-y-5">
          <section className="flex gap-4 rounded-xl bg-black/40 p-4">
            <div className="h-[88px] w-[128px] shrink-0 overflow-hidden rounded-lg bg-black">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title || 'Service'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-muted flex h-full flex-col items-center justify-center gap-1">
                  <ImageIcon className="size-5" />
                  <span className="text-[10px]">No image</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-body-md truncate font-semibold text-white">{service.title}</h3>
              <p className="text-muted mt-2 text-[12px]">Category: {service.category || DASH}</p>
              <p className="text-muted text-[12px]">
                Service Type: {titleCase(service.pricingType) || DASH}
              </p>
              <p className="text-muted text-[12px]">Service ID: {service.serviceCode || DASH}</p>
            </div>
          </section>

          <section className="space-y-1">
            <Row
              label="Total Price"
              value={
                hasDiscount ? (
                  <span className="flex items-center gap-2">
                    <span className="text-muted line-through">
                      {money(originalPrice, currency)}
                    </span>
                    <span>{money(discountedPrice, currency)}</span>
                  </span>
                ) : (
                  money(discountedPrice, currency)
                )
              }
            />
            <Row
              label="Discount"
              value={
                breakdown?.discountPercent
                  ? `${breakdown.discountPercent}%`
                  : breakdown?.discountAmount
                    ? money(breakdown.discountAmount, currency)
                    : '0%'
              }
            />
            <Row
              label="Platform Fee"
              value={breakdown ? money(breakdown.platformFee, currency) : DASH}
            />
            <Row
              label={
                breakdown?.taxRatePercent != null
                  ? `Tax (${breakdown.taxRatePercent}%)`
                  : breakdown?.taxType || 'Tax'
              }
              value={breakdown ? money(breakdown.taxAmount, currency) : DASH}
            />
            <Row
              label="Total Paid"
              value={breakdown ? money(breakdown.totalPaid, currency) : DASH}
              valueClassName="font-semibold text-brand-positive"
            />
          </section>

          <section className="rounded-xl bg-black/40 p-4">
            <Row
              label="Transaction ID"
              value={primaryPayment?.transactionId || primaryPayment?.orderId || DASH}
            />
            <Row
              label="Payment Method"
              value={primaryPayment?.paymentMethod ? titleCase(primaryPayment.paymentMethod) : DASH}
            />
            <Row
              label="Payment Status"
              value={
                primaryPayment?.statusLabel ||
                titleCase(primaryPayment?.status) ||
                titleCase(detail.order.paymentStatus)
              }
              valueClassName={
                String(primaryPayment?.status || detail.order.paymentStatus)
                  .toLowerCase()
                  .match(/paid|fulfilled|success/)
                  ? 'text-brand-positive'
                  : undefined
              }
            />
          </section>

          {milestoneCards.length > 0 ? (
            <div className="space-y-4">
              {milestoneCards.map((milestone, index) => {
                const tone = milestoneStatusTone(milestone.status)
                const title = milestone.title?.startsWith('Milestone')
                  ? milestone.title
                  : `Milestone ${index + 1}: ${milestone.title}`
                return (
                  <section key={milestone.id || index} className="rounded-xl bg-black/40 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h4 className="text-body-sm font-semibold text-white">{title}</h4>
                      <span
                        className={cn(
                          'rounded-md px-2.5 py-1 text-[10px] font-semibold',
                          tone.className,
                        )}
                      >
                        {tone.label}
                      </span>
                    </div>
                    <ul>
                      <TimelineStep
                        label="Milestone Funded"
                        at={milestone.paymentTimeline.milestoneFunded}
                      />
                      <TimelineStep
                        label="Milestone Approved by User"
                        at={milestone.paymentTimeline.milestoneApprovedByUser}
                      />
                      <TimelineStep
                        label="Payout released to Expert"
                        at={milestone.paymentTimeline.payoutReleasedToExpert}
                      />
                      <TimelineStep
                        label="Milestone Completed"
                        at={milestone.paymentTimeline.milestoneCompleted}
                      />
                    </ul>
                    <div className="text-muted mt-3 space-y-1 border-t border-white/10 pt-3 text-[12px]">
                      <p>Started On: {formatDateTime(milestone.startDate)}</p>
                      <p>Ended On: {formatDateTime(milestone.endDate)}</p>
                      <p>Total Duration: {durationLabel(milestone.startDate, milestone.endDate)}</p>
                    </div>
                  </section>
                )
              })}
            </div>
          ) : null}
        </div>
      )}
    </BaseModal>
  )
}
