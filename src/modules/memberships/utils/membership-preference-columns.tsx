import type { ColumnDef } from '@tanstack/react-table'

import type { MembershipSubscription } from '../types/membership-subscription'
import { formatCurrency, formatMembershipDate } from '../utils/membership-format'
import { cn } from '@/shared/lib/cn'

const BADGE_BASE =
  'inline-flex min-h-5 w-max max-w-full shrink-0 items-center justify-center rounded-[10px] px-2.5 py-0.5 text-center font-semibold tracking-normal whitespace-nowrap'

const getBadgeTextClass = (label?: string | null) => {
  const length = (label || '').trim().length
  if (length > 14) return 'text-[8px] leading-[12px]'
  if (length > 10) return 'text-[9px] leading-[12px]'
  return 'text-[10px] leading-[14px]'
}

const PLAN_BADGE_BY_NAME: Record<string, string> = {
  popular: 'bg-[#F6CB8633] text-[#F6CB86]',
  legend: 'bg-[#155DFC33] text-[#155DFC]',
  'raising star': 'bg-[#FF4C0633] text-[#FF4C06]',
  'rising star': 'bg-[#FF4C0633] text-[#FF4C06]',
  curator: 'bg-[#F6CB8633] text-[#F6CB86]',
  "founder's circle": 'bg-[#00A63E33] text-[#00A63E]',
  'founders circle': 'bg-[#00A63E33] text-[#00A63E]',
  "founders' circle": 'bg-[#00A63E33] text-[#00A63E]',
}

const DEFAULT_PLAN_BADGE = 'bg-[#F6CB8633] text-[#F6CB86]'

const getPlanBadgeClassName = (planName?: string | null) => {
  const key = (planName || '').toLowerCase().replace(/\s+/g, ' ').trim()
  return cn(BADGE_BASE, getBadgeTextClass(planName), PLAN_BADGE_BY_NAME[key] || DEFAULT_PLAN_BADGE)
}

const STATUS_BADGE_BY_NAME: Record<string, string> = {
  pending: 'bg-[#E0A26333] text-[#E0A263]',
  active: 'bg-[#00A63E33] text-[#00A63E]',
  resolved: 'bg-[#00A63E33] text-[#00A63E]',
  expired: 'bg-[#C8C8C833] text-[#C8C8C8]',
  dismissed: 'bg-[#C8C8C833] text-[#C8C8C8]',
  paused: 'bg-[#E0A26333] text-[#E0A263]',
  cancelled: 'bg-[#C8C8C833] text-[#C8C8C8]',
  suspended: 'bg-[#E0A26333] text-[#E0A263]',
}

const DEFAULT_STATUS_BADGE = 'bg-[#C8C8C833] text-[#C8C8C8]'

const getStatusBadgeClassName = (status?: string | null) => {
  const key = (status || '').toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
  return cn(
    BADGE_BASE,
    'capitalize',
    getBadgeTextClass(status),
    STATUS_BADGE_BY_NAME[key] || DEFAULT_STATUS_BADGE,
  )
}

const dash = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function buildMembershipDataColumnsById(): Record<
  string,
  ColumnDef<MembershipSubscription>
> {
  return {
    'subscription-id': {
      id: 'subscription-id',
      header: 'Subscription ID',
      cell: ({ row }) => (
        <span className="font-medium text-slate-200">{row.original.subscriptionId}</span>
      ),
    },
    'user-id': {
      id: 'user-id',
      header: 'User ID',
      cell: ({ row }) => dash(row.original.userId || row.original.partnerId),
    },
    username: {
      id: 'username',
      header: 'Username',
      cell: ({ row }) => dash(row.original.username || row.original.partnerName),
    },
    'plan-id': {
      id: 'plan-id',
      header: 'Plan ID',
      cell: ({ row }) => dash(row.original.planId),
    },
    'plan-name': {
      id: 'plan-name',
      header: 'Plan Name',
      cell: ({ row }) => (
        <span className={getPlanBadgeClassName(row.original.planName)}>
          {row.original.planName}
        </span>
      ),
    },
    'plan-cycle': {
      id: 'plan-cycle',
      header: 'Plan Cycle',
      cell: ({ row }) => dash(row.original.billingCycleName),
    },
    'subscription-status': {
      id: 'subscription-status',
      header: 'Subscription Status',
      cell: ({ row }) => (
        <span className={getStatusBadgeClassName(row.original.status)}>{row.original.status}</span>
      ),
    },
    'started-at': {
      id: 'started-at',
      header: 'Started At',
      cell: ({ row }) => formatMembershipDate(row.original.startedAt) || '—',
    },
    'expiry-at': {
      id: 'expiry-at',
      header: 'Expiry At',
      cell: ({ row }) => formatMembershipDate(row.original.expiresAt) || '—',
    },
    'price-paid': {
      id: 'price-paid',
      header: 'Price Paid',
      cell: ({ row }) => formatCurrency(row.original.purchasedPrice),
    },
    'payment-status': {
      id: 'payment-status',
      header: 'Payment Status',
      cell: ({ row }) => dash(row.original.paymentStatus),
    },
    'payment-method': {
      id: 'payment-method',
      header: 'Payment Method',
      cell: ({ row }) =>
        dash(row.original.paymentMethod || row.original.paymentInfo?.paymentMethod),
    },
    'transaction-id': {
      id: 'transaction-id',
      header: 'Transaction ID',
      cell: ({ row }) => dash(row.original.transactionId),
    },
    'previous-plan-name': {
      id: 'previous-plan-name',
      header: 'Previous Plan Name',
      cell: ({ row }) =>
        dash(row.original.previousPlanName || row.original.previousMembership?.planName),
    },
    'auto-renewal': {
      id: 'auto-renewal',
      header: 'Auto Renewal',
      cell: ({ row }) => (row.original.autoRenew ? 'Yes' : 'No'),
    },
    'next-billing-date': {
      id: 'next-billing-date',
      header: 'Next Billing Date',
      cell: ({ row }) =>
        row.original.nextBillingDate
          ? formatMembershipDate(row.original.nextBillingDate) || '—'
          : '—',
    },
    source: {
      id: 'source',
      header: 'Source',
      cell: ({ row }) => dash(row.original.source || row.original.sourceApp),
    },
    'coupon-code': {
      id: 'coupon-code',
      header: 'Coupon Code',
      cell: ({ row }) => dash(row.original.couponCode),
    },
    'discount-amount': {
      id: 'discount-amount',
      header: 'Discount Amount',
      cell: ({ row }) =>
        row.original.discountAmount == null ? '—' : formatCurrency(row.original.discountAmount),
    },
    'last-renewed-at': {
      id: 'last-renewed-at',
      header: 'Last Renewed At',
      cell: ({ row }) =>
        row.original.lastRenewedAt ? formatMembershipDate(row.original.lastRenewedAt) || '—' : '—',
    },
    'created-at': {
      id: 'created-at',
      header: 'Created At',
      cell: ({ row }) =>
        row.original.createdAt ? formatMembershipDate(row.original.createdAt) || '—' : '—',
    },
    'updated-at': {
      id: 'updated-at',
      header: 'Updated At',
      cell: ({ row }) =>
        row.original.updatedAt ? formatMembershipDate(row.original.updatedAt) || '—' : '—',
    },
  }
}
