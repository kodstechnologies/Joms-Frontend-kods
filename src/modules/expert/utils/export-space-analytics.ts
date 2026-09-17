import { exportSheetsToFile } from '@/shared/utils/export-utils'

import type { VenueViewAnalyticsMetricCard } from './venue-view-analytics-metrics'
import type { SpaceAnalyticsResponse } from '../type/space-analytics.types'

export async function exportSpaceAnalytics(
  data: {
    spaceId?: string
    overviewCards: VenueViewAnalyticsMetricCard[]
    cashFlow: SpaceAnalyticsResponse['cashFlow']
    timeSlots: SpaceAnalyticsResponse['timeSlots']
    ratings: SpaceAnalyticsResponse['ratingDistribution']
    cancellations: SpaceAnalyticsResponse['cancellations']
    timeSlotInsight?: string
  },
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)
  const prefix = `space_analytics_${data.spaceId || 'export'}_${date}`

  await exportSheetsToFile(
    [
      {
        name: 'Overview',
        headers: ['Metric', 'Value', 'Notes'],
        rows: data.overviewCards.map((card) => [card.label, card.value, card.note || '']),
      },
      {
        name: 'Cash Flow',
        headers: ['Month', 'Cash Inflow', 'Cash Outflow', 'Net Cash Flow'],
        rows: data.cashFlow.map((point) => [point.month, point.in, point.out, point.net]),
      },
      {
        name: 'Time Slots',
        headers: ['Time Slot', 'Bookings', 'Revenue'],
        rows: data.timeSlots.map((row) => [row.slot, row.bookings, row.revenue]),
      },
      {
        name: 'Cancellations',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Cancellations', data.cancellations.total],
          ['Revenue Lost', data.cancellations.revenueLost],
          ['Time Slot Insight', data.timeSlotInsight || ''],
        ],
      },
      {
        name: 'Ratings',
        headers: ['Stars', 'Reviews', 'Share (%)'],
        rows: data.ratings.map((rating) => [rating.stars, rating.reviews, rating.percent]),
      },
    ],
    prefix,
    format,
  )
}
