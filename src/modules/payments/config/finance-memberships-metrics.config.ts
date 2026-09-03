import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

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

const derived = deriveMetricExports(FINANCE_MEMBERSHIPS_METRICS_CATALOG)
export const FINANCE_MEMBERSHIPS_METRIC_IDS = derived.ids
export const FINANCE_MEMBERSHIPS_METRIC_ID_SET = derived.idSet
export const DEFAULT_FINANCE_MEMBERSHIPS_METRIC_IDS = derived.defaultIds
export const FINANCE_MEMBERSHIPS_MAX_ACTIVE_METRICS = derived.maxActive
