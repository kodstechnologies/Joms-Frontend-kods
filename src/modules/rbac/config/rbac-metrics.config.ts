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
  ['total-user', 'Total Admin Users', 'Count', 'Total admin users registered', true],
  ['total-active-users', 'Active Admin Users', 'Count', 'Admin users with active accounts', true],
  ['currently-online-users', 'Currently Online Users', 'Count', 'Admins currently logged in', true],
  ['total-roles-available', 'Total Roles Available', 'Count', 'Total RBAC roles configured', true],
  ['suspended-users', 'Suspended Users', 'Count', 'Suspended admin accounts', true],
  ['deleted-roles', 'Deleted Roles', 'Count', 'Roles marked as deleted/disabled', false],
  ['pending-invitations', 'Pending Invitations', 'Count', 'Invitations awaiting acceptance', false],
  [
    'invitation-acceptance-rate',
    'Invitation Acceptance Rate',
    'Percentage',
    'Accepted invitations ÷ total invitations sent',
    false,
  ],
  [
    'mfa-adoption-rate',
    'MFA Adoption Rate',
    'Percentage',
    'Admin accounts with MFA enabled ÷ active admins',
    false,
  ],
  [
    'privileged-users',
    'Privileged Users',
    'Count',
    'Users assigned high-risk / critical roles',
    false,
  ],
  [
    'active-role-assignments',
    'Active Role Assignments',
    'Count',
    'Total active role-user mappings',
    false,
  ],
  [
    'permission-changes-mtd',
    'Permission Changes (MTD)',
    'Count',
    'Role/permission updates in the current month',
    false,
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
  'total-roles-available': 'totalRolesAvailable',
  'suspended-users': 'suspendedUsers',
  'deleted-roles': 'deletedRoles',
  'pending-invitations': 'pendingInvitations',
  'invitation-acceptance-rate': 'invitationAcceptanceRate',
  'mfa-adoption-rate': 'mfaAdoptionRate',
  'privileged-users': 'privilegedUsers',
  'active-role-assignments': 'activeRoleAssignments',
  'permission-changes-mtd': 'permissionChangesMtd',
} as const
