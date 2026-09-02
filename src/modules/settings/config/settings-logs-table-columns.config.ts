export type SettingsLogsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const SETTINGS_LOGS_TABLE_COLUMNS_CATALOG: SettingsLogsTableColumnCatalogItem[] = [
  {
    id: 'performed-by',
    label: 'User ID',
    type: 'Text',
    description: 'Admin who performed the action',
    defaultVisible: true,
  },
  {
    id: 'role',
    label: 'Roles',
    type: 'Text',
    description: 'Admin role at time of action',
    defaultVisible: true,
  },
  {
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Settings module affected',
    defaultVisible: true,
  },
  {
    id: 'changed-settings',
    label: 'Changed Settings',
    type: 'Text',
    description: 'Settings fields that were changed',
    defaultVisible: true,
  },
  {
    id: 'old-values',
    label: 'Old Values',
    type: 'Text',
    description: 'Previous values before the change',
    defaultVisible: true,
  },
  {
    id: 'new-values',
    label: 'New Values',
    type: 'Text',
    description: 'Updated values after the change',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Action result status',
    defaultVisible: true,
  },
  {
    id: 'created-at',
    label: 'Timestamp',
    type: 'Date',
    description: 'When the action was performed',
    defaultVisible: true,
  },
  {
    id: 'actions',
    label: 'Actions',
    type: 'Actions',
    description: 'Row action menu',
    defaultVisible: true,
  },
]

export const DEFAULT_SETTINGS_LOGS_VISIBLE_COLUMN_IDS = SETTINGS_LOGS_TABLE_COLUMNS_CATALOG.filter(
  (column) => column.defaultVisible,
).map((column) => column.id)

export const SETTINGS_LOGS_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  performedBy: 'performed-by',
  createdAt: 'created-at',
  changedSettings: 'changed-settings',
  oldValues: 'old-values',
  newValues: 'new-values',
}
