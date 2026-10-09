import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const TICKET_MANAGEMENT_MODULE_KEY = 'ticket-management'

export type TicketManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const TICKET_MANAGEMENT_METRIC_DEFS: MetricRowTuple[] = [
  ['total-tickets', 'Total Tickets', 'Count', 'Total tickets in the system', true],
  [
    'open-tickets',
    'Open Tickets',
    'Count',
    'Currently open tickets (Open, Assigned, In Progress, Pending Customer)',
    true,
  ],
  ['tickets-in-progress', 'Tickets In Progress', 'Count', 'Active tickets being worked on', true],
  ['assigned-to-me', 'Assigned to Me', 'Count', 'Tickets assigned to the logged-in admin', true],
  ['escalated-by-me', 'Escalated by Me', 'Count', 'Tickets escalated by the logged-in admin', true],
  [
    'average-first-response-time',
    'Average First Response Time',
    'Duration',
    'Average time to first response',
    true,
  ],
  [
    'average-resolution-time',
    'Average Resolution Time',
    'Duration',
    'Average resolution duration',
    true,
  ],
  ['tickets-resolved-today', 'Tickets Resolved Today', 'Count', 'Tickets resolved today', true],
]

export const TICKET_MANAGEMENT_METRICS_CATALOG = catalogFromMetricRows(
  TICKET_MANAGEMENT_METRIC_DEFS,
) as TicketManagementMetricCatalogItem[]

export const TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'my-open-tickets': 'assigned-to-me',
  'avg-response-time': 'average-first-response-time',
  'avg-resolution-time': 'average-resolution-time',
  'resolved-today': 'tickets-resolved-today',
  'total-open-tickets': 'open-tickets',
}

const derived = deriveMetricExports(TICKET_MANAGEMENT_METRICS_CATALOG)
export const TICKET_MANAGEMENT_METRIC_IDS = derived.ids
export const TICKET_MANAGEMENT_METRIC_ID_SET = derived.idSet
export const DEFAULT_TICKET_MANAGEMENT_METRIC_IDS = derived.defaultIds
export const TICKET_MANAGEMENT_MAX_ACTIVE_METRICS = derived.maxActive
