import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

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

const derived = deriveMetricExports(PAST_TICKETS_METRICS_CATALOG)
export const PAST_TICKETS_METRIC_IDS = derived.ids
export const PAST_TICKETS_METRIC_ID_SET = derived.idSet
export const DEFAULT_PAST_TICKETS_METRIC_IDS = derived.defaultIds
export const PAST_TICKETS_MAX_ACTIVE_METRICS = derived.maxActive
