import { exportSheetsToFile } from '@/shared/utils/export-utils'

type DashboardMetric = {
  id: string
  label: string
  value: string
}

type TrendPoint = {
  month: string
  revenue: number
  avgRevenue: number
  utilization: number
}

type TopVenueRow = {
  name: string
  city: string
  totalVisits: number
  eventAttendance: number
  bookings: number
  repeatVisitors: number
  utilization: number
  revenue: string
  rating: number
  status: string
}

export type VenueDashboardExportData = {
  rangeLabel: string
  metrics: DashboardMetric[]
  trendPoints: TrendPoint[]
  topVenues: TopVenueRow[]
}

export async function exportVenueDashboardToExcel(
  data: VenueDashboardExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)
  const filePrefix = `venue_dashboard_${date}`

  await exportSheetsToFile(
    [
      {
        name: 'Metrics',
        headers: ['Metric', 'Value'],
        rows: [
          ['Date Range', data.rangeLabel],
          ...data.metrics.map((metric) => [metric.label, metric.value]),
        ],
      },
      {
        name: 'Trends',
        headers: ['Month', 'Revenue', 'Avg Revenue', 'Utilization %'],
        rows: data.trendPoints.map((point) => [
          point.month,
          point.revenue,
          point.avgRevenue,
          point.utilization,
        ]),
      },
      {
        name: 'Top Venues',
        headers: [
          'Venue Name',
          'City',
          'Total Visits',
          'Event Attendance',
          'Bookings',
          'Repeat Visitors %',
          'Utilization %',
          'Revenue',
          'Rating',
          'Status',
        ],
        rows: data.topVenues.map((venue) => [
          venue.name,
          venue.city,
          venue.totalVisits,
          venue.eventAttendance,
          venue.bookings,
          venue.repeatVisitors,
          venue.utilization,
          venue.revenue,
          venue.rating,
          venue.status,
        ]),
      },
    ].filter((sheet) => sheet.rows.length > 0),
    filePrefix,
    format,
  )
}
