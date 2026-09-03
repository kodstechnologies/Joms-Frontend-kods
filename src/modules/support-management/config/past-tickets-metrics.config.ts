export const PAST_TICKETS_MODULE_KEY = 'past-tickets'

export type PastTicketsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['closed', 'Closed', 'Count', 'Closed tickets', true],
  ['resolved', 'Resolved', 'Count', 'Resolved tickets', true],
  ['avg-resolution', 'Avg. Resolution', 'Average', 'Average resolution time', true],
  ['reopened', 'Reopened', 'Count', 'Reopened tickets', true],
]

export const PAST_TICKETS_METRICS_CATALOG: PastTicketsMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const PAST_TICKETS_METRIC_IDS = PAST_TICKETS_METRICS_CATALOG.map((metric) => metric.id)

export const PAST_TICKETS_METRIC_ID_SET = new Set(PAST_TICKETS_METRIC_IDS)

export const DEFAULT_PAST_TICKETS_METRIC_IDS = PAST_TICKETS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const PAST_TICKETS_MAX_ACTIVE_METRICS = PAST_TICKETS_METRICS_CATALOG.length
