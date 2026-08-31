export const EXECUTIVE_OVERVIEW_MODULE_KEY = 'executive-overview'

export type ExecutiveOverviewMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const EXECUTIVE_OVERVIEW_METRICS_CATALOG: ExecutiveOverviewMetricCatalogItem[] = [
  // —— Core (defaults) ——
  {
    id: 'total-platform-revenue',
    label: 'Total Platform Revenue',
    type: 'Currency',
    description:
      'All-time paid GMV from services, consultations, venues, and memberships (refunds excluded)',
    defaultActive: true,
  },
  {
    id: 'monthly-recurring-revenue',
    label: 'Monthly Recurring Revenue',
    type: 'Currency',
    description: 'Active membership prices converted to a monthly equivalent',
    defaultActive: true,
  },
  {
    id: 'customer-lifetime-value',
    label: 'Customer Lifetime Value',
    type: 'Currency',
    description: 'All-time paid GMV divided by unique paying users',
    defaultActive: true,
  },
  {
    id: 'gross-margin',
    label: 'Gross Margin',
    type: 'Percentage',
    description: 'Platform take ÷ GMV (membership 100%; others snapshot fee or 10% guardrail)',
    defaultActive: true,
  },
  {
    id: 'overall-platform-commission',
    label: 'Overall Platform Commission',
    type: 'Currency',
    description: 'Sum of platform take / commission fees across paid modules',
    defaultActive: false,
  },
  {
    id: 'active-members',
    label: 'Active Members',
    type: 'Count',
    description: 'Active, unexpired membership subscriptions',
    defaultActive: true,
  },
  {
    id: 'total-events-mtd',
    label: 'Total Events (MTD)',
    type: 'Count',
    description: 'Non-cancelled venue calendar sessions this month',
    defaultActive: true,
  },
  {
    id: 'ltv-cac-ratio',
    label: 'LTV:CAC Ratio',
    type: 'Number',
    description: 'CLV divided by average first membership payment',
    defaultActive: true,
  },
  {
    id: 'net-promoter-score',
    label: 'Net Promoter Score',
    type: 'Number',
    description: 'NPS from approved ratings (5 = promoter, ≤3 = detractor)',
    defaultActive: true,
  },
  {
    id: 'avg-revenue-per-partner',
    label: 'Avg. Revenue per Partner',
    type: 'Currency',
    description: 'All-time GMV divided by unique paying users',
    defaultActive: false,
  },

  // —— Services ——
  {
    id: 'total-listed-services',
    label: 'Total Listed Services',
    type: 'Count',
    description: 'Total service listings (active + inactive)',
    defaultActive: false,
  },
  {
    id: 'active-services',
    label: 'Active Services',
    type: 'Count',
    description: 'Services currently available for booking',
    defaultActive: false,
  },
  {
    id: 'total-services-delivered',
    label: 'Total Services Delivered',
    type: 'Count',
    description: 'Completed service orders',
    defaultActive: false,
  },
  {
    id: 'service-completion-rate',
    label: 'Service Completion Rate',
    type: 'Percentage',
    description: 'Completed service orders ÷ total service orders',
    defaultActive: false,
  },
  {
    id: 'avg-service-delivery-time',
    label: 'Avg. Service Delivery Time',
    type: 'Duration',
    description: 'Average delivery duration of completed services',
    defaultActive: false,
  },
  {
    id: 'total-service-revenue',
    label: 'Total Service Revenue',
    type: 'Currency',
    description: 'Paid GMV from the service module',
    defaultActive: false,
  },
  {
    id: 'avg-revenue-per-completed-service',
    label: 'Avg. Revenue per Completed Service',
    type: 'Currency',
    description: 'Service GMV ÷ completed service orders',
    defaultActive: false,
  },
  {
    id: 'repeat-service-client-rate',
    label: 'Repeat Service Client Rate',
    type: 'Percentage',
    description: 'Clients with more than one service order ÷ unique service clients',
    defaultActive: false,
  },

  // —— Consultations ——
  {
    id: 'total-listed-consultations',
    label: 'Total Listed Consultations',
    type: 'Count',
    description: 'Total consultation listings (active + inactive)',
    defaultActive: false,
  },
  {
    id: 'active-consultations',
    label: 'Active Consultations',
    type: 'Count',
    description: 'Live consultation listings',
    defaultActive: false,
  },
  {
    id: 'total-consultations-completed',
    label: 'Total Consultations Completed',
    type: 'Count',
    description: 'Successfully completed consultations',
    defaultActive: false,
  },
  {
    id: 'consultation-completion-rate',
    label: 'Consultation Completion Rate',
    type: 'Percentage',
    description: 'Completed consultations ÷ total consultation bookings',
    defaultActive: false,
  },
  {
    id: 'avg-consultation-duration',
    label: 'Avg. Consultation Duration',
    type: 'Duration',
    description: 'Average duration of completed consultations',
    defaultActive: false,
  },
  {
    id: 'total-consultation-revenue',
    label: 'Total Consultation Revenue',
    type: 'Currency',
    description: 'Paid GMV from the consultation module',
    defaultActive: false,
  },
  {
    id: 'avg-revenue-per-completed-consultation',
    label: 'Avg. Revenue per Completed Consultation',
    type: 'Currency',
    description: 'Consultation GMV ÷ completed consultations',
    defaultActive: false,
  },
  {
    id: 'repeat-consultation-client-rate',
    label: 'Repeat Consultation Client Rate',
    type: 'Percentage',
    description: 'Clients with more than one consultation ÷ unique consultation clients',
    defaultActive: false,
  },

  // —— Venues ——
  {
    id: 'total-venues',
    label: 'Total Venues',
    type: 'Count',
    description: 'Total venue listings including inactive',
    defaultActive: false,
  },
  {
    id: 'active-venues',
    label: 'Active Venues',
    type: 'Count',
    description: 'Venues currently available',
    defaultActive: false,
  },
  {
    id: 'avg-venue-utilisation',
    label: 'Avg. Venue Utilisation',
    type: 'Percentage',
    description: 'Booked venue minutes ÷ operating capacity (MTD proxy)',
    defaultActive: false,
  },
  {
    id: 'events-per-venue',
    label: 'Events per Venue',
    type: 'Number',
    description: 'Total events ÷ active venues',
    defaultActive: false,
  },
  {
    id: 'venue-revenue-contribution',
    label: 'Venue Revenue Contribution',
    type: 'Percentage',
    description: 'Venue GMV ÷ platform GMV',
    defaultActive: false,
  },
  {
    id: 'venue-cancellation-rate',
    label: 'Venue Cancellation Rate',
    type: 'Percentage',
    description: 'Cancelled venue sessions ÷ all venue sessions',
    defaultActive: false,
  },
  {
    id: 'avg-venue-rating',
    label: 'Avg. Venue Rating',
    type: 'Rating',
    description: 'Average approved venue/event rating (0–5)',
    defaultActive: false,
  },

  // —— Platform & ops ——
  {
    id: 'admin-actions-mtd',
    label: 'Admin Actions (MTD)',
    type: 'Count',
    description: 'Admin audit log entries this month',
    defaultActive: false,
  },
  {
    id: 'critical-actions-logged',
    label: 'Critical Actions Logged',
    type: 'Count',
    description: 'High-risk admin actions this month (delete, refund, suspend, etc.)',
    defaultActive: false,
  },
  {
    id: 'open-support-tickets',
    label: 'Open Support Tickets',
    type: 'Count',
    description: 'Support tickets in Open, In Progress, or On Hold',
    defaultActive: false,
  },
]

export const EXECUTIVE_OVERVIEW_METRIC_IDS = EXECUTIVE_OVERVIEW_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const EXECUTIVE_OVERVIEW_METRIC_ID_SET = new Set(EXECUTIVE_OVERVIEW_METRIC_IDS)

export const DEFAULT_EXECUTIVE_METRIC_IDS = EXECUTIVE_OVERVIEW_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)
