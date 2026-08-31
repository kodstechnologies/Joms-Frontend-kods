export type IncidentTableColumnCatalogItem = {
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
): IncidentTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG: IncidentTableColumnCatalogItem[] = [
  col('incident-id', 'Incident ID', 'Text', 'Unique incident identifier', true),
  col('incident-title', 'Incident Title', 'Text', 'Short incident title or subject', true),
  col('reported-at', 'Reported At', 'Date', 'When the incident was reported', true),
  col('severity', 'Severity', 'Text', 'Incident severity level', true),
  col('first-response-time', 'First Response Time', 'Text', 'Time to first response', true),
  col('closed-at', 'Closed At', 'Date', 'When the incident was closed', true),
  col('module', 'Module', 'Text', 'Affected platform module', true),
  col('status', 'Status', 'Status', 'Current incident status', true),
  col('assignee', 'Assignee', 'Text', 'Assigned owner', true),
  col('root-cause', 'Root Cause', 'Text', 'Identified root cause', true),
]

export const DEFAULT_INCIDENT_TRACKING_VISIBLE_COLUMN_IDS =
  INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const INCIDENT_TRACKING_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  incidentId: 'incident-id',
  title: 'incident-title',
  incidentTitle: 'incident-title',
  createdOn: 'reported-at',
  reportedAt: 'reported-at',
  firstResponseTime: 'first-response-time',
  closedAt: 'closed-at',
  resolvedAt: 'closed-at',
  rootCause: 'root-cause',
  reason: 'root-cause',
}
