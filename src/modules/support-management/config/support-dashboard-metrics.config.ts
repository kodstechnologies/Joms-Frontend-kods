import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

export const SUPPORT_DASHBOARD_MODULE_KEY = 'support-dashboard'

export type SupportDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const SUPPORT_DASHBOARD_METRICS_CATALOG: SupportDashboardMetricCatalogItem[] = [
  {
    id: 'total-tickets',
    label: 'Total Tickets',
    type: 'Count',
    description: 'Total tickets in the system',
    defaultActive: true,
  },
  {
    id: 'open-tickets',
    label: 'Open Tickets',
    type: 'Count',
    description: 'Currently open tickets (Open, Assigned, In Progress, Pending Customer)',
    defaultActive: true,
  },
  {
    id: 'tickets-in-progress',
    label: 'Tickets In Progress',
    type: 'Count',
    description: 'Active tickets being worked on',
    defaultActive: true,
  },
  {
    id: 'assigned-to-me',
    label: 'Assigned to Me',
    type: 'Count',
    description: 'Tickets assigned to the logged-in admin',
    defaultActive: true,
  },
  {
    id: 'escalated-by-me',
    label: 'Escalated by Me',
    type: 'Count',
    description: 'Tickets escalated by the logged-in admin',
    defaultActive: true,
  },
  {
    id: 'average-first-response-time',
    label: 'Average First Response Time',
    type: 'Duration',
    description: 'Average time to first response',
    defaultActive: true,
  },
  {
    id: 'average-resolution-time',
    label: 'Average Resolution Time',
    type: 'Duration',
    description: 'Average resolution duration',
    defaultActive: true,
  },
  {
    id: 'tickets-resolved-today',
    label: 'Tickets Resolved Today',
    type: 'Count',
    description: 'Tickets resolved today',
    defaultActive: true,
  },
]

export const SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'total-open-tickets': 'open-tickets',
  'escalated-tickets': 'escalated-by-me',
  'resolved-today': 'tickets-resolved-today',
  'avg-response-time': 'average-first-response-time',
  'avg-resolution-time': 'average-resolution-time',
}

const derived = deriveMetricExports(SUPPORT_DASHBOARD_METRICS_CATALOG)
export const SUPPORT_DASHBOARD_METRIC_IDS = derived.ids
export const SUPPORT_DASHBOARD_METRIC_ID_SET = derived.idSet
export const DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS = derived.defaultIds
export const SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS = derived.maxActive
