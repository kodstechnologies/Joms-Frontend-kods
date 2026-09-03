import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

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

const derived = deriveMetricExports(FINANCE_REFUNDS_METRICS_CATALOG)
export const FINANCE_REFUNDS_METRIC_IDS = derived.ids
export const FINANCE_REFUNDS_METRIC_ID_SET = derived.idSet
export const DEFAULT_FINANCE_REFUNDS_METRIC_IDS = derived.defaultIds
export const FINANCE_REFUNDS_MAX_ACTIVE_METRICS = derived.maxActive
