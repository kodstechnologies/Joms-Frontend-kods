import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

export const RBAC_HUB_MODULE_KEY = 'rbac-hub'

export type RbacHubMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const RBAC_HUB_METRICS_CATALOG: RbacHubMetricCatalogItem[] = [
  {
    id: 'total-user',
    label: 'Total User',
    type: 'Count',
    description: 'Total users in the RBAC system',
    defaultActive: true,
  },
  {
    id: 'total-active-users',
    label: 'Total active users',
    type: 'Count',
    description: 'Total active user accounts',
    defaultActive: true,
  },
  {
    id: 'currently-online-users',
    label: 'Currently online users',
    type: 'Count',
    description: 'Users currently online',
    defaultActive: true,
  },
  {
    id: 'suspended-users',
    label: 'Suspended Users',
    type: 'Count',
    description: 'Suspended user accounts',
    defaultActive: true,
  },
  {
    id: 'total-roles-available',
    label: 'Total Roles Available',
    type: 'Count',
    description: 'Total roles configured in the system',
    defaultActive: true,
  },
]

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
