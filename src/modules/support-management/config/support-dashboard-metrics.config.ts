export const SUPPORT_DASHBOARD_MODULE_KEY = 'support-dashboard'

export type SupportDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['total-tickets', 'Total Tickets', 'Count', 'Total tickets in the system', true],
  [
    'open-tickets',
    'Open Tickets',
    'Count',
    'Currently open tickets (Open, Assigned, In Progress, Pending Customer)',
    true,
  ],
  ['tickets-in-progress', 'Tickets In Progress', 'Count', 'Active tickets being worked on', true],
  ['assigned-to-me', 'Assigned to Me', 'Count', 'Tickets assigned to the logged-in admin', true],
  ['escalated-by-me', 'Escalated by Me', 'Count', 'Tickets escalated by the logged-in admin', true],
  [
    'average-first-response-time',
    'Average First Response Time',
    'Duration',
    'Average time to first response',
    true,
  ],
  [
    'average-resolution-time',
    'Average Resolution Time',
    'Duration',
    'Average resolution duration',
    true,
  ],
  ['tickets-resolved-today', 'Tickets Resolved Today', 'Count', 'Tickets resolved today', true],
]

export const SUPPORT_DASHBOARD_METRICS_CATALOG: SupportDashboardMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

export const SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'total-open-tickets': 'open-tickets',
  'escalated-tickets': 'escalated-by-me',
  'resolved-today': 'tickets-resolved-today',
  'avg-response-time': 'average-first-response-time',
  'avg-resolution-time': 'average-resolution-time',
}

export const SUPPORT_DASHBOARD_METRIC_IDS = SUPPORT_DASHBOARD_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const SUPPORT_DASHBOARD_METRIC_ID_SET = new Set(SUPPORT_DASHBOARD_METRIC_IDS)

export const DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS = SUPPORT_DASHBOARD_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS = SUPPORT_DASHBOARD_METRICS_CATALOG.length
