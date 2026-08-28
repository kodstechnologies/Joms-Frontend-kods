export const FINANCE_REFUNDS_MODULE_KEY = 'finance-refunds'

export type FinanceRefundsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const FINANCE_REFUNDS_METRICS_CATALOG: FinanceRefundsMetricCatalogItem[] = [
  {
    id: 'pending-refunds',
    label: 'Pending Refunds',
    type: 'Count',
    description: 'Refunds awaiting processing or approval',
    defaultActive: true,
  },
  {
    id: 'active-disputes',
    label: 'Active Disputes',
    type: 'Count',
    description: 'Currently open dispute cases',
    defaultActive: true,
  },
  {
    id: 'amount-in-disputed',
    label: 'Amount in Disputed',
    type: 'Currency',
    description: 'Total amount under active disputes',
    defaultActive: true,
  },
  {
    id: 'resolved',
    label: 'Resolved',
    type: 'Currency',
    description: 'Total resolved refund and dispute amount',
    defaultActive: true,
  },
]

export const FINANCE_REFUNDS_METRIC_IDS = FINANCE_REFUNDS_METRICS_CATALOG.map((metric) => metric.id)

export const FINANCE_REFUNDS_METRIC_ID_SET = new Set(FINANCE_REFUNDS_METRIC_IDS)

export const DEFAULT_FINANCE_REFUNDS_METRIC_IDS = FINANCE_REFUNDS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const FINANCE_REFUNDS_MAX_ACTIVE_METRICS = FINANCE_REFUNDS_METRICS_CATALOG.length
