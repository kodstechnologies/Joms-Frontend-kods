export type IncidentTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG: IncidentTableColumnCatalogItem[] = [
  {
    id: 'incident-id',
    label: 'Incident ID',
    type: 'Text',
    description: 'Unique incident identifier',
    defaultVisible: true,
  },
  {
    id: 'incident-title',
    label: 'Incident Title',
    type: 'Text',
    description: 'Short incident title or subject',
    defaultVisible: true,
  },
  {
    id: 'reported-at',
    label: 'Reported At',
    type: 'Date',
    description: 'When the incident was reported',
    defaultVisible: true,
  },
  {
    id: 'severity',
    label: 'Severity',
    type: 'Text',
    description: 'Incident severity level',
    defaultVisible: true,
  },
  {
    id: 'first-response-time',
    label: 'First Response Time',
    type: 'Text',
    description: 'Time to first response',
    defaultVisible: true,
  },
  {
    id: 'closed-at',
    label: 'Closed At',
    type: 'Date',
    description: 'When the incident was closed',
    defaultVisible: true,
  },
  {
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Affected platform module',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current incident status',
    defaultVisible: true,
  },
  {
    id: 'assignee',
    label: 'Assignee',
    type: 'Text',
    description: 'Assigned owner',
    defaultVisible: true,
  },
  {
    id: 'root-cause',
    label: 'Root Cause',
    type: 'Text',
    description: 'Identified root cause',
    defaultVisible: true,
  },
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
