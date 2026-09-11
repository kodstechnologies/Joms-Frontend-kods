import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const INCIDENT_MODULE_KEY = 'incident-tracking'

export type IncidentMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const INCIDENT_METRIC_DEFS: MetricRowTuple[] = [
  [
    'open-incidents',
    'Active Incidents',
    'Count',
    'Currently open and investigating incidents',
    true,
  ],
  ['critical', 'Critical Errors', 'Count', 'Unresolved critical incidents', true],
  ['resolved-mtd', 'Resolved', 'Count', 'Resolved this month', true],
  ['mttr', 'Avg. Resolution Time', 'Average', 'Mean time to resolve this month', true],
]

export const INCIDENT_METRICS_CATALOG = catalogFromMetricRows(
  INCIDENT_METRIC_DEFS,
) as IncidentMetricCatalogItem[]

const derived = deriveMetricExports(INCIDENT_METRICS_CATALOG)
export const INCIDENT_METRIC_IDS = derived.ids
export const INCIDENT_METRIC_ID_SET = derived.idSet
export const DEFAULT_INCIDENT_METRIC_IDS = derived.defaultIds
export const INCIDENT_MAX_ACTIVE_METRICS = derived.maxActive
