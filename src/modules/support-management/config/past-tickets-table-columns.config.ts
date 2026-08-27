/**
 * Past Tickets of User — table column catalog.
 * Source: JOMS Excel → Support Management → Ticket Management – Past Tickets of User (13).
 */

export const PAST_TICKETS_MODULE_KEY = 'past-tickets'

export type PastTicketsTableColumnCatalogItem = {
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
): PastTicketsTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const PAST_TICKETS_TABLE_COLUMNS_CATALOG: PastTicketsTableColumnCatalogItem[] = [
  col('ticket-id', 'Ticket ID', 'Text', 'Ticket identifier', true),
  col('subject', 'Subject', 'Text', 'Ticket title', true),
  col('status', 'Status', 'Status', 'Ticket status (Resolved, Closed)', true),
  col('priority', 'Priority', 'Text', 'Ticket priority', true),
  col('category', 'Category', 'Text', 'Ticket category', true),
  col('sla-timer', 'SLA Timer', 'Duration', 'Remaining SLA (if unresolved)', true),
  col('assigned-on', 'Assigned On', 'Date', 'Assignment timestamp', true),
  col('assigned-by', 'Assigned By', 'Text', 'Assigning admin', true),
  col('assigned-to', 'Assigned To', 'Text', 'Assigned support agent', true),
  col('resolved-at', 'Resolved At', 'Date', 'Resolution timestamp', true),
  col('resolved-by', 'Resolved By', 'Text', 'Resolving admin', true),
  col('resolution-time', 'Resolution Time', 'Duration', 'Total resolution duration', true),
  col('last-updated-at', 'Last Updated At', 'Date', 'Last activity timestamp', true),
]

/** Maps legacy accessorKey-style preference ids → kebab catalog ids. */
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
