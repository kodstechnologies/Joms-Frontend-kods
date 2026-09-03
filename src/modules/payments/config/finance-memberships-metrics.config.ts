import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const FINANCE_MEMBERSHIPS_MODULE_KEY = 'finance-memberships'

export type FinanceMembershipsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const METRIC_ROWS: MetricRowTuple[] = [
  [
    'active-subscriptions',
    'Active Subscriptions',
    'Count',
    'Subscriptions currently billed and in good standing',
    true,
  ],
  ['paused', 'Paused', 'Count', 'Subscriptions temporarily paused', true],
  ['cancelled', 'Cancelled', 'Count', 'Subscriptions cancelled by admin or member', true],
  ['expired', 'Expired', 'Count', 'Subscriptions that reached end of term without renewal', true],
]

export const FINANCE_MEMBERSHIPS_METRICS_CATALOG = catalogFromMetricRows(
  METRIC_ROWS,
) as FinanceMembershipsMetricCatalogItem[]

const derived = deriveMetricExports(FINANCE_MEMBERSHIPS_METRICS_CATALOG)
export const FINANCE_MEMBERSHIPS_METRIC_IDS = derived.ids
export const FINANCE_MEMBERSHIPS_METRIC_ID_SET = derived.idSet
export const DEFAULT_FINANCE_MEMBERSHIPS_METRIC_IDS = derived.defaultIds
export const FINANCE_MEMBERSHIPS_MAX_ACTIVE_METRICS = derived.maxActive
