export const TICKET_MANAGEMENT_MODULE_KEY = 'ticket-management'

export type TicketManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['assigned-to-me', 'Assigned to Me', 'Count', 'Tickets assigned to the logged-in admin', true],
  ['tickets-in-progress', 'Tickets In Progress', 'Count', 'Tickets currently in progress', true],
  [
    'average-first-response-time',
    'Average First Response Time',
    'Duration',
    'Average first response time',
    true,
  ],
  [
    'average-resolution-time',
    'Average Resolution Time',
    'Duration',
    'Average ticket resolution time',
    true,
  ],
  ['escalated-by-me', 'Escalated by Me', 'Count', 'Tickets escalated by the logged-in admin'],
]

export const TICKET_MANAGEMENT_METRICS_CATALOG: TicketManagementMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

export const TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'my-open-tickets': 'assigned-to-me',
  'avg-response-time': 'average-first-response-time',
  'avg-resolution-time': 'average-resolution-time',
}

export const TICKET_MANAGEMENT_METRIC_IDS = TICKET_MANAGEMENT_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const TICKET_MANAGEMENT_METRIC_ID_SET = new Set(TICKET_MANAGEMENT_METRIC_IDS)

export const DEFAULT_TICKET_MANAGEMENT_METRIC_IDS = TICKET_MANAGEMENT_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const TICKET_MANAGEMENT_MAX_ACTIVE_METRICS = TICKET_MANAGEMENT_METRICS_CATALOG.length
