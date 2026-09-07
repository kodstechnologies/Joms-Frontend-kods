import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const FINANCE_REFUNDS_MODULE_KEY = 'finance-refunds'

export type FinanceRefundsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const FINANCE_REFUNDS_METRIC_DEFS: MetricRowTuple[] = [
  ['pending-refunds', 'Pending Refunds', 'Count', 'Refunds awaiting processing or approval', true],
  ['active-disputes', 'Active Disputes', 'Count', 'Currently open dispute cases', true],
  [
    'amount-in-disputed',
    'Amount in Disputed',
    'Currency',
    'Total amount under active disputes',
    true,
  ],
  ['resolved', 'Resolved', 'Currency', 'Total resolved refund and dispute amount', true],
]

export const FINANCE_REFUNDS_METRICS_CATALOG = catalogFromMetricRows(
  FINANCE_REFUNDS_METRIC_DEFS,
) as FinanceRefundsMetricCatalogItem[]

const derived = deriveMetricExports(FINANCE_REFUNDS_METRICS_CATALOG)
export const FINANCE_REFUNDS_METRIC_IDS = derived.ids
export const FINANCE_REFUNDS_METRIC_ID_SET = derived.idSet
export const DEFAULT_FINANCE_REFUNDS_METRIC_IDS = derived.defaultIds
export const FINANCE_REFUNDS_MAX_ACTIVE_METRICS = derived.maxActive
