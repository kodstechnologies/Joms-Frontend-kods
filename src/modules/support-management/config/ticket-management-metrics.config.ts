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

const METRIC_ROWS: MetricRowTuple[] = [
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

export const TICKET_MANAGEMENT_METRICS_CATALOG = catalogFromMetricRows(
  METRIC_ROWS,
) as TicketManagementMetricCatalogItem[]

export const TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'my-open-tickets': 'assigned-to-me',
  'avg-response-time': 'average-first-response-time',
  'avg-resolution-time': 'average-resolution-time',
}

const derived = deriveMetricExports(TICKET_MANAGEMENT_METRICS_CATALOG)
export const TICKET_MANAGEMENT_METRIC_IDS = derived.ids
export const TICKET_MANAGEMENT_METRIC_ID_SET = derived.idSet
export const DEFAULT_TICKET_MANAGEMENT_METRIC_IDS = derived.defaultIds
export const TICKET_MANAGEMENT_MAX_ACTIVE_METRICS = derived.maxActive
