export const FINANCE_MEMBERSHIPS_MODULE_KEY = 'finance-memberships'

export type FinanceMembershipsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
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

export const FINANCE_MEMBERSHIPS_METRICS_CATALOG: FinanceMembershipsMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

export const FINANCE_MEMBERSHIPS_METRIC_IDS = FINANCE_MEMBERSHIPS_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const FINANCE_MEMBERSHIPS_METRIC_ID_SET = new Set(FINANCE_MEMBERSHIPS_METRIC_IDS)

export const DEFAULT_FINANCE_MEMBERSHIPS_METRIC_IDS = FINANCE_MEMBERSHIPS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const FINANCE_MEMBERSHIPS_MAX_ACTIVE_METRICS = FINANCE_MEMBERSHIPS_METRICS_CATALOG.length
