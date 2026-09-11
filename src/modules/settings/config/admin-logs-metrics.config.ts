import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const ADMIN_LOGS_MODULE_KEY = 'admin-logs'

export type AdminLogsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const ADMIN_LOGS_METRIC_DEFS: MetricRowTuple[] = [
  ['events-today', 'Events Today', 'Count', 'Log events today', true],
  ['critical', 'Critical', 'Count', 'Critical events', true],
  ['warnings', 'Warnings', 'Count', 'Warning events', true],
  ['unique-actors', 'Unique Actors', 'Count', 'Distinct actors', true],
]

export const ADMIN_LOGS_METRICS_CATALOG = catalogFromMetricRows(
  ADMIN_LOGS_METRIC_DEFS,
) as AdminLogsMetricCatalogItem[]

const derived = deriveMetricExports(ADMIN_LOGS_METRICS_CATALOG)
export const ADMIN_LOGS_MAX_ACTIVE_METRICS = derived.maxActive
export const ADMIN_LOGS_METRIC_IDS = derived.ids
export const DEFAULT_ADMIN_LOGS_METRIC_IDS = derived.defaultIds
