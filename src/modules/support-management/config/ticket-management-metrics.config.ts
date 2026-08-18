export const TICKET_MANAGEMENT_MODULE_KEY = 'ticket-management'

export type TicketManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Exactly 4 ticket management dashboard metrics — matches the Ticket Management page. */
export const TICKET_MANAGEMENT_METRICS_CATALOG: TicketManagementMetricCatalogItem[] = [
  {
    id: 'my-open-tickets',
    label: 'My Open Tickets',
    type: 'Count',
    description: 'Open tickets assigned to the current admin',
    defaultActive: true,
  },
  {
    id: 'tickets-in-progress',
    label: 'Tickets In-Progress',
    type: 'Count',
    description: 'Tickets currently in progress',
    defaultActive: true,
  },
  {
    id: 'avg-response-time',
    label: 'Avg. Response Time',
    type: 'Duration',
    description: 'Average first response time',
    defaultActive: true,
  },
  {
    id: 'avg-resolution-time',
    label: 'Avg. Resolution Time',
    type: 'Duration',
    description: 'Average ticket resolution time',
    defaultActive: true,
  },
]

export const TICKET_MANAGEMENT_METRIC_IDS = TICKET_MANAGEMENT_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const TICKET_MANAGEMENT_METRIC_ID_SET = new Set(TICKET_MANAGEMENT_METRIC_IDS)

export const DEFAULT_TICKET_MANAGEMENT_METRIC_IDS = TICKET_MANAGEMENT_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const TICKET_MANAGEMENT_MAX_ACTIVE_METRICS = TICKET_MANAGEMENT_METRICS_CATALOG.length
