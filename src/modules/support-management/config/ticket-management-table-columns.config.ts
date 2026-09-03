export type TicketManagementTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG: TicketManagementTableColumnCatalogItem[] = [
  {
    id: 'ticket-id',
    label: 'Ticket ID',
    type: 'Text',
    description: 'Unique ticket identifier',
    defaultVisible: true,
  },
  {
    id: 'subject',
    label: 'Subject',
    type: 'Text',
    description: 'Ticket title',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current ticket status',
    defaultVisible: true,
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'Text',
    description: 'Ticket priority',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Ticket category',
    defaultVisible: true,
  },
  {
    id: 'reporter',
    label: 'Reporter',
    type: 'Text',
    description: 'User who created the ticket',
    defaultVisible: true,
  },
  {
    id: 'sla-timer',
    label: 'SLA Timer',
    type: 'Duration',
    description: 'Remaining SLA time',
    defaultVisible: true,
  },
  {
    id: 'first-response-due',
    label: 'First Response Due',
    type: 'Date',
    description: 'SLA deadline for first response',
    defaultVisible: true,
  },
  {
    id: 'resolution-due',
    label: 'Resolution Due',
    type: 'Date',
    description: 'SLA deadline for resolution',
    defaultVisible: true,
  },
  {
    id: 'assigned-on',
    label: 'Assigned On',
    type: 'Date',
    description: 'Assignment timestamp',
    defaultVisible: true,
  },
  {
    id: 'assigned-by',
    label: 'Assigned By',
    type: 'Text',
    description: 'Assigning admin',
    defaultVisible: true,
  },
  {
    id: 'assigned-to',
    label: 'Assigned To',
    type: 'Text',
    description: 'Assigned support agent',
    defaultVisible: true,
  },
  {
    id: 'escalated-by',
    label: 'Escalated By',
    type: 'Text',
    description: 'Admin who escalated the ticket',
    defaultVisible: true,
  },
  {
    id: 'escalated-to',
    label: 'Escalated To',
    type: 'Text',
    description: 'Escalation recipient',
    defaultVisible: true,
  },
  {
    id: 'escalated-at',
    label: 'Escalated At',
    type: 'Date',
    description: 'Escalation timestamp',
    defaultVisible: true,
  },
  {
    id: 'escalation-status',
    label: 'Escalation Status',
    type: 'Status',
    description: 'Pending, Accepted, Rejected, or Completed',
    defaultVisible: true,
  },
  {
    id: 'escalated-for',
    label: 'Escalated For',
    type: 'Text',
    description: 'Escalation reason',
    defaultVisible: true,
  },
  {
    id: 'resolved-at',
    label: 'Resolved At',
    type: 'Date',
    description: 'Resolution timestamp',
    defaultVisible: true,
  },
  {
    id: 'resolved-by',
    label: 'Resolved By',
    type: 'Text',
    description: 'Resolving admin',
    defaultVisible: true,
  },
  {
    id: 'resolution-time',
    label: 'Resolution Time',
    type: 'Duration',
    description: 'Total resolution duration',
    defaultVisible: true,
  },
  {
    id: 'last-updated-at',
    label: 'Last Updated At',
    type: 'Date',
    description: 'Latest ticket activity',
    defaultVisible: true,
  },
]

export const ALL_TAB_COLUMN_IDS = [
  'ticket-id',
  'subject',
  'status',
  'priority',
  'category',
  'reporter',
  'sla-timer',
  'first-response-due',
  'resolution-due',
  'assigned-on',
  'assigned-by',
  'assigned-to',
  'resolved-at',
  'resolved-by',
  'resolution-time',
  'last-updated-at',
] as const

export const MY_TAB_COLUMN_IDS = [
  'ticket-id',
  'subject',
  'status',
  'priority',
  'category',
  'reporter',
  'sla-timer',
  'assigned-on',
  'assigned-by',
  'escalated-at',
  'escalated-for',
  'escalated-to',
  'resolution-time',
  'last-updated-at',
] as const

export const ESCALATED_TAB_COLUMN_IDS = [
  'ticket-id',
  'subject',
  'status',
  'priority',
  'category',
  'reporter',
  'sla-timer',
  'assigned-on',
  'assigned-by',
  'assigned-to',
  'escalated-by',
  'escalated-to',
  'escalated-at',
  'escalation-status',
  'escalated-for',
  'last-updated-at',
] as const

export const ALL_TAB_COLUMN_ID_SET = new Set<string>(ALL_TAB_COLUMN_IDS)
export const MY_TAB_COLUMN_ID_SET = new Set<string>(MY_TAB_COLUMN_IDS)
export const ESCALATED_TAB_COLUMN_ID_SET = new Set<string>(ESCALATED_TAB_COLUMN_IDS)

export const TICKET_MANAGEMENT_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  id: 'ticket-id',
  ticketId: 'ticket-id',
  slaTimer: 'sla-timer',
  firstResponseDueAt: 'first-response-due',
  'first-response-due-at': 'first-response-due',
  resolutionDueAt: 'resolution-due',
  'resolution-due-at': 'resolution-due',
  assignedAt: 'assigned-on',
  assignedBy: 'assigned-by',
  assignedTo: 'assigned-to',
  escalatedBy: 'escalated-by',
  escalatedTo: 'escalated-to',
  escalatedAt: 'escalated-at',
  escalationStatus: 'escalation-status',
  escalatedFor: 'escalated-for',
  resolvedAt: 'resolved-at',
  resolvedBy: 'resolved-by',
  resolutionTime: 'resolution-time',
  lastUpdatedAt: 'last-updated-at',
}

export const DEFAULT_TICKET_MANAGEMENT_VISIBLE_COLUMN_IDS =
  TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
