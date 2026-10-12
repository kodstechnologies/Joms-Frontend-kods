import { exportSheetsToFile } from '@/shared/utils/export-utils'

import type { SupportDashboardMetricCard } from './support-dashboard-metrics'

export async function exportSupportDashboard(
  cards: SupportDashboardMetricCard[],
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)
  await exportSheetsToFile(
    [
      {
        name: 'Support Metrics',
        headers: ['Metric', 'Value', 'Change / Notes'],
        rows: cards.map((card) => [
          card.title,
          card.value,
          `${card.trend.direction === 'up' ? '+' : '-'}${card.trend.percentage}% ${card.trend.label}`,
        ]),
      },
    ],
    `support_dashboard_${date}`,
    format,
  )
}
