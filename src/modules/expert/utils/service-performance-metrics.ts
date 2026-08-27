import {
  SERVICE_PERFORMANCE_METRICS_CATALOG,
  type ServicePerformanceMetricCatalogItem,
} from '../config/service-performance-metrics.config'
import {
  CONSULTATION_PERFORMANCE_METRIC_API_ALIASES,
  CONSULTATION_PERFORMANCE_METRICS_CATALOG,
  type ConsultationPerformanceMetricCatalogItem,
} from '../config/consultation-performance-metrics.config'
import type { ServiceKpi, ServiceMetric, ServicePerformance } from '../type/service-drilldown'
import type { ConsultationPerformance } from '../type/consultation-drilldown'
import { DASH } from '../components/service-drilldown/drilldown-format'

export type ServicePerformanceCard = {
  id: string
  label: string
  value: string
  hint?: string
  deltaPercent: number | null
  notInstrumented: boolean
}

type PerformanceLike = {
  kpis?: ServiceKpi[]
  metrics?: Record<string, ServiceMetric>
}

const currency = (value: number) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const formatByType = (
  type:
    | ServicePerformanceMetricCatalogItem['type']
    | ConsultationPerformanceMetricCatalogItem['type'],
  value: number,
) => {
  switch (type) {
    case 'Currency':
      return currency(value)
    case 'Percentage':
      return `${value}%`
    case 'Average':
      return value.toFixed(1)
    case 'Count':
      return String(Math.round(value)).padStart(2, '0')
    default:
      return Number(value).toLocaleString('en-IN')
  }
}

const resolveMetric = (
  performance: PerformanceLike | undefined,
  id: string,
  aliases: string[] = [],
): { metric: ServiceMetric | null; kpi: ServiceKpi | null } => {
  const keys = [id, ...aliases]
  const metrics = performance?.metrics || {}
  const kpis = performance?.kpis || []

  let metric: ServiceMetric | null = null
  for (const key of keys) {
    if (metrics[key]) {
      metric = metrics[key]
      break
    }
  }

  let kpi: ServiceKpi | null = null
  for (const key of keys) {
    const found = kpis.find((item) => item.id === key)
    if (found) {
      kpi = found
      break
    }
  }

  return { metric, kpi }
}

const buildCardsFromCatalog = (
  performance: PerformanceLike | undefined,
  catalog: Array<{
    id: string
    label: string
    type: string
    description: string
  }>,
  aliasMap: Record<string, string[]> = {},
): ServicePerformanceCard[] =>
  catalog.map((catalogItem) => {
    const { metric, kpi } = resolveMetric(
      performance,
      catalogItem.id,
      aliasMap[catalogItem.id] || [],
    )
    const rawValue = metric ? metric.value : (kpi?.value ?? null)
    const notInstrumented = Boolean(metric?.notInstrumented)

    const value =
      rawValue === null || rawValue === undefined
        ? DASH
        : formatByType(catalogItem.type, Number(rawValue))

    const hint = notInstrumented
      ? metric?.reason
      : metric?.unit
        ? `In ${metric.unit}`
        : metric?.sampleSize
          ? `${metric.sampleSize} review(s)`
          : metric?.basis

    return {
      id: catalogItem.id,
      label: catalogItem.label,
      value,
      hint,
      deltaPercent: kpi?.deltaPercent ?? null,
      notInstrumented,
    }
  })

/**
 * Every catalog metric becomes a card. Metrics without a data source render a
 * dash and carry the backend's reason as the hint, never a substituted number.
 */
export const buildServicePerformanceCards = (
  performance: ServicePerformance | undefined,
): ServicePerformanceCard[] =>
  buildCardsFromCatalog(performance, SERVICE_PERFORMANCE_METRICS_CATALOG)

export const buildConsultationPerformanceCards = (
  performance: ConsultationPerformance | undefined,
): ServicePerformanceCard[] =>
  buildCardsFromCatalog(
    performance,
    CONSULTATION_PERFORMANCE_METRICS_CATALOG,
    CONSULTATION_PERFORMANCE_METRIC_API_ALIASES,
  )
