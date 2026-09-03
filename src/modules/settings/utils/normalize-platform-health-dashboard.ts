import { PLATFORM_HEALTH_LEGACY_METRIC_ID_MAP } from '@/modules/settings/config/platform-health-metrics.config'
import type {
  PlatformHealthDashboard,
  PlatformHealthMetric,
  PlatformHealthMetricTrend,
} from '@/modules/settings/types/platform-health'

type ApiMetricTrend = {
  text?: string
  tone?: 'positive' | 'negative'
  value?: string
  direction?: 'up' | 'down'
  label?: string
  variant?: 'percent' | 'absolute'
}

const isApiMetricTrend = (
  trend: ApiMetricTrend | PlatformHealthMetricTrend,
): trend is ApiMetricTrend & { text: string } => typeof (trend as ApiMetricTrend).text === 'string'

const normalizeMetricTrend = (
  trend?: ApiMetricTrend | PlatformHealthMetricTrend | null,
): PlatformHealthMetricTrend | null | undefined => {
  if (!trend) return trend

  if (typeof trend.value === 'string' && trend.value.length > 0) {
    return trend as PlatformHealthMetricTrend
  }

  if (!isApiMetricTrend(trend)) {
    return null
  }

  const trendText = trend.text.trim()
  if (!trendText) {
    return null
  }

  const match = trendText.match(/^([+-]?\d+(?:\.\d+)?%?)\s*(.*)$/i)
  const value = match?.[1] ?? trendText
  const label = match?.[2]?.trim() || 'vs last month'
  const direction: PlatformHealthMetricTrend['direction'] = value.startsWith('-') ? 'down' : 'up'

  return {
    value,
    tone: trend.tone === 'positive' ? 'positive' : 'negative',
    direction,
    label,
    variant: value.includes('%') ? 'percent' : 'absolute',
  }
}

const normalizeMetric = (metric: PlatformHealthMetric): PlatformHealthMetric => {
  const mappedId = PLATFORM_HEALTH_LEGACY_METRIC_ID_MAP[metric.id] ?? metric.id

  return {
    ...metric,
    id: mappedId,
    trend: normalizeMetricTrend(metric.trend),
  }
}

export function normalizePlatformHealthDashboard(
  data: PlatformHealthDashboard,
): PlatformHealthDashboard {
  const apiTrafficByDate = new Map(
    (data.charts.apiTraffic || []).map((row) => [row.date, row.requests]),
  )

  const platformTrends = (data.charts.healthTrend || []).map((row) => {
    const requests = apiTrafficByDate.get(row.date) || 0
    const errorRequests = Math.round((requests * (row.errorRate || 0)) / 100)

    return {
      date: row.date,
      uptime: row.uptime,
      transactions: Math.round(requests / 1000),
      supportTickets: errorRequests,
    }
  })

  const systemPerformance24h = (data.charts.performance || []).map((row) => ({
    time: row.time,
    apiResponseMs: row.apiResponseMs,
    errorRate: row.errorRate,
    queueSeconds: row.queueSeconds,
    cpu: row.cpu ?? 0,
    memory: row.memory ?? 0,
    requestsPerMin: row.requestsPerMin ?? 0,
  }))

  const securityCompliance = (data.charts.securityCompliance || []).map((row) => ({
    month: row.month,
    compliance: row.compliance ?? 0,
    security: row.security ?? 0,
    issuesResolved: row.issuesResolved ?? 0,
  }))

  return {
    ...data,
    metrics: data.metrics.map(normalizeMetric),
    charts: {
      ...data.charts,
      platformTrends,
      systemPerformance24h,
      securityCompliance,
    },
  }
}
