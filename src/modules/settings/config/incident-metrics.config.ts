export const INCIDENT_MODULE_KEY = 'incident-tracking'

export type IncidentMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const INCIDENT_METRICS_CATALOG: IncidentMetricCatalogItem[] = [
  {
    id: 'open-incidents',
    label: 'Active Incidents',
    type: 'Count',
    description: 'Open and investigating incidents',
    defaultActive: true,
  },
  {
    id: 'critical',
    label: 'Critical Errors',
    type: 'Count',
    description: 'Unresolved critical incidents',
    defaultActive: true,
  },
  {
    id: 'resolved-mtd',
    label: 'Resolved',
    type: 'Count',
    description: 'Resolved this month',
    defaultActive: true,
  },
  {
    id: 'mttr',
    label: 'Avg. Resolution Time',
    type: 'Average',
    description: 'Mean time to resolve this month',
    defaultActive: true,
  },
]

export const INCIDENT_METRIC_IDS = INCIDENT_METRICS_CATALOG.map((metric) => metric.id)

export const INCIDENT_METRIC_ID_SET = new Set(INCIDENT_METRIC_IDS)

export const DEFAULT_INCIDENT_METRIC_IDS = INCIDENT_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const INCIDENT_MAX_ACTIVE_METRICS = INCIDENT_METRICS_CATALOG.length
