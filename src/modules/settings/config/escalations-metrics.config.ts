export const ESCALATIONS_MODULE_KEY = 'escalations'

export type EscalationsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const ESCALATIONS_METRICS_CATALOG: EscalationsMetricCatalogItem[] = [
  {
    id: 'total-escalation',
    label: 'Total Escalation',
    type: 'Count',
    description: 'Total escalation cases',
    defaultActive: true,
  },
  {
    id: 'open-escalation',
    label: 'Open Escalation',
    type: 'Count',
    description: 'Currently open escalation cases',
    defaultActive: true,
  },
  {
    id: 'in-review',
    label: 'In Review',
    type: 'Count',
    description: 'Escalations currently in review',
    defaultActive: true,
  },
  {
    id: 'resolved',
    label: 'Resolved',
    type: 'Count',
    description: 'Resolved escalation cases',
    defaultActive: true,
  },
]

export const ESCALATIONS_METRIC_IDS = ESCALATIONS_METRICS_CATALOG.map((metric) => metric.id)

export const ESCALATIONS_METRIC_ID_SET = new Set(ESCALATIONS_METRIC_IDS)

export const DEFAULT_ESCALATIONS_METRIC_IDS = ESCALATIONS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const ESCALATIONS_MAX_ACTIVE_METRICS = ESCALATIONS_METRICS_CATALOG.length
