export const FINANCE_MEMBERSHIPS_MODULE_KEY = 'finance-memberships'

export type FinanceMembershipsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const FINANCE_MEMBERSHIPS_METRICS_CATALOG: FinanceMembershipsMetricCatalogItem[] = [
  {
    id: 'active-subscriptions',
    label: 'Active Subscriptions',
    type: 'Count',
    description: 'Subscriptions currently billed and in good standing',
    defaultActive: true,
  },
  {
    id: 'paused',
    label: 'Paused',
    type: 'Count',
    description: 'Subscriptions temporarily paused',
    defaultActive: true,
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    type: 'Count',
    description: 'Subscriptions cancelled by admin or member',
    defaultActive: true,
  },
  {
    id: 'expired',
    label: 'Expired',
    type: 'Count',
    description: 'Subscriptions that reached end of term without renewal',
    defaultActive: true,
  },
]

export const FINANCE_MEMBERSHIPS_METRIC_IDS = FINANCE_MEMBERSHIPS_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const FINANCE_MEMBERSHIPS_METRIC_ID_SET = new Set(FINANCE_MEMBERSHIPS_METRIC_IDS)

export const DEFAULT_FINANCE_MEMBERSHIPS_METRIC_IDS = FINANCE_MEMBERSHIPS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const FINANCE_MEMBERSHIPS_MAX_ACTIVE_METRICS = FINANCE_MEMBERSHIPS_METRICS_CATALOG.length
