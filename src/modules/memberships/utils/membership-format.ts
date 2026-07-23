import type { MembershipFeatures, MembershipPlan } from '../types/membership'

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

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

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
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
      return 'bg-brand-teal/35 text-brand-progress border-brand-positive/25'
    case 'paused':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/25'
    case 'inactive':
      return 'bg-brand-danger/15 text-brand-danger border-brand-danger/30'
    case 'cancelled':
      return 'bg-brand-danger/15 text-brand-danger border-brand-danger/30'
    case 'deleted':
      return 'bg-brand-danger/15 text-brand-danger border-brand-danger/30'
    default:
      return 'bg-white/10 text-brand-muted border-white/10'
  }
}

export const getFeatureLines = (features: MembershipFeatures) => {
  const lines: string[] = []

  if (features.accessToBasicNetworkingFeatures) {
    lines.push('Access to basic networking features')
  }

  if (features.joinCommunities.enabled) {
    lines.push(`Join up to ${features.joinCommunities.count} communities`)
  }

  if (features.platformHostedEvents.enabled) {
    lines.push(`Attend ${features.platformHostedEvents.count} events per month`)
  }

  if (features.profileCustomization) {
    lines.push('Basic profile customization')
  }

  if (features.dedicatedAccountManager) {
    lines.push('Dedicated account manager')
  }

  for (const feature of features.customFeatures ?? []) {
    lines.push(feature)
  }

  return lines
}

export const getDiscountedPrice = (price: number, discount: number) => {
  if (!discount) return price
  return price - (price * discount) / 100
}
