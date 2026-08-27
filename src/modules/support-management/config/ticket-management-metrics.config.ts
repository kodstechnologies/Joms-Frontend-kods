/**
 * Ticket Management personal metrics catalog.
 * Excel has no separate ticket KPIs — personal subset of Support Dashboard metrics.
 */

export const TICKET_MANAGEMENT_MODULE_KEY = 'ticket-management'

export type TicketManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const TICKET_MANAGEMENT_METRICS_CATALOG: TicketManagementMetricCatalogItem[] = [
  {
    id: 'assigned-to-me',
    label: 'Assigned to Me',
    type: 'Count',
    description: 'Tickets assigned to the logged-in admin',
    defaultActive: true,
  },
  {
    id: 'tickets-in-progress',
    label: 'Tickets In Progress',
    type: 'Count',
    description: 'Tickets currently in progress',
    defaultActive: true,
  },
  {
    id: 'average-first-response-time',
    label: 'Average First Response Time',
    type: 'Duration',
    description: 'Average first response time',
    defaultActive: true,
  },
  {
    id: 'average-resolution-time',
    label: 'Average Resolution Time',
    type: 'Duration',
    description: 'Average ticket resolution time',
    defaultActive: true,
  },
  {
    id: 'escalated-by-me',
    label: 'Escalated by Me',
    type: 'Count',
    description: 'Tickets escalated by the logged-in admin',
    defaultActive: false,
  },
]

/** Maps legacy preference / API ids → current catalog ids. */
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
