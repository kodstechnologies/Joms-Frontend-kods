export type TicketManagementTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): TicketManagementTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG: TicketManagementTableColumnCatalogItem[] = [
  col('ticket-id', 'Ticket ID', 'Text', 'Unique ticket identifier', true),
  col('subject', 'Subject', 'Text', 'Ticket title', true),
  col('status', 'Status', 'Status', 'Current ticket status', true),
  col('priority', 'Priority', 'Text', 'Ticket priority', true),
  col('category', 'Category', 'Text', 'Ticket category', true),
  col('reporter', 'Reporter', 'Text', 'User who created the ticket', true),
  col('sla-timer', 'SLA Timer', 'Duration', 'Remaining SLA time', true),
  col('first-response-due', 'First Response Due', 'Date', 'SLA deadline for first response', true),
  col('resolution-due', 'Resolution Due', 'Date', 'SLA deadline for resolution', true),
  col('assigned-on', 'Assigned On', 'Date', 'Assignment timestamp', true),
  col('assigned-by', 'Assigned By', 'Text', 'Assigning admin', true),
  col('assigned-to', 'Assigned To', 'Text', 'Assigned support agent', true),
  col('escalated-by', 'Escalated By', 'Text', 'Admin who escalated the ticket', true),
  col('escalated-to', 'Escalated To', 'Text', 'Escalation recipient', true),
  col('escalated-at', 'Escalated At', 'Date', 'Escalation timestamp', true),
  col(
    'escalation-status',
    'Escalation Status',
    'Status',
    'Pending, Accepted, Rejected, or Completed',
    true,
  ),
  col('escalated-for', 'Escalated For', 'Text', 'Escalation reason', true),
  col('resolved-at', 'Resolved At', 'Date', 'Resolution timestamp', true),
  col('resolved-by', 'Resolved By', 'Text', 'Resolving admin', true),
  col('resolution-time', 'Resolution Time', 'Duration', 'Total resolution duration', true),
  col('last-updated-at', 'Last Updated At', 'Date', 'Latest ticket activity', true),
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
