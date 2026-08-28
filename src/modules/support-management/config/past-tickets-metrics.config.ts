/**
 * Past Tickets metrics catalog.
 * Excel has no past-specific KPIs — keep existing closed/resolved/avg/reopened set.
 */

export const PAST_TICKETS_MODULE_KEY = 'past-tickets'

export type PastTicketsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const PAST_TICKETS_METRICS_CATALOG: PastTicketsMetricCatalogItem[] = [
  {
    id: 'closed',
    label: 'Closed',
    type: 'Count',
    description: 'Closed tickets',
    defaultActive: true,
  },
  {
    id: 'resolved',
    label: 'Resolved',
    type: 'Count',
    description: 'Resolved tickets',
    defaultActive: true,
  },
  {
    id: 'avg-resolution',
    label: 'Avg. Resolution',
    type: 'Average',
    description: 'Average resolution time',
    defaultActive: true,
  },
  {
    id: 'reopened',
    label: 'Reopened',
    type: 'Count',
    description: 'Reopened tickets',
    defaultActive: true,
  },
]

export const PAST_TICKETS_METRIC_IDS = PAST_TICKETS_METRICS_CATALOG.map((metric) => metric.id)

export const PAST_TICKETS_METRIC_ID_SET = new Set(PAST_TICKETS_METRIC_IDS)

export const DEFAULT_PAST_TICKETS_METRIC_IDS = PAST_TICKETS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const PAST_TICKETS_MAX_ACTIVE_METRICS = PAST_TICKETS_METRICS_CATALOG.length
