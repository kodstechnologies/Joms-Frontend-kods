import type { MembershipFeatures, MembershipPlan, MembershipPlanConfig } from '../types/membership'
import type { MembershipSubscription } from '../types/membership-subscription'

export const resolveSubscriptionPlanName = (
  subscription: MembershipSubscription,
  plan?: MembershipPlan | null,
) => {
  if (plan?.planName) return plan.planName

  const populatedPlanName =
    subscription.membershipPlanId && typeof subscription.membershipPlanId === 'object'
      ? subscription.membershipPlanId.planName
      : null

  if (populatedPlanName) return populatedPlanName

  const rawName = subscription.planName?.trim() ?? ''
  const billingCycle = subscription.billingCycleName?.trim()

  if (!rawName || !billingCycle) return rawName

  const suffix = ` ${billingCycle}`
  if (rawName.endsWith(suffix)) {
    return rawName.slice(0, -suffix.length).trim()
  }

  if (rawName.endsWith(billingCycle)) {
    return rawName.slice(0, -billingCycle.length).trim()
  }

  return rawName
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export const formatMembershipPriceValue = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)

export const formatMembershipDate = (value?: string | null) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export const formatMembershipDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export const formatMembershipTimelineDate = (value?: string | null) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export const formatMembershipTimelineTime = (value?: string | null) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
}

type HistoryEntry = {
  action: string
  fromPlanName?: string
  toPlanName?: string
  billingCycleName?: string
  performedBy?: string
  performedAt?: string
}

export const getHistoryActionTitle = (action: string) => {
  switch (action) {
    case 'purchase':
      return 'Purchased Membership'
    case 'upgrade':
      return 'Upgraded Membership'
    case 'downgrade':
      return 'Downgraded Membership'
    case 'cancel':
      return 'Canceled Membership'
    case 'extend':
      return 'Extended Membership'
    default:
      return action.charAt(0).toUpperCase() + action.slice(1)
  }
}

export const getHistoryActionDescription = (entry: HistoryEntry, fallbackPrice?: number) => {
  const priceText = fallbackPrice ? formatCurrency(fallbackPrice) : ''
  const cycleSuffix = entry.billingCycleName
    ? `${priceText ? `${priceText}/` : ''}${entry.billingCycleName}`
    : priceText

  switch (entry.action) {
    case 'purchase':
      return `Bought "${entry.toPlanName ?? 'plan'}" plan${cycleSuffix ? ` of ${cycleSuffix}` : ''}`
    case 'upgrade': {
      const performer = entry.performedBy?.toLowerCase() ?? ''
      if (performer === 'admin' || performer === 'platform') {
        return `Upgraded by the Platform for "${entry.toPlanName ?? 'plan'}" plan`
      }
      return `Upgraded to "${entry.toPlanName ?? 'plan'}" plan${cycleSuffix ? ` of ${cycleSuffix}` : ''}`
    }
    case 'downgrade':
      return `Asked the platform to Downgrade to "${entry.toPlanName ?? 'plan'}" Plan${cycleSuffix ? ` for ${cycleSuffix}` : ''}`
    case 'cancel':
      return `Canceled the plan "${entry.fromPlanName ?? entry.toPlanName ?? 'plan'}"${priceText ? ` worth of ${priceText}` : ''}`
    case 'extend':
      return `Extended "${entry.toPlanName ?? entry.fromPlanName ?? 'plan'}" membership`
    default:
      return entry.toPlanName ?? entry.fromPlanName ?? 'Membership updated'
  }
}

export const getTypeLabel = (type: MembershipPlan['type']) =>
  type === 'user' ? 'Users' : 'Experts'

export const getStatusLabel = (status: MembershipPlan['status']) =>
  status.charAt(0).toUpperCase() + status.slice(1)

export const getStatusClassName = (status: MembershipPlan['status']) => {
  switch (status) {
    case 'active':
      return 'bg-[#00A63E33] text-[#00A63E] border-transparent'
    case 'paused':
      return 'bg-[#E0A26333] text-[#E0A263] border-transparent'
    case 'inactive':
      return 'bg-[#F6CB8633] text-[#F6CB86] border-transparent'
    case 'cancelled':
      return 'bg-[#C8C8C833] text-[#C8C8C8] border-transparent'
    case 'deleted':
      return 'bg-[#D3191C33] text-[#D3191C] border-transparent'
    default:
      return 'bg-white/10 text-brand-muted border-transparent'
  }
}

/** Figma deleted badge date: DD-MM-YYYY */
export const formatMembershipDateSlash = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

export const getFeatureLines = (
  features: MembershipFeatures | MembershipPlanConfig | undefined,
) => {
  const lines: string[] = []
  if (!features) return lines

  const planConfig =
    'benefits' in features && Array.isArray((features as MembershipPlanConfig).benefits)
      ? (features as MembershipPlanConfig)
      : (features as MembershipFeatures).planConfig

  if (planConfig) {
    for (const item of planConfig.benefits ?? []) {
      if (item.enabled !== false) lines.push(item.label)
    }
    for (const item of planConfig.partnerApp ?? []) {
      if (item.enabled !== false) lines.push(item.label)
    }
    return lines
  }

  const legacy = features as MembershipFeatures
  if (legacy.profileCustomization) lines.push('Profile customization')
  if (legacy.dedicatedAccountManager) lines.push('Dedicated Account Manager')
  for (const feature of legacy.customFeatures ?? []) lines.push(feature)
  return lines
}

export const getDiscountedPrice = (price: number, discount: number) => {
  if (!discount) return price
  return price - (price * discount) / 100
}
