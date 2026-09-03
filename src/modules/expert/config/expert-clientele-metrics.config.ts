import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const EXPERT_CLIENTELE_MODULE_KEY = 'expert-clientele'

export type ExpertClienteleMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const METRIC_ROWS: MetricRowTuple[] = [
  [
    'services-listed',
    'Number of Services Listed',
    'Count',
    'Total services listed by the expert',
    true,
  ],
  [
    'consultations-listed',
    'Number of Consultations Listed',
    'Count',
    'Total consultations listed by the expert',
    true,
  ],
  [
    'unique-clients',
    'Number of Unique Clients',
    'Count',
    'Distinct clients who booked with the expert',
    true,
  ],
  [
    'client-satisfaction-score',
    'Client Satisfaction Score',
    'Percentage',
    'Overall client satisfaction score',
    true,
  ],
  [
    'total-orders-bookings',
    'Total Orders & Bookings',
    'Count',
    'All orders and bookings placed',
    true,
  ],
  [
    'active-orders-bookings',
    'Active Orders & Bookings',
    'Count',
    'Currently active orders and bookings',
    true,
  ],
  [
    'completed-orders-bookings',
    'Completed Orders & Bookings',
    'Count',
    'Successfully completed orders and bookings',
    true,
  ],
  [
    'cancelled-orders-bookings',
    'Cancelled / Terminated Orders',
    'Count',
    'Cancelled or terminated orders and bookings',
    true,
  ],
  [
    'clients-by-membership',
    'Clients by Membership',
    'Count',
    'Client count grouped by membership tier',
    true,
  ],
  [
    'repeat-client-percent',
    'Repeat Client %',
    'Percentage',
    'Percentage of returning clients',
    true,
  ],
  ['nps', 'Net Promoter Score', 'Count', 'Net promoter score from client feedback', true],
  ['avg-rating', 'Avg. Rating', 'Average', 'Average client rating', true],
  ['no-of-reviews', 'No. of Reviews', 'Count', 'Total number of client reviews', true],
]

export const EXPERT_CLIENTELE_METRICS_CATALOG = catalogFromMetricRows(
  METRIC_ROWS,
) as ExpertClienteleMetricCatalogItem[]

const derived = deriveMetricExports(EXPERT_CLIENTELE_METRICS_CATALOG)
export const EXPERT_CLIENTELE_METRIC_IDS = derived.ids
export const EXPERT_CLIENTELE_METRIC_ID_SET = derived.idSet
export const DEFAULT_EXPERT_CLIENTELE_METRIC_IDS = derived.defaultIds
export const EXPERT_CLIENTELE_MAX_ACTIVE_METRICS = derived.maxActive
