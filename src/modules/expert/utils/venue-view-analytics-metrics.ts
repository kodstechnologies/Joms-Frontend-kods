import { VENUE_VIEW_ANALYTICS_METRICS_CATALOG } from '@/modules/expert/config/venue-view-analytics-metrics.config'

export type VenueViewAnalyticsOverviewItem = {
  label: string
  value: string
  note?: string
}

export type VenueViewAnalyticsMetricCard = {
  id: string
  label: string
  value: string
  note?: string
}

const LABEL_TO_METRIC_ID: Record<string, string> = {
  'Total Bookings': 'total-bookings',
  Completed: 'completed',
  'Avg Event Value': 'avg-event-value',
  'Total Revenue': 'total-revenue',
  'Avg Rating': 'avg-rating',
  'Conversion Rate': 'conversion-rate',
}

export function buildVenueViewAnalyticsMetricCards(
  overview: VenueViewAnalyticsOverviewItem[] = [],
): VenueViewAnalyticsMetricCard[] {
  const overviewById = new Map<string, VenueViewAnalyticsOverviewItem>()

  for (const item of overview) {
    const metricId = LABEL_TO_METRIC_ID[item.label]
    if (metricId) {
      overviewById.set(metricId, item)
    }
  }

  return VENUE_VIEW_ANALYTICS_METRICS_CATALOG.map((metric) => {
    const item = overviewById.get(metric.id)
    return {
      id: metric.id,
      label: metric.label,
      value: item?.value ?? '0',
      note: item?.note,
    }
  })
}
