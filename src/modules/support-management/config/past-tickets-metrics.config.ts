import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const PAST_TICKETS_MODULE_KEY = 'past-tickets'

export type PastTicketsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const PAST_TICKETS_METRIC_DEFS: MetricRowTuple[] = [
  ['closed', 'Closed', 'Count', 'Closed tickets', true],
  ['resolved', 'Resolved', 'Count', 'Resolved tickets', true],
  ['avg-resolution', 'Avg. Resolution', 'Average', 'Average resolution time', true],
  ['reopened', 'Reopened', 'Count', 'Reopened tickets', true],
]

export const PAST_TICKETS_METRICS_CATALOG = catalogFromMetricRows(
  PAST_TICKETS_METRIC_DEFS,
) as PastTicketsMetricCatalogItem[]

const derived = deriveMetricExports(PAST_TICKETS_METRICS_CATALOG)
export const PAST_TICKETS_METRIC_IDS = derived.ids
export const PAST_TICKETS_METRIC_ID_SET = derived.idSet
export const DEFAULT_PAST_TICKETS_METRIC_IDS = derived.defaultIds
export const PAST_TICKETS_MAX_ACTIVE_METRICS = derived.maxActive
