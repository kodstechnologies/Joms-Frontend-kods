import { exportSheetsToFile } from '@/shared/utils/export-utils'

type DashboardMetric = {
  id: string
  label: string
  value: string
  change?: string
  changeNote?: string
}

type ExpertsByCategory = { category: string; count: number }
type RevenueByCategory = { category: string; revenue: number; label?: string }
type RevenueGrowthPoint = { month: string; revenue: number }
type TopHost = {
  name: string
  category: string
  orders: number
  rating: number
  attendees: number
  revenue: string
}

export type ExpertDashboardExportData = {
  rangeLabel: string
  metrics: DashboardMetric[]
  expertsByCategory: ExpertsByCategory[]
  revenueByCategory: RevenueByCategory[]
  revenueGrowth: RevenueGrowthPoint[]
  topHosts: TopHost[]
}

export async function exportExpertDashboardToFile(
  data: ExpertDashboardExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)

  await exportSheetsToFile(
    [
      {
        name: 'Metrics',
        headers: ['Metric', 'Value', 'Change / Notes'],
        rows: [
          ['Date Range', data.rangeLabel, ''],
          ...data.metrics.map((metric) => [
            metric.label,
            metric.value,
            [metric.change, metric.changeNote].filter(Boolean).join(' '),
          ]),
        ],
      },
      {
        name: 'Experts by Category',
        headers: ['Category', 'Count'],
        rows: data.expertsByCategory.map((row) => [row.category, row.count]),
      },
      {
        name: 'Revenue by Category',
        headers: ['Category', 'Revenue'],
        rows: data.revenueByCategory.map((row) => [row.category, row.label || row.revenue]),
      },
      {
        name: 'Revenue Growth',
        headers: ['Month', 'Revenue'],
        rows: data.revenueGrowth.map((row) => [row.month, row.revenue]),
      },
      {
        name: 'Top Hosts',
        headers: [
          'Expert Name',
          'Category',
          'No. Of Order',
          'Ratings',
          'Total Attendees',
          'Revenue',
        ],
        rows: data.topHosts.map((host) => [
          host.name,
          host.category,
          host.orders,
          host.rating,
          host.attendees,
          host.revenue,
        ]),
      },
    ].filter((sheet) => sheet.rows.length > 0),
    `expert_dashboard_${date}`,
    format,
  )
}
