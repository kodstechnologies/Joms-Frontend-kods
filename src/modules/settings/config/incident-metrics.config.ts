export const INCIDENT_MODULE_KEY = 'incident-tracking'

export type IncidentMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['open-incidents', 'Open Incidents', 'Count', 'Currently open and investigating incidents', true],
  ['critical', 'Critical', 'Count', 'Unresolved critical incidents', true],
  ['resolved-mtd', 'Resolved (MTD)', 'Count', 'Resolved this month', true],
  ['mttr', 'MTTR', 'Average', 'Mean time to resolve this month', true],
]

export const INCIDENT_METRICS_CATALOG: IncidentMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const INCIDENT_METRIC_IDS = INCIDENT_METRICS_CATALOG.map((metric) => metric.id)

export const INCIDENT_METRIC_ID_SET = new Set(INCIDENT_METRIC_IDS)

export const DEFAULT_INCIDENT_METRIC_IDS = INCIDENT_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const INCIDENT_MAX_ACTIVE_METRICS = INCIDENT_METRICS_CATALOG.length
