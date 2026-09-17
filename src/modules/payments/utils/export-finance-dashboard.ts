import { exportSheetsToFile } from '@/shared/utils/export-utils'

import type {
  EscrowStatusItem,
  MonthlyComparisonPoint,
  RevenueCategoryPoint,
  RevenueFeeTrendPoint,
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
  revenueFeeTrends: RevenueFeeTrendPoint[]
  revenueByCategory: RevenueCategoryPoint[]
  monthlyComparison: MonthlyComparisonPoint[]
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
        name: 'Revenue & Fee Trends',
        headers: ['Date', 'Revenue', 'Platform Fee'],
        rows: data.revenueFeeTrends.map((point) => [point.date, point.revenue, point.platformFee]),
      },
      {
        name: 'Revenue by Category',
        headers: ['Category', 'Share (%)', 'Amount'],
        rows: data.revenueByCategory.map((point) => [point.name, point.percent, point.amount]),
      },
      {
        name: 'Monthly Comparison',
        headers: ['Month', 'MRR', 'Net Profit', 'Total Revenue'],
        rows: data.monthlyComparison.map((point) => [
          point.month,
          point.mrr,
          point.netProfit,
          point.totalRevenue,
        ]),
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
