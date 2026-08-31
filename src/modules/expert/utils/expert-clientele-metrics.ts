import {
  EXPERT_CLIENTELE_METRICS_CATALOG,
  type ExpertClienteleMetricCatalogItem,
} from '@/modules/expert/config/expert-clientele-metrics.config'

export type ExpertClienteleMetricsInput = {
  servicesListed: number
  consultationsListed: number
  uniqueClients: number
  clientSatisfactionScore: number
  totalOrdersBookings: number
  activeOrdersBookings: number
  completedOrdersBookings: number
  cancelledOrdersBookings: number
  clientsByMembership: Record<string, number>
  repeatClientPercent: number
  nps: number
  avgRating: number
  noOfReviews: number
}

export type ExpertClienteleMetricCard = {
  id: string
  label: string
  value: string
  hint?: string
}

const formatPercent = (val?: number | null) => {
  if (val == null || Number.isNaN(Number(val))) return '0.0%'
  return `${Number(val).toFixed(1)}%`
}

export function buildExpertClienteleMetricCards(
  metrics: ExpertClienteleMetricsInput,
  membershipHint: string,
): ExpertClienteleMetricCard[] {
  const clientsByMembershipTotal = Object.values(metrics.clientsByMembership || {}).reduce(
    (sum, count) => sum + Number(count || 0),
    0,
  )

  const valueById: Record<string, { value: string; hint?: string }> = {
    'services-listed': { value: String(metrics.servicesListed) },
    'consultations-listed': { value: String(metrics.consultationsListed) },
    'unique-clients': { value: String(metrics.uniqueClients) },
    'client-satisfaction-score': { value: formatPercent(metrics.clientSatisfactionScore) },
    'total-orders-bookings': { value: String(metrics.totalOrdersBookings) },
    'active-orders-bookings': { value: String(metrics.activeOrdersBookings) },
    'completed-orders-bookings': { value: String(metrics.completedOrdersBookings) },
    'cancelled-orders-bookings': { value: String(metrics.cancelledOrdersBookings) },
    'clients-by-membership': {
      value: String(clientsByMembershipTotal),
      hint: membershipHint,
    },
    'repeat-client-percent': { value: formatPercent(metrics.repeatClientPercent) },
    nps: { value: String(metrics.nps) },
    'avg-rating': { value: Number(metrics.avgRating || 0).toFixed(1) },
    'no-of-reviews': { value: String(metrics.noOfReviews) },
  }

  return EXPERT_CLIENTELE_METRICS_CATALOG.map((metric: ExpertClienteleMetricCatalogItem) => ({
    id: metric.id,
    label: metric.label,
    value: valueById[metric.id]?.value ?? '0',
    hint: valueById[metric.id]?.hint,
  }))
}