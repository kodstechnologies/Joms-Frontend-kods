import type { ExpertAnalyticsData } from '@/modules/expert/type/expert-profile'
import { EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG } from '@/modules/expert/config/expert-profile-analytics-metrics.config'

export type ExpertProfileAnalyticsMetricCard = {
  id: string
  label: string
  value: string
}

const DASH = '—'

const formatNumber = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return DASH
  return Number(value).toLocaleString('en-IN')
}

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return DASH
  return `${Number(value)}%`
}

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return DASH
  return `₹${Number(value).toLocaleString('en-IN')}`
}

const formatDate = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMembershipOrders = (orders?: Record<string, number> | null) => {
  if (!orders || typeof orders !== 'object') return DASH
  const parts = Object.entries(orders)
    .filter(([, count]) => Number(count) > 0)
    .map(([tier, count]) => `${tier}: ${count}`)
  return parts.length ? parts.join(', ') : DASH
}

export function buildExpertProfileAnalyticsMetricCards(
  analytics?: ExpertAnalyticsData | null,
): ExpertProfileAnalyticsMetricCard[] {
  const summary = analytics?.profileSummary
  const market = analytics?.marketplacePerformance
  const revenue = analytics?.revenuePerformance
  const listing = analytics?.listingOverview
  const customer = analytics?.customerAnalytics
  const ops = analytics?.operationalPerformance
  const visibility = analytics?.visibilityMetrics
  const ratings = analytics?.ratingsSummary
  const nps = analytics?.nps || customer?.netPromoterScore

  const valueById: Record<string, string> = {
    'account-status': summary?.accountStatus || DASH,
    'last-active': formatDate(summary?.lastActiveAt),
    'membership-type': summary?.membershipType || DASH,
    'expert-category': summary?.profession || summary?.expertType || DASH,
    'overall-rating': ratings?.available
      ? `${ratings.average ?? 0}${ratings.count ? ` (${ratings.count})` : ''}`
      : DASH,
    'profile-views': visibility?.profileViews?.available
      ? formatNumber(visibility.profileViews.count)
      : DASH,
    'services-listed': formatNumber(market?.servicesListed ?? listing?.servicesListed),
    'active-services': formatNumber(market?.activeServices),
    'paused-services': formatNumber(market?.pausedServices),
    'closed-services': formatNumber(market?.closedServices),
    'deleted-services': formatNumber(market?.deletedServices),
    'consultations-listed': formatNumber(
      market?.consultationsListed ?? listing?.consultationsListed,
    ),
    'quotations-received': formatNumber(market?.quotationsReceived),
    'proposals-created': formatNumber(market?.proposalsCreated ?? listing?.proposalsCreated),
    'orders-completed': formatNumber(market?.ordersCompleted ?? listing?.ordersCompleted),
    'orders-in-progress': formatNumber(market?.ordersInProgress ?? listing?.ordersInProgress),
    'terminated-orders': formatNumber(market?.terminatedOrders ?? listing?.terminatedOrders),
    'consultations-completed': formatNumber(market?.consultationsCompleted),
    'scheduled-consultations': formatNumber(market?.scheduledConsultations),
    'terminated-consultations': formatNumber(market?.terminatedConsultations),
    'conversion-rate': formatPercent(market?.conversionRate),
    'total-revenue': formatCurrency(revenue?.totalRevenue ?? listing?.totalEarnings ?? null),
    'revenue-growth-rate': formatPercent(
      revenue?.revenueGrowthRate ?? analytics?.revenueGrowthRate,
    ),
    'highest-demand-service': revenue?.highestDemandService || DASH,
    'highest-revenue-service': revenue?.highestRevenueService || DASH,
    'average-order-value': formatCurrency(revenue?.averageOrderValue ?? listing?.averageOrderValue),
    'custom-orders-created': formatNumber(
      revenue?.customOrdersCreated ?? listing?.customOrdersCreated,
    ),
    'custom-orders-accepted': formatNumber(
      revenue?.customOrdersAccepted ?? listing?.customOrdersAccepted,
    ),
    'custom-orders-completed': formatNumber(
      revenue?.customOrdersCompleted ?? listing?.customOrdersCompleted,
    ),
    'custom-orders-rejected': formatNumber(
      revenue?.customOrdersRejected ?? listing?.customOrdersRejected,
    ),
    'client-satisfaction-score':
      customer?.clientSatisfactionScore != null
        ? formatPercent(customer.clientSatisfactionScore)
        : DASH,
    'repeat-client-rate': formatPercent(
      customer?.repeatClientRate ?? visibility?.repeatClientRate?.percentage,
    ),
    'orders-by-membership': formatMembershipOrders(customer?.ordersByMembership),
    'net-promoter-score':
      nps?.available === false ? DASH : nps?.score != null ? String(nps.score) : DASH,
    'last-service-request-received': formatDate(
      customer?.lastServiceRequestReceived ?? listing?.lastServiceRequestReceived,
    ),
    'last-service-completed': formatDate(
      customer?.lastServiceCompleted ?? listing?.lastServiceCompleted,
    ),
    'order-completion-rate': formatPercent(
      ops?.orderCompletionRate ?? visibility?.orderCompletionRate?.percentage,
    ),
    'average-first-response-time':
      ops?.averageFirstResponseTime || analytics?.serviceAnalytics?.avgResponseTime?.label || DASH,
  }

  return EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: valueById[metric.id] ?? DASH,
  }))
}
