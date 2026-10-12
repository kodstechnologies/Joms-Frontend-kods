export type EscalationsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const ESCALATIONS_TABLE_COLUMNS_CATALOG: EscalationsTableColumnCatalogItem[] = [
  {
    id: 'escalation-id',
    label: 'Escalation ID',
    type: 'Text',
    description: 'Unique escalation identifier',
    defaultVisible: true,
  },
  {
    id: 'entity-title',
    label: 'Expert / Entity',
    type: 'Text',
    description: 'Expert or entity under review',
    defaultVisible: true,
  },
  {
    id: 'roles-id',
    label: 'Roles ID',
    type: 'Text',
    description: 'Assigned role identifier',
    defaultVisible: true,
  },
  {
    id: 'role-name',
    label: 'Assigned To',
    type: 'Text',
    description: 'Sub-admin assigned to review',
    defaultVisible: true,
  },
  {
    id: 'escalation-type',
    label: 'Escalation Type',
    type: 'Text',
    description: 'Type of escalation',
    defaultVisible: true,
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'Text',
    description: 'Escalation priority level',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current escalation status',
    defaultVisible: true,
  },
  {
    id: 'created-on',
    label: 'Created On',
    type: 'Date',
    description: 'Escalation creation date',
    defaultVisible: true,
  },
]

export const DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS = ESCALATIONS_TABLE_COLUMNS_CATALOG.filter(
  (column) => column.defaultVisible,
).map((column) => column.id)

export const ESCALATIONS_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  escalationId: 'escalation-id',
  entityTitle: 'entity-title',
  roleId: 'roles-id',
  rolesId: 'roles-id',
  roleName: 'role-name',
  escalationType: 'escalation-type',
  createdOn: 'created-on',
}
