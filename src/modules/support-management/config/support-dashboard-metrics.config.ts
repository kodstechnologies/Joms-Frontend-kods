export const SUPPORT_DASHBOARD_MODULE_KEY = 'support-dashboard'

export type SupportDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Exactly 8 support dashboard metrics — matches the Support Management page. */
export const SUPPORT_DASHBOARD_METRICS_CATALOG: SupportDashboardMetricCatalogItem[] = [
  {
    id: 'total-open-tickets',
    label: 'Total Open Tickets',
    type: 'Count',
    description: 'Total currently open support tickets',
    defaultActive: true,
  },
  {
    id: 'new-tickets-today',
    label: 'New Tickets Today',
    type: 'Count',
    description: 'Tickets created today',
    defaultActive: true,
  },
  {
    id: 'tickets-in-progress',
    label: 'Tickets In-Progress',
    type: 'Count',
    description: 'Tickets actively being worked on',
    defaultActive: true,
  },
  {
    id: 'escalated-tickets',
    label: 'Escalated Tickets',
    type: 'Count',
    description: 'Tickets that have been escalated',
    defaultActive: true,
  },
  {
    id: 'resolved-today',
    label: 'Resolved Today',
    type: 'Count',
    description: 'Tickets resolved today',
    defaultActive: true,
  },
  {
    id: 'priority-tickets',
    label: 'Priority Tickets',
    type: 'Count',
    description: 'High and critical priority tickets',
    defaultActive: true,
  },
  {
    id: 'avg-response-time',
    label: 'Avg. Response Time',
    type: 'Duration',
    description: 'Average first response time',
    defaultActive: true,
  },
  {
    id: 'avg-resolution-time',
    label: 'Avg. Resolution Time',
    type: 'Duration',
    description: 'Average ticket resolution time',
    defaultActive: true,
  },
]

export const SUPPORT_DASHBOARD_METRIC_IDS = SUPPORT_DASHBOARD_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const SUPPORT_DASHBOARD_METRIC_ID_SET = new Set(SUPPORT_DASHBOARD_METRIC_IDS)

export const DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS = SUPPORT_DASHBOARD_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS = SUPPORT_DASHBOARD_METRICS_CATALOG.length
