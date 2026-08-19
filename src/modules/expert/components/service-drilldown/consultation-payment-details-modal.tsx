import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { BaseModal } from '@/shared/components/modal/base-modal'
import { cn } from '@/shared/lib/cn'

import { useAdminConsultationPayment } from '../../hooks/use-consultation-drilldown'
import { EmptyState, ShimmerBlock } from './drilldown-primitives'
import { DASH, formatCurrency, formatDateTimeIst, titleCase } from './drilldown-format'

type ConsultationPaymentDetailsModalProps = {
  open: boolean
  bookingId: string | null
  onClose: () => void
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

const money = (value?: number | null, currency = 'INR') => formatCurrency(value, currency, 2)

export function ConsultationPaymentDetailsModal({
  open,
  bookingId,
  onClose,
}: ConsultationPaymentDetailsModalProps) {
  const { data, isLoading, isError, error } = useAdminConsultationPayment(
    bookingId ?? undefined,
    open,
  )
  const detail = data?.data
  const payment = detail?.payment
  const breakdown = payment?.breakdown
  const currency = payment?.currency || detail?.booking.currency || 'INR'
  const primaryPayment = payment?.payments?.[payment.payments.length - 1] ?? null
  const originalPrice = breakdown?.servicePrice ?? detail?.booking.price
  const discountedPrice = breakdown?.discountedPrice ?? originalPrice
  const hasDiscount = Boolean(breakdown?.discountPercent) || (breakdown?.discountAmount || 0) > 0
  const paymentStatus = String(primaryPayment?.status || detail?.booking.paymentStatus || '')
  const isSuccessful = /paid|success|fulfill|captur|complete/i.test(paymentStatus)
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
      ?.message ||
    (error as { message?: string })?.message ||
    'This booking payment could not be loaded.'

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
        </div>
      ) : isError && !detail ? (
        <EmptyState message={errorMessage} />
      ) : !detail ? (
        <EmptyState message="This booking payment could not be loaded." />
      ) : (
        <div className="space-y-5">
          <section className="rounded-xl bg-black/40 p-4">
            <h3 className="text-body-md font-semibold text-white">{detail.consultation.title}</h3>
            <p className="text-muted mt-2 text-[12px]">{detail.consultation.category}</p>
            <p className="text-muted mt-3 text-[12px]">
              Expert: {detail.expert?.name || DASH} ({detail.expert?.expertCode || 'EXP-'})
            </p>
            <p className="text-muted text-[12px]">
              Client: {detail.client.name || DASH} ({detail.client.clientCode || 'CLT-'})
            </p>
            <p className="text-muted text-[12px]">
              Date / Time: {formatDateTimeIst(detail.booking.startAt)}
              {detail.booking.durationLabel ? ` · ${detail.booking.durationLabel}` : ''}
            </p>
          </section>

          <section className="space-y-1">
            <Row
              label="Session Price"
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
              label="Discount / Coupon"
              value={
                breakdown?.discountPercent
                  ? `${breakdown.discountPercent}%`
                  : breakdown?.discountAmount
                    ? money(breakdown.discountAmount, currency)
                    : 'None'
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
            <Row label="Transaction ID" value={primaryPayment?.transactionId || DASH} />
            <Row
              label="Payment Method"
              value={primaryPayment?.paymentMethod ? titleCase(primaryPayment.paymentMethod) : DASH}
            />
            <Row
              label="Payment Status"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {isSuccessful ? <Check className="text-brand-positive size-3.5" /> : null}
                  {isSuccessful ? 'Successful' : titleCase(paymentStatus)}
                </span>
              }
              valueClassName={isSuccessful ? 'text-brand-positive' : undefined}
            />
          </section>
        </div>
      )}
    </BaseModal>
  )
}
