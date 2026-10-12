import { exportSheetsToFile } from '@/shared/utils/export-utils'

import type {
  EscrowStatusItem,
  MonthlyRevenuePoint,
  RevenueCategoryPoint,
  RevenueTrendPoint,
  WeeklyPayoutPoint,
} from '@/modules/payments/config/finance-dashboard.config'
import type { FinanceDashboardMetricCard } from '@/modules/payments/utils/finance-dashboard-metrics'

type KeyFinancialMetric = {
  label: string
  value: string
  change?: string
  subtext?: string
}

export type FinanceDashboardExportData = {
  metrics: FinanceDashboardMetricCard[]
  keyFinancialMetrics: KeyFinancialMetric[]
  revenueTrend: RevenueTrendPoint[]
  revenueByCategory: RevenueCategoryPoint[]
  monthlyRevenue: MonthlyRevenuePoint[]
  escrowStatus: EscrowStatusItem[]
  weeklyPayouts: WeeklyPayoutPoint[]
}

export async function exportFinanceDashboardToFile(
  data: FinanceDashboardExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)

  await exportSheetsToFile(
    [
      {
        name: 'Metrics',
        headers: ['Metric', 'Value', 'Change / Notes'],
        rows: data.metrics.map((metric) => [
          metric.label,
          metric.value,
          [metric.change, metric.changeNote].filter(Boolean).join(' '),
        ]),
      },
      {
        name: 'Key Financial Metrics',
        headers: ['Metric', 'Value', 'Notes'],
        rows: data.keyFinancialMetrics.map((metric) => [
          metric.label,
          metric.value,
          [metric.change, metric.subtext].filter(Boolean).join(' '),
        ]),
      },
      {
        name: 'Revenue Trend',
        headers: ['Date', 'Revenue'],
        rows: data.revenueTrend.map((point) => [point.date, point.revenue]),
      },
      {
        name: 'Revenue by Category',
        headers: ['Category', 'Share (%)', 'Amount'],
        rows: data.revenueByCategory.map((point) => [point.name, point.percent, point.amount]),
      },
      {
        name: 'Monthly Revenue',
        headers: ['Month', 'Total Revenue'],
        rows: data.monthlyRevenue.map((point) => [point.month, point.totalRevenue]),
      },
      {
        name: 'Escrow Status',
        headers: ['Status', 'Amount'],
        rows: data.escrowStatus.map((item) => [item.label, item.value]),
      },
      {
        name: 'Weekly Payouts',
        headers: ['Day', 'Amount'],
        rows: data.weeklyPayouts.map((point) => [point.day, point.amount]),
      },
    ].filter((sheet) => sheet.rows.length > 0),
    `finance_dashboard_${date}`,
    format,
  )
}
