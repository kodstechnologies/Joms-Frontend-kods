import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const RBAC_HUB_MODULE_KEY = 'rbac-hub'

export type RbacHubMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const RBAC_HUB_METRIC_DEFS: MetricRowTuple[] = [
  ['total-user', 'Total User', 'Count', 'Total users in the RBAC system', true],
  ['total-active-users', 'Total active users', 'Count', 'Total active user accounts', true],
  ['currently-online-users', 'Currently online users', 'Count', 'Users currently online', true],
  ['suspended-users', 'Suspended Users', 'Count', 'Suspended user accounts', true],
  [
    'total-roles-available',
    'Total Roles Available',
    'Count',
    'Total roles configured in the system',
    true,
  ],
]

export const RBAC_HUB_METRICS_CATALOG = catalogFromMetricRows(
  RBAC_HUB_METRIC_DEFS,
) as RbacHubMetricCatalogItem[]

const derived = deriveMetricExports(RBAC_HUB_METRICS_CATALOG)
export const RBAC_HUB_METRIC_IDS = derived.ids
export const RBAC_HUB_METRIC_ID_SET = derived.idSet
export const DEFAULT_RBAC_HUB_METRIC_IDS = derived.defaultIds
export const RBAC_HUB_MAX_ACTIVE_METRICS = derived.maxActive

export const RBAC_HUB_STAT_KEYS = {
  'total-user': 'totalUsers',
  'total-active-users': 'totalActiveUsers',
  'currently-online-users': 'currentlyOnlineUsers',
  'suspended-users': 'suspendedUsers',
  'total-roles-available': 'totalRolesAvailable',
} as const
