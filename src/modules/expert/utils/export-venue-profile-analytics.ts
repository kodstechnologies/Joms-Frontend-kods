import type { VenueProfileAnalyticsMetricCard } from '@/modules/expert/utils/venue-profile-analytics-metrics'
import type { VenueProfileAnalyticsResponse } from '@/modules/expert/type/venue-analytics.types'
import { exportSheetsToFile } from '@/shared/utils/export-utils'

export type VenueProfileAnalyticsExportData = {
  venueName: string
  venueId?: string
  metricCards: VenueProfileAnalyticsMetricCard[]
  analytics?: VenueProfileAnalyticsResponse | null
}

const metricItemsToRows = (items?: Array<{ label: string; value: string }>) =>
  (items || []).map((item) => [item.label, item.value])

export async function exportVenueProfileAnalyticsToExcel(
  data: VenueProfileAnalyticsExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)
  const safeName = data.venueName.replace(/[^\w-]+/g, '_').slice(0, 40) || 'venue'
  const filePrefix = `venue_profile_analytics_${safeName}_${date}`
  const analytics = data.analytics

  await exportSheetsToFile(
    [
      {
        name: 'Overview',
        headers: ['Field', 'Value'],
        rows: [
          ['Venue', data.venueName],
          ['Venue ID', data.venueId ?? ''],
          ...data.metricCards.map((item) => [item.label, item.value]),
        ],
      },
      {
        name: 'Visibility',
        headers: ['Metric', 'Value'],
        rows: metricItemsToRows(analytics?.overview?.visibilityMetrics),
      },
      {
        name: 'Bookings',
        headers: ['Metric', 'Value'],
        rows: [
          ...metricItemsToRows(analytics?.bookings?.eventMetrics),
          ...metricItemsToRows(analytics?.bookings?.meetupMetrics),
        ],
      },
      {
        name: 'Revenue KPIs',
        headers: ['Metric', 'Value'],
        rows: metricItemsToRows(analytics?.revenue?.revenueKpis),
      },
      {
        name: 'Spaces',
        headers: ['Space', 'Category', 'Bookings', 'Rating', 'Utilization %', 'Revenue', 'Status'],
        rows: (analytics?.spaces?.allSpaces || []).map((space) => [
          space.name,
          space.category,
          space.bookings,
          space.rating,
          space.utilization,
          space.revenue,
          space.status,
        ]),
      },
      {
        name: 'Event Bookings',
        headers: ['Booking ID', 'Space', 'Host', 'Date', 'Revenue', 'Status'],
        rows: (analytics?.bookings?.eventBookings || []).map((booking) => [
          booking.id,
          booking.space,
          booking.host,
          booking.date,
          booking.revenue,
          booking.status,
        ]),
      },
      {
        name: 'Revenue Trend',
        headers: ['Period', 'Events', 'Meetups'],
        rows: (analytics?.revenue?.revenueTrend || []).map((point) => [
          point.date,
          point.events,
          point.meetups,
        ]),
      },
    ],
    filePrefix,
    format,
  )
}
