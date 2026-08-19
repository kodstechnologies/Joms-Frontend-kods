import { VENUE_PROFILE_ANALYTICS_METRICS_CATALOG } from '@/modules/expert/config/venue-profile-analytics-metrics.config'
import type { VenueProfileAnalyticsResponse } from '@/modules/expert/type/venue-analytics.types'

export type VenueProfileAnalyticsMetricCard = {
  id: string
  label: string
  value: string
}

function formatMetric(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '0'
  if (typeof value === 'number') return value.toLocaleString('en-IN')
  return String(value)
}

export function buildVenueProfileAnalyticsMetricCards(
  analytics?: VenueProfileAnalyticsResponse | null,
  venueAnalytics?: Record<string, unknown> | null,
): VenueProfileAnalyticsMetricCard[] {
  const cardsFromApi = analytics?.profileCards

  const valueById: Record<string, string> = {
    'events-hosted':
      cardsFromApi?.eventsHosted || formatMetric(venueAnalytics?.eventsHosted as string | number),
    'total-attendees':
      cardsFromApi?.totalAttendees ||
      formatMetric(venueAnalytics?.totalAttendees as string | number),
    'repeat-attendees':
      cardsFromApi?.repeatAttendees ||
      formatMetric(venueAnalytics?.repeatAttendees as string | number),
    'upcoming-events':
      cardsFromApi?.upcomingEvents ||
      formatMetric(venueAnalytics?.upcomingEvents as string | number),
    'event-completion-rate':
      cardsFromApi?.eventCompletionRate ||
      formatMetric(venueAnalytics?.eventCompletionRate as string | number),
    'avg-response-time':
      cardsFromApi?.avgResponseTime ||
      formatMetric(venueAnalytics?.avgResponseTime as string | number),
    'events-rejected':
      cardsFromApi?.noOfEventsRejected ||
      formatMetric(venueAnalytics?.noOfEventsRejected as string | number),
    'events-suspended':
      cardsFromApi?.noOfEventsSuspended ||
      formatMetric(venueAnalytics?.noOfEventsSuspended as string | number),
  }

  return VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: valueById[metric.id] ?? '0',
  }))
}
