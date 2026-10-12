export type RbacHubTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG: RbacHubTableColumnCatalogItem[] = [
  {
    id: 'users-admin-code',
    label: 'User ID',
    type: 'Text',
    description: 'Unique admin ID',
    defaultVisible: true,
  },
  {
    id: 'users-fullname',
    label: 'Username',
    type: 'Text',
    description: 'Admin name',
    defaultVisible: true,
  },
  {
    id: 'users-email',
    label: 'Email ID',
    type: 'Text',
    description: 'Admin email',
    defaultVisible: true,
  },
  {
    id: 'users-role-id',
    label: 'Role ID',
    type: 'Text',
    description: 'Assigned role ID',
    defaultVisible: true,
  },
  {
    id: 'users-role-name',
    label: 'Role Name',
    type: 'Text',
    description: 'Assigned role',
    defaultVisible: true,
  },
  {
    id: 'users-scope',
    label: 'Scope',
    type: 'Text',
    description: 'Operational scope',
    defaultVisible: true,
  },
  {
    id: 'users-permissions',
    label: 'Effective Permissions',
    type: 'Text',
    description: 'Current permissions derived from role + overrides',
    defaultVisible: true,
  },
  {
    id: 'users-mfa-enabled',
    label: 'MFA Enabled',
    type: 'Text',
    description: 'MFA status',
    defaultVisible: true,
  },
  {
    id: 'users-status',
    label: 'Account Status',
    type: 'Status',
    description: 'Account state',
    defaultVisible: true,
  },
  {
    id: 'users-last-action',
    label: 'Last Action Performed',
    type: 'Text',
    description: 'Latest admin activity',
    defaultVisible: false,
  },
  {
    id: 'users-last-action-at',
    label: 'Last Action Performed At',
    type: 'Date',
    description: 'Timestamp of latest action',
    defaultVisible: true,
  },
  {
    id: 'users-last-login-at',
    label: 'Last Login At',
    type: 'Date',
    description: 'Most recent login',
    defaultVisible: false,
  },
  {
    id: 'users-created-at',
    label: 'Created At',
    type: 'Date',
    description: 'Account creation date',
    defaultVisible: false,
  },
]

export const RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG: RbacHubTableColumnCatalogItem[] = [
  {
    id: 'roles-role-id',
    label: 'Role ID',
    type: 'Text',
    description: 'Unique role identifier',
    defaultVisible: true,
  },
  {
    id: 'roles-name',
    label: 'Role Name',
    type: 'Text',
    description: 'Role title',
    defaultVisible: true,
  },
  {
    id: 'roles-description',
    label: 'Description',
    type: 'Text',
    description: 'Role purpose',
    defaultVisible: true,
  },
  {
    id: 'roles-scope',
    label: 'Scope',
    type: 'Text',
    description: 'Access scope',
    defaultVisible: true,
  },
  {
    id: 'roles-permissions',
    label: 'Permissions',
    type: 'Text',
    description: 'Assigned permissions',
    defaultVisible: true,
  },
  {
    id: 'roles-risk-level',
    label: 'Risk Level',
    type: 'Text',
    description: 'Privilege classification',
    defaultVisible: true,
  },
  {
    id: 'roles-mfa-required',
    label: 'MFA Required',
    type: 'Text',
    description: 'MFA mandatory for role',
    defaultVisible: true,
  },
  {
    id: 'roles-status',
    label: 'Status',
    type: 'Status',
    description: 'Role status',
    defaultVisible: true,
  },
  {
    id: 'roles-user-count',
    label: 'Users Assigned',
    type: 'Count',
    description: 'Number of users with this role',
    defaultVisible: true,
  },
  {
    id: 'roles-assigned-tasks',
    label: 'Total Assigned Tasks',
    type: 'Count',
    description: 'Tasks assigned to users in this role',
    defaultVisible: false,
  },
  {
    id: 'roles-escalations',
    label: 'Total Escalations',
    type: 'Count',
    description: 'Escalations received by this role',
    defaultVisible: false,
  },
  {
    id: 'roles-created-at',
    label: 'Created At',
    type: 'Date',
    description: 'Role creation date',
    defaultVisible: false,
  },
  {
    id: 'roles-updated-at',
    label: 'Updated At',
    type: 'Date',
    description: 'Last modified date',
    defaultVisible: false,
  },
]

export const RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG: RbacHubTableColumnCatalogItem[] = [
  {
    id: 'invites-invite-id',
    label: 'Invite ID',
    type: 'Text',
    description: 'Unique invitation ID',
    defaultVisible: true,
  },
  {
    id: 'invites-username',
    label: 'Username',
    type: 'Text',
    description: 'Invited admin name',
    defaultVisible: true,
  },
  {
    id: 'invites-email',
    label: 'Email ID',
    type: 'Text',
    description: 'Invitee email',
    defaultVisible: true,
  },
  {
    id: 'invites-role-id',
    label: 'Role ID',
    type: 'Text',
    description: 'Assigned role',
    defaultVisible: true,
  },
  {
    id: 'invites-role-name',
    label: 'Role Name',
    type: 'Text',
    description: 'Assigned role name',
    defaultVisible: true,
  },
  {
    id: 'invites-scope',
    label: 'Scope',
    type: 'Text',
    description: 'Assigned scope',
    defaultVisible: false,
  },
  {
    id: 'invites-sent-at',
    label: 'Invitation Sent At',
    type: 'Date',
    description: 'Invitation timestamp',
    defaultVisible: true,
  },
  {
    id: 'invites-expiry',
    label: 'Invitation Expiry',
    type: 'Date',
    description: 'Expiration date',
    defaultVisible: false,
  },
  {
    id: 'invites-status',
    label: 'Status',
    type: 'Status',
    description: 'Invitation status',
    defaultVisible: true,
  },
]

export const RBAC_HUB_TABLE_COLUMNS_CATALOG: RbacHubTableColumnCatalogItem[] = [
  ...RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG,
  ...RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG,
  ...RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG,
]

export const DEFAULT_RBAC_HUB_USERS_VISIBLE_COLUMN_IDS =
  RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const DEFAULT_RBAC_HUB_ROLES_VISIBLE_COLUMN_IDS =
  RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const DEFAULT_RBAC_HUB_INVITES_VISIBLE_COLUMN_IDS =
  RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const RBAC_HUB_USERS_COLUMN_PREFIX = 'users-'
export const RBAC_HUB_ROLES_COLUMN_PREFIX = 'roles-'
export const RBAC_HUB_INVITES_COLUMN_PREFIX = 'invites-'
