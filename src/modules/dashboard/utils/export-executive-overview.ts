import type { AnalyticsMetric } from '@/shared/components/dashboard/analytics-widget'
import { exportSheetsToFile } from '@/shared/utils/export-utils'

import type {
  ExecutiveKpiStat,
  FunnelPoint,
  MembershipTrendPoint,
  RevenueMemberPoint,
  ServiceDistributionPoint,
} from '@/modules/dashboard/types/executive-overview'

export type ExecutiveOverviewExportData = {
  kpis: ExecutiveKpiStat[]
  engagement: AnalyticsMetric[]
  revenueMemberGrowth: RevenueMemberPoint[]
  membershipTrends: MembershipTrendPoint[]
  conversionFunnel: FunnelPoint[]
  serviceDistribution: ServiceDistributionPoint[]
}

function formatKpiChange(stat: ExecutiveKpiStat): string {
  if (stat.trend) {
    const sign = stat.trend.direction === 'up' ? '+' : '-'
    return `${sign}${stat.trend.percentage}% ${stat.trend.label}`
  }
  return stat.hint ?? ''
}

export async function exportExecutiveOverviewToExcel(
  data: ExecutiveOverviewExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)

  await exportSheetsToFile(
    [
      {
        name: 'KPI Stats',
        headers: ['Metric', 'Value', 'Change / Notes'],
        rows: data.kpis.map((kpi) => [kpi.title, kpi.value, formatKpiChange(kpi)]),
      },
      {
        name: 'Engagement Overview',
        headers: ['Metric', 'Value'],
        rows: data.engagement.map((metric) => [metric.label, metric.value]),
      },
      {
        name: 'Revenue & Member Growth',
        headers: ['Month', 'Revenue', 'New Members'],
        rows: data.revenueMemberGrowth.map((point) => [
          point.month,
          point.revenue,
          point.newMembers,
        ]),
      },
      {
        name: 'Membership Trends',
        headers: ['Month', 'Active', 'Expired', 'New'],
        rows: data.membershipTrends.map((point) => [
          point.month,
          point.active,
          point.expired,
          point.new,
        ]),
      },
      {
        name: 'Conversion Funnel',
        headers: ['Stage', 'Value'],
        rows: data.conversionFunnel.map((point) => [point.stage, point.value]),
      },
      {
        name: 'Service Distribution',
        headers: ['Service Type', 'Share (%)'],
        rows: data.serviceDistribution.map((point) => [point.name, point.value]),
      },
    ],
    `executive_overview_${date}`,
    format,
  )
}
