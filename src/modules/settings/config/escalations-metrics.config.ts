export const ESCALATIONS_MODULE_KEY = 'escalations'

export type EscalationsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['total-escalation', 'Total Escalation', 'Count', 'Total escalation cases', true],
  ['open-escalation', 'Open Escalation', 'Count', 'Currently open escalation cases', true],
  ['in-review', 'In Review', 'Count', 'Escalations currently in review', true],
  ['resolved', 'Resolved', 'Count', 'Resolved escalation cases', true],
]

export const ESCALATIONS_METRICS_CATALOG: EscalationsMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const ESCALATIONS_METRIC_IDS = ESCALATIONS_METRICS_CATALOG.map((metric) => metric.id)

export const ESCALATIONS_METRIC_ID_SET = new Set(ESCALATIONS_METRIC_IDS)

export const DEFAULT_ESCALATIONS_METRIC_IDS = ESCALATIONS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const ESCALATIONS_MAX_ACTIVE_METRICS = ESCALATIONS_METRICS_CATALOG.length
