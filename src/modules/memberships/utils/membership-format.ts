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

export const getTypeLabel = (type: MembershipPlan['type']) =>
  type === 'user' ? 'Users' : 'Experts'

export const getStatusLabel = (status: MembershipPlan['status']) =>
  status.charAt(0).toUpperCase() + status.slice(1)

export const getStatusClassName = (status: MembershipPlan['status']) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
    case 'paused':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/25'
    case 'inactive':
      return 'bg-slate-500/15 text-slate-300 border-slate-500/25'
    case 'cancelled':
      return 'bg-orange-500/15 text-orange-300 border-orange-500/25'
    case 'deleted':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/25'
    default:
      return 'bg-white/10 text-slate-300 border-white/10'
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
