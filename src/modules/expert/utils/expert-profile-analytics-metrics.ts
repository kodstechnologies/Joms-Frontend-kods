import type { ExpertAnalyticsData } from '@/modules/expert/type/expert-profile'
import { EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG } from '@/modules/expert/config/expert-profile-analytics-metrics.config'

export type ExpertProfileAnalyticsMetricCard = {
  id: string
  label: string
  value: string
}

function formatCount(value: number | undefined | null, suffix = '') {
  if (value == null) return `0${suffix}`
  return `${value.toLocaleString('en-IN')}${suffix}`
}

export function buildExpertProfileAnalyticsMetricCards(
  analytics?: ExpertAnalyticsData | null,
): ExpertProfileAnalyticsMetricCard[] {
  const sa = analytics?.serviceAnalytics

  const valueById: Record<string, string> = {
    'events-hosted': formatCount(sa?.eventsHosted?.value),
    'total-attendees': formatCount(sa?.totalAttendees?.value, sa?.totalAttendees?.value ? '+' : ''),
    'repeat-attendees': formatCount(sa?.repeatAttendees?.value),
    'upcoming-events': formatCount(sa?.upcomingEvents?.value),
    'event-completion-rate':
      sa?.eventCompletionRate?.value != null ? `${sa.eventCompletionRate.value}%` : '0%',
    'avg-response-time': sa?.avgResponseTime?.label || '--',
    'events-rejected': formatCount(sa?.eventsRejected?.value),
    'events-suspended': formatCount(sa?.eventsSuspended?.value),
  }

  return EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: valueById[metric.id] ?? '0',
  }))
}
