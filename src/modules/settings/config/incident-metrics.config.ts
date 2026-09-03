import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

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
    label: 'Open Incidents',
    type: 'Count',
    description: 'Currently open and investigating incidents',
    defaultActive: true,
  },
  {
    id: 'critical',
    label: 'Critical',
    type: 'Count',
    description: 'Unresolved critical incidents',
    defaultActive: true,
  },
  {
    id: 'resolved-mtd',
    label: 'Resolved (MTD)',
    type: 'Count',
    description: 'Resolved this month',
    defaultActive: true,
  },
  {
    id: 'mttr',
    label: 'MTTR',
    type: 'Average',
    description: 'Mean time to resolve this month',
    defaultActive: true,
  },
]

const derived = deriveMetricExports(INCIDENT_METRICS_CATALOG)
export const INCIDENT_METRIC_IDS = derived.ids
export const INCIDENT_METRIC_ID_SET = derived.idSet
export const DEFAULT_INCIDENT_METRIC_IDS = derived.defaultIds
export const INCIDENT_MAX_ACTIVE_METRICS = derived.maxActive
