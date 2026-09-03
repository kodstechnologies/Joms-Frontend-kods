export const FINANCE_REFUNDS_MODULE_KEY = 'finance-refunds'

export type FinanceRefundsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
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

export const FINANCE_REFUNDS_METRICS_CATALOG: FinanceRefundsMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const FINANCE_REFUNDS_METRIC_IDS = FINANCE_REFUNDS_METRICS_CATALOG.map((metric) => metric.id)

export const FINANCE_REFUNDS_METRIC_ID_SET = new Set(FINANCE_REFUNDS_METRIC_IDS)

export const DEFAULT_FINANCE_REFUNDS_METRIC_IDS = FINANCE_REFUNDS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const FINANCE_REFUNDS_MAX_ACTIVE_METRICS = FINANCE_REFUNDS_METRICS_CATALOG.length
