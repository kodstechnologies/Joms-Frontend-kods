import type { ColumnDef } from '@tanstack/react-table'

import type { MembershipSubscription } from '../types/membership-subscription'
import { formatCurrency, formatMembershipDate } from '../utils/membership-format'
import { cn } from '@/shared/lib/cn'

const PLAN_BADGE_COLORS = [
  'bg-rose-500/15 text-rose-300',
  'bg-amber-500/15 text-amber-300',
  'bg-emerald-500/15 text-emerald-300',
  'bg-blue-500/15 text-blue-300',
  'bg-purple-500/15 text-purple-300',
]

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
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
            PLAN_BADGE_COLORS[row.index % PLAN_BADGE_COLORS.length],
          )}
        >
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
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
            row.original.status === 'active' && 'bg-emerald-500/15 text-emerald-300',
            row.original.status === 'paused' && 'bg-amber-500/15 text-amber-300',
            row.original.status === 'cancelled' && 'bg-rose-500/15 text-rose-300',
            row.original.status === 'expired' && 'bg-blue-500/15 text-blue-300',
          )}
        >
          {row.original.status}
        </span>
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
