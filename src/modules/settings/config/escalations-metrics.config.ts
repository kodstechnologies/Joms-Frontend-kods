import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const ESCALATIONS_MODULE_KEY = 'escalations'

export type EscalationsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const ESCALATIONS_METRIC_DEFS: MetricRowTuple[] = [
  ['total-escalation', 'Total Escalation', 'Count', 'Total escalation cases', true],
  ['open-escalation', 'Open Escalation', 'Count', 'Currently open escalation cases', true],
  ['in-review', 'In Review', 'Count', 'Escalations currently in review', true],
  ['resolved', 'Resolved', 'Count', 'Resolved escalation cases', true],
]

export const ESCALATIONS_METRICS_CATALOG = catalogFromMetricRows(
  ESCALATIONS_METRIC_DEFS,
) as EscalationsMetricCatalogItem[]

const derived = deriveMetricExports(ESCALATIONS_METRICS_CATALOG)
export const ESCALATIONS_METRIC_IDS = derived.ids
export const ESCALATIONS_METRIC_ID_SET = derived.idSet
export const DEFAULT_ESCALATIONS_METRIC_IDS = derived.defaultIds
export const ESCALATIONS_MAX_ACTIVE_METRICS = derived.maxActive
