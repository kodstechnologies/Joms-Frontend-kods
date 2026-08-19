import type { ExpertAnalyticsData } from '@/modules/expert/type/expert-profile'
import { EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG } from '@/modules/expert/config/expert-profile-analytics-metrics.config'

export type ExpertProfileAnalyticsMetricCard = {
  id: string
  label: string
  value: string
}

function formatTrackedCount(
  metric?: { value?: number | null; available?: boolean } | null,
  suffix = '',
) {
  if (metric?.available === false) return '--'
  if (metric?.value == null) return `0${suffix}`
  return `${metric.value.toLocaleString('en-IN')}${suffix}`
}

export function buildExpertProfileAnalyticsMetricCards(
  analytics?: ExpertAnalyticsData | null,
): ExpertProfileAnalyticsMetricCard[] {
  const sa = analytics?.serviceAnalytics

  const valueById: Record<string, string> = {
    'events-hosted': formatTrackedCount(sa?.eventsHosted),
    'total-attendees': formatTrackedCount(sa?.totalAttendees),
    'repeat-attendees': formatTrackedCount(sa?.repeatAttendees),
    'upcoming-events': formatTrackedCount(sa?.upcomingEvents),
    'event-completion-rate':
      sa?.eventCompletionRate?.available === false
        ? '--'
        : sa?.eventCompletionRate?.value != null
          ? `${sa.eventCompletionRate.value}%`
          : '0%',
    'avg-response-time': sa?.avgResponseTime?.label || '--',
    'events-rejected': formatTrackedCount(sa?.eventsRejected),
    'events-suspended': formatTrackedCount(sa?.eventsSuspended),
  }

  return EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: valueById[metric.id] ?? '0',
  }))
}
