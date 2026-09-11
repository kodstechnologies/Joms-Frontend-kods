export const PAST_TICKETS_MODULE_KEY = 'past-tickets'

export type PastTicketsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const PAST_TICKETS_TABLE_COLUMNS_CATALOG: PastTicketsTableColumnCatalogItem[] = [
  {
    id: 'ticket-id',
    label: 'Ticket ID',
    type: 'Text',
    description: 'Ticket identifier',
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
    description: 'Ticket status (Resolved, Closed)',
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
    id: 'sla-timer',
    label: 'SLA Timer',
    type: 'Duration',
    description: 'Remaining SLA (if unresolved)',
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
    description: 'Last activity timestamp',
    defaultVisible: true,
  },
]

export const PAST_TICKETS_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  id: 'ticket-id',
  ticketId: 'ticket-id',
  slaTimer: 'sla-timer',
  assignedAt: 'assigned-on',
  assignedBy: 'assigned-by',
  assignedTo: 'assigned-to',
  resolvedAt: 'resolved-at',
  resolvedBy: 'resolved-by',
  resolutionTime: 'resolution-time',
  lastUpdatedAt: 'last-updated-at',
}

export const DEFAULT_PAST_TICKETS_VISIBLE_COLUMN_IDS = PAST_TICKETS_TABLE_COLUMNS_CATALOG.filter(
  (column) => column.defaultVisible,
).map((column) => column.id)
