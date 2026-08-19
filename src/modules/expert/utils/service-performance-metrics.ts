import {
  SERVICE_PERFORMANCE_METRICS_CATALOG,
  type ServicePerformanceMetricCatalogItem,
} from '../config/service-performance-metrics.config'
import type { ServiceKpi, ServiceMetric, ServicePerformance } from '../type/service-drilldown'
import { DASH } from '../components/service-drilldown/drilldown-format'

export type ServicePerformanceCard = {
  id: string
  label: string
  value: string
  hint?: string
  deltaPercent: number | null
  notInstrumented: boolean
}

const currency = (value: number) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const formatByType = (type: ServicePerformanceMetricCatalogItem['type'], value: number) => {
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
  performance: ServicePerformance | undefined,
  id: string,
): { metric: ServiceMetric | null; kpi: ServiceKpi | null } => {
  const kpi = performance?.kpis.find((item) => item.id === id) ?? null
  const metric = performance?.metrics?.[id] ?? null
  return { metric, kpi }
}

/**
 * Every catalog metric becomes a card. Metrics without a data source render a
 * dash and carry the backend's reason as the hint, never a substituted number.
 */
export const buildServicePerformanceCards = (
  performance: ServicePerformance | undefined,
): ServicePerformanceCard[] =>
  SERVICE_PERFORMANCE_METRICS_CATALOG.map((catalogItem) => {
    const { metric, kpi } = resolveMetric(performance, catalogItem.id)
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
