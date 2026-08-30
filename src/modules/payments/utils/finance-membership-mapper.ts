import type { MembershipFeatures } from '@/modules/memberships/types/membership'
import type {
  MembershipSubscription,
  SubscriptionStatus,
} from '@/modules/memberships/types/membership-subscription'
import {
  formatCurrency,
  formatMembershipDate,
  getFeatureLines,
} from '@/modules/memberships/utils/membership-format'

export type FinanceMembershipStatus = 'Active' | 'Paused' | 'Cancelled' | 'Expired' | 'Suspended'

export type FinanceMembershipRow = {
  id: string
  subscriptionId: string
  name: string
  planName: string
  amount: string
  billingCycle: string
  startDate: string
  nextBilling: string
  status: FinanceMembershipStatus
}

export type FinanceMembershipDetail = {
  id: string
  subscriptionId: string
  plan: string
  startDate: string
  status: FinanceMembershipStatus
  billingCycle: string
  amount: string
  paymentMethod: string
  lastPayment: string
  nextRenewal: string
  userName: string
  userId: string
  userType: string
  planFeatures: string[]
  rawStatus: SubscriptionStatus
}

const STATUS_LABEL: Record<SubscriptionStatus, FinanceMembershipStatus> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
  expired: 'Expired',
  suspended: 'Suspended',
}

export function toFinanceStatus(status: SubscriptionStatus): FinanceMembershipStatus {
  return STATUS_LABEL[status] ?? 'Expired'
}

export function formatFinanceDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

export function mapSubscriptionToFinanceRow(
  subscription: MembershipSubscription,
): FinanceMembershipRow {
  return {
    id: subscription._id,
    subscriptionId: subscription.subscriptionId,
    name: subscription.partnerName,
    planName: subscription.planName,
    amount: formatCurrency(subscription.purchasedPrice),
    billingCycle: subscription.billingCycleName,
    startDate: formatFinanceDate(subscription.startedAt),
    nextBilling: formatFinanceDate(subscription.nextBillingDate ?? subscription.expiresAt),
    status: toFinanceStatus(subscription.status),
  }
}

function resolvePlanFeatures(subscription: MembershipSubscription): string[] {
  const plan = subscription.membershipPlanId
  if (plan && typeof plan === 'object' && plan.features) {
    return getFeatureLines(plan.features as MembershipFeatures)
  }
  return []
}

export function mapSubscriptionToFinanceDetail(
  subscription: MembershipSubscription,
): FinanceMembershipDetail {
  return {
    id: subscription._id,
    subscriptionId: subscription.subscriptionId,
    plan: subscription.planName,
    startDate: formatMembershipDate(subscription.startedAt),
    status: toFinanceStatus(subscription.status),
    billingCycle: subscription.billingCycleName,
    amount: formatCurrency(subscription.purchasedPrice),
    paymentMethod: subscription.paymentInfo?.paymentMethod || '—',
    lastPayment: formatMembershipDate(
      subscription.paymentInfo?.lastPaymentAt ?? subscription.startedAt,
    ),
    nextRenewal: formatMembershipDate(subscription.nextBillingDate ?? subscription.expiresAt),
    userName: subscription.partnerName,
    userId: String(subscription.partnerId),
    userType: 'Partner',
    planFeatures: resolvePlanFeatures(subscription),
    rawStatus: subscription.status,
  }
}
