import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const SUPPORT_DASHBOARD_MODULE_KEY = 'support-dashboard'

export type SupportDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const SUPPORT_DASHBOARD_METRIC_DEFS: MetricRowTuple[] = [
  [
    'total-open-tickets',
    'Total Open Tickets',
    'Count',
    'Tickets currently awaiting resolution (Open, Pending, In Progress)',
    true,
  ],
  ['new-tickets-today', 'New Tickets Today', 'Count', 'Tickets created today', true],
  [
    'tickets-in-progress',
    'Tickets In Progress',
    'Count',
    'Tickets actively assigned / in progress',
    true,
  ],
  [
    'escalated-tickets',
    'Escalated Tickets',
    'Count',
    'Tickets escalated to higher support levels',
    true,
  ],
  ['tickets-resolved-today', 'Tickets Resolved Today', 'Count', 'Tickets resolved today', true],
  [
    'total-tickets-resolved',
    'Total Tickets Resolved',
    'Count',
    'Total resolved tickets (lifetime)',
    true,
  ],
  ['priority-tickets', 'Priority Tickets', 'Count', 'High/Critical priority tickets', true],
  [
    'sla-breached-tickets',
    'SLA Breached Tickets',
    'Count',
    'Tickets that exceeded SLA and are not resolved',
    true,
  ],
  [
    'average-first-response-time',
    'Average First Response Time',
    'Duration',
    'Average time taken for first response',
    false,
  ],
  [
    'average-resolution-time',
    'Average Resolution Time',
    'Duration',
    'Average resolution duration',
    false,
  ],
  [
    'average-tickets-per-agent',
    'Average Tickets per Agent',
    'Decimal',
    'Average workload per support agent',
    false,
  ],
  [
    'first-contact-resolution',
    'First Contact Resolution (FCR)',
    'Percentage',
    'Tickets resolved without reopening or escalation',
    false,
  ],
  [
    'customer-satisfaction',
    'Customer Satisfaction (CSAT)',
    'Percentage',
    'Positive support ratings (ratings ≥ 4)',
    false,
  ],
  ['active-support-agents', 'Active Support Agents', 'Count', 'Currently available agents', false],
]

export const SUPPORT_DASHBOARD_METRICS_CATALOG = catalogFromMetricRows(
  SUPPORT_DASHBOARD_METRIC_DEFS,
) as SupportDashboardMetricCatalogItem[]

export const SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'total-tickets': 'total-open-tickets',
  'open-tickets': 'total-open-tickets',
  'escalated-by-me': 'escalated-tickets',
  'resolved-today': 'tickets-resolved-today',
  'avg-response-time': 'average-first-response-time',
  'avg-resolution-time': 'average-resolution-time',
  'assigned-to-me': 'tickets-in-progress',
}

const derived = deriveMetricExports(SUPPORT_DASHBOARD_METRICS_CATALOG)
export const SUPPORT_DASHBOARD_METRIC_IDS = derived.ids
export const SUPPORT_DASHBOARD_METRIC_ID_SET = derived.idSet
export const DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS = derived.defaultIds
export const SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS = derived.maxActive
