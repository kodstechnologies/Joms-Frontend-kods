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
    description: 'Unique user identifier',
    defaultVisible: true,
  },
  {
    id: 'users-fullname',
    label: 'Username',
    type: 'Text',
    description: 'User display name',
    defaultVisible: true,
  },
  {
    id: 'users-role-id',
    label: 'Role ID',
    type: 'Text',
    description: 'Assigned role identifiers',
    defaultVisible: true,
  },
  {
    id: 'users-role-name',
    label: 'Role Name',
    type: 'Text',
    description: 'Assigned role names',
    defaultVisible: true,
  },
  {
    id: 'users-scope',
    label: 'Scope',
    type: 'Text',
    description: 'User access scopes',
    defaultVisible: true,
  },
  {
    id: 'users-permissions',
    label: 'Permissions',
    type: 'Text',
    description: 'User permissions summary',
    defaultVisible: true,
  },
  {
    id: 'users-mfa-enabled',
    label: 'MFA Enabled',
    type: 'Text',
    description: 'Multi-factor authentication status',
    defaultVisible: true,
  },
  {
    id: 'users-status',
    label: 'Status',
    type: 'Status',
    description: 'User account status',
    defaultVisible: true,
  },
  {
    id: 'users-last-action',
    label: 'Last action performed',
    type: 'Date',
    description: 'Timestamp of last user action',
    defaultVisible: true,
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
    description: 'Role display name',
    defaultVisible: true,
  },
  {
    id: 'roles-description',
    label: 'Description',
    type: 'Text',
    description: 'Role description',
    defaultVisible: true,
  },
  {
    id: 'roles-scope',
    label: 'Scope',
    type: 'Text',
    description: 'Role access scopes',
    defaultVisible: true,
  },
  {
    id: 'roles-permissions',
    label: 'Permissions',
    type: 'Text',
    description: 'Role permissions summary',
    defaultVisible: true,
  },
  {
    id: 'roles-risk-level',
    label: 'Risk level',
    type: 'Text',
    description: 'Role risk classification',
    defaultVisible: true,
  },
  {
    id: 'roles-mfa-required',
    label: 'MFA Required',
    type: 'Text',
    description: 'Whether MFA is required for this role',
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
    label: 'Users (No.)',
    type: 'Count',
    description: 'Number of users assigned to the role',
    defaultVisible: true,
  },
]

export const RBAC_HUB_TABLE_COLUMNS_CATALOG: RbacHubTableColumnCatalogItem[] = [
  ...RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG,
  ...RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG,
]

export const DEFAULT_RBAC_HUB_USERS_VISIBLE_COLUMN_IDS =
  RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const DEFAULT_RBAC_HUB_ROLES_VISIBLE_COLUMN_IDS =
  RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const RBAC_HUB_USERS_COLUMN_PREFIX = 'users-'
export const RBAC_HUB_ROLES_COLUMN_PREFIX = 'roles-'
