import type { ExpertProfileAnalyticsMetricCard } from '@/modules/expert/utils/expert-profile-analytics-metrics'
import { exportSheetsToFile } from '@/shared/utils/export-utils'

type MetricRow = {
  label: string
  value: string
  trend?: number
}

type ChartLocationRow = {
  name: string
  views: number
  percent: number
}

type ChartTimeRow = {
  day: string
  hours: number
}

type FunnelRow = {
  stage: string
  value: number
}

type RevenueRow = {
  month: string
  revenue: number
}

export type ExpertProfileAnalyticsExportData = {
  expertName: string
  expertId?: string
  visibilityPeriod: string
  revenuePeriod: string
  profileSummary: MetricRow[]
  serviceAnalytics: ExpertProfileAnalyticsMetricCard[]
  visibilityMetrics: MetricRow[]
  expertListings: MetricRow[]
  ticketingInsights: MetricRow[]
  mostActiveTime: ChartTimeRow[]
  topViewsByLocation: ChartLocationRow[]
  topViewsByRole: ChartLocationRow[]
  conversionFunnel: FunnelRow[]
  revenueTrend: RevenueRow[]
}

function formatTrend(trend?: number) {
  if (trend == null || Number.isNaN(Number(trend))) return ''
  const sign = trend >= 0 ? '+' : ''
  return `${sign}${trend}%`
}

export async function exportExpertProfileAnalyticsToExcel(
  data: ExpertProfileAnalyticsExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)
  const safeName = data.expertName.replace(/[^\w-]+/g, '_').slice(0, 40) || 'expert'
  const filePrefix = `expert_profile_analytics_${safeName}_${date}`

  await exportSheetsToFile(
    [
      {
        name: 'Profile Summary',
        headers: ['Field', 'Value'],
        rows: [
          ['Expert', data.expertName],
          ['Expert ID', data.expertId ?? ''],
          ['Visibility Period', data.visibilityPeriod],
          ['Revenue Period', data.revenuePeriod],
          ...data.profileSummary.map((item) => [item.label, item.value]),
        ],
      },
      {
        name: 'Service Analytics',
        headers: ['Metric', 'Value'],
        rows: data.serviceAnalytics.map((item) => [item.label, item.value]),
      },
      {
        name: 'Visibility Metrics',
        headers: ['Metric', 'Value', 'Trend'],
        rows: data.visibilityMetrics.map((item) => [
          item.label,
          item.value,
          formatTrend(item.trend),
        ]),
      },
      {
        name: 'Expert Listings',
        headers: ['Metric', 'Value'],
        rows: data.expertListings.map((item) => [item.label, item.value]),
      },
      {
        name: 'Ticketing Insights',
        headers: ['Metric', 'Value'],
        rows: data.ticketingInsights.map((item) => [item.label, item.value]),
      },
      {
        name: 'Most Active Time',
        headers: ['Day', 'Activity Hours'],
        rows: data.mostActiveTime.map((item) => [item.day, item.hours]),
      },
      {
        name: 'Views by Location',
        headers: ['Location', 'Views', 'Share (%)'],
        rows: data.topViewsByLocation.map((item) => [item.name, item.views, item.percent]),
      },
      {
        name: 'Views by Role',
        headers: ['Role', 'Views', 'Share (%)'],
        rows: data.topViewsByRole.map((item) => [item.name, item.views, item.percent]),
      },
      {
        name: 'Conversion Funnel',
        headers: ['Stage', 'Count'],
        rows: data.conversionFunnel.map((item) => [item.stage, item.value]),
      },
      {
        name: 'Revenue Trend',
        headers: ['Period', 'Revenue'],
        rows: data.revenueTrend.map((item) => [item.month, item.revenue]),
      },
    ],
    filePrefix,
    format,
  )
}
