export const EXPERT_CLIENTELE_MODULE_KEY = 'expert-clientele'

export type ExpertClienteleMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Expert Clientele dashboard metrics — matches the clientele summary cards. */
export const EXPERT_CLIENTELE_METRICS_CATALOG: ExpertClienteleMetricCatalogItem[] = [
  {
    id: 'services-listed',
    label: 'Number of Services Listed',
    type: 'Count',
    description: 'Total services listed by the expert',
    defaultActive: true,
  },
  {
    id: 'consultations-listed',
    label: 'Number of Consultations Listed',
    type: 'Count',
    description: 'Total consultations listed by the expert',
    defaultActive: true,
  },
  {
    id: 'unique-clients',
    label: 'Number of Unique Clients',
    type: 'Count',
    description: 'Distinct clients who booked with the expert',
    defaultActive: true,
  },
  {
    id: 'client-satisfaction-score',
    label: 'Client Satisfaction Score',
    type: 'Percentage',
    description: 'Overall client satisfaction score',
    defaultActive: true,
  },
  {
    id: 'total-orders-bookings',
    label: 'Total Orders & Bookings',
    type: 'Count',
    description: 'All orders and bookings placed',
    defaultActive: true,
  },
  {
    id: 'active-orders-bookings',
    label: 'Active Orders & Bookings',
    type: 'Count',
    description: 'Currently active orders and bookings',
    defaultActive: true,
  },
  {
    id: 'completed-orders-bookings',
    label: 'Completed Orders & Bookings',
    type: 'Count',
    description: 'Successfully completed orders and bookings',
    defaultActive: true,
  },
  {
    id: 'cancelled-orders-bookings',
    label: 'Cancelled / Terminated Orders',
    type: 'Count',
    description: 'Cancelled or terminated orders and bookings',
    defaultActive: true,
  },
  {
    id: 'clients-by-membership',
    label: 'Clients by Membership',
    type: 'Count',
    description: 'Client count grouped by membership tier',
    defaultActive: true,
  },
  {
    id: 'repeat-client-percent',
    label: 'Repeat Client %',
    type: 'Percentage',
    description: 'Percentage of returning clients',
    defaultActive: true,
  },
  {
    id: 'nps',
    label: 'Net Promoter Score',
    type: 'Count',
    description: 'Net promoter score from client feedback',
    defaultActive: true,
  },
  {
    id: 'avg-rating',
    label: 'Avg. Rating',
    type: 'Average',
    description: 'Average client rating',
    defaultActive: true,
  },
  {
    id: 'no-of-reviews',
    label: 'No. of Reviews',
    type: 'Count',
    description: 'Total number of client reviews',
    defaultActive: true,
  },
]

export const EXPERT_CLIENTELE_METRIC_IDS = EXPERT_CLIENTELE_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const EXPERT_CLIENTELE_METRIC_ID_SET = new Set(EXPERT_CLIENTELE_METRIC_IDS)

export const DEFAULT_EXPERT_CLIENTELE_METRIC_IDS = EXPERT_CLIENTELE_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const EXPERT_CLIENTELE_MAX_ACTIVE_METRICS = EXPERT_CLIENTELE_METRICS_CATALOG.length
