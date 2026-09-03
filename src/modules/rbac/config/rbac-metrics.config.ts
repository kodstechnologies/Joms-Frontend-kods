export const RBAC_HUB_MODULE_KEY = 'rbac-hub'

export type RbacHubMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
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

export const RBAC_HUB_METRICS_CATALOG: RbacHubMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const RBAC_HUB_METRIC_IDS = RBAC_HUB_METRICS_CATALOG.map((metric) => metric.id)

export const RBAC_HUB_METRIC_ID_SET = new Set(RBAC_HUB_METRIC_IDS)

export const DEFAULT_RBAC_HUB_METRIC_IDS = RBAC_HUB_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const RBAC_HUB_MAX_ACTIVE_METRICS = RBAC_HUB_METRICS_CATALOG.length

export const RBAC_HUB_STAT_KEYS = {
  'total-user': 'totalUsers',
  'total-active-users': 'totalActiveUsers',
  'currently-online-users': 'currentlyOnlineUsers',
  'suspended-users': 'suspendedUsers',
  'total-roles-available': 'totalRolesAvailable',
} as const
