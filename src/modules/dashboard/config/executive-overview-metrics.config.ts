import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const EXECUTIVE_OVERVIEW_MODULE_KEY = 'executive-overview'

export type ExecutiveOverviewMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const EXECUTIVE_KPI_DEFS: MetricRowTuple[] = [
  [
    'total-platform-revenue',
    'Total Platform Revenue',
    'Currency',
    'All-time paid GMV from services, consultations, venues, and memberships (refunds excluded)',
    true,
  ],
  [
    'monthly-recurring-revenue',
    'Monthly Recurring Revenue',
    'Currency',
    'Active membership prices converted to a monthly equivalent',
    true,
  ],
  [
    'customer-lifetime-value',
    'Customer Lifetime Value',
    'Currency',
    'All-time paid GMV divided by unique paying users',
    true,
  ],
  [
    'gross-margin',
    'Gross Margin',
    'Percentage',
    'Platform take ÷ GMV (membership 100%; others snapshot fee or 10% guardrail)',
    true,
  ],
  [
    'overall-platform-commission',
    'Overall Platform Commission',
    'Currency',
    'Sum of platform take / commission fees across paid modules',
  ],
  [
    'net-profit',
    'Net Profit',
    'Currency',
    'Platform take after refunds and chargebacks (OpEx not instrumented)',
  ],
  ['active-members', 'Active Members', 'Count', 'Active, unexpired membership subscriptions', true],
  [
    'total-events-mtd',
    'Total Events (MTD)',
    'Count',
    'Non-cancelled venue calendar sessions this month',
    true,
  ],
  [
    'ltv-cac-ratio',
    'LTV:CAC Ratio',
    'Number',
    'CLV divided by average first membership payment',
    true,
  ],
  [
    'net-promoter-score',
    'Net Promoter Score',
    'Number',
    'NPS from approved ratings (5 = promoter, ≤3 = detractor)',
    true,
  ],
  [
    'avg-revenue-per-partner',
    'Avg. Revenue per Partner',
    'Currency',
    'All-time GMV divided by unique paying users',
  ],

  ['pending-payouts', 'Pending Payouts', 'Currency', 'Payout amount awaiting release to partners'],
  [
    'avg-payout-cycle-time',
    'Avg. Payout Cycle Time',
    'Duration',
    'Average time from payout scheduling to paid status',
  ],
  ['refund-rate', 'Refund Rate (%)', 'Percentage', 'Refunded amount ÷ paid GMV'],
  ['chargeback-rate', 'Chargeback Rate (%)', 'Percentage', 'Chargeback amount ÷ paid GMV'],

  [
    'total-listed-services',
    'Total Listed Services',
    'Count',
    'Total service listings (active + inactive)',
  ],
  ['active-services', 'Active Services', 'Count', 'Services currently available for booking'],
  ['total-services-delivered', 'Total Services Delivered', 'Count', 'Completed service orders'],
  [
    'service-completion-rate',
    'Service Completion Rate',
    'Percentage',
    'Completed service orders ÷ total service orders',
  ],
  [
    'avg-service-delivery-time',
    'Avg. Service Delivery Time',
    'Duration',
    'Average delivery duration of completed services',
  ],
  [
    'total-service-revenue',
    'Total Service Revenue',
    'Currency',
    'Paid GMV from the service module',
  ],
  [
    'avg-revenue-per-completed-service',
    'Avg. Revenue per Completed Service',
    'Currency',
    'Service GMV ÷ completed service orders',
  ],
  [
    'repeat-service-client-rate',
    'Repeat Service Client Rate',
    'Percentage',
    'Clients with more than one service order ÷ unique service clients',
  ],

  [
    'total-listed-consultations',
    'Total Listed Consultations',
    'Count',
    'Total consultation listings (active + inactive)',
  ],
  ['active-consultations', 'Active Consultations', 'Count', 'Live consultation listings'],
  [
    'total-consultations-completed',
    'Total Consultations Completed',
    'Count',
    'Successfully completed consultations',
  ],
  [
    'consultation-completion-rate',
    'Consultation Completion Rate',
    'Percentage',
    'Completed consultations ÷ total consultation bookings',
  ],
  [
    'avg-consultation-duration',
    'Avg. Consultation Duration',
    'Duration',
    'Average duration of completed consultations',
  ],
  [
    'total-consultation-revenue',
    'Total Consultation Revenue',
    'Currency',
    'Paid GMV from the consultation module',
  ],
  [
    'avg-revenue-per-completed-consultation',
    'Avg. Revenue per Completed Consultation',
    'Currency',
    'Consultation GMV ÷ completed consultations',
  ],
  [
    'repeat-consultation-client-rate',
    'Repeat Consultation Client Rate',
    'Percentage',
    'Clients with more than one consultation ÷ unique consultation clients',
  ],

  ['total-venues', 'Total Venues', 'Count', 'Total venue listings including inactive'],
  ['active-venues', 'Active Venues', 'Count', 'Venues currently available'],
  [
    'avg-venue-utilisation',
    'Avg. Venue Utilisation',
    'Percentage',
    'Booked venue minutes ÷ operating capacity (MTD proxy)',
  ],
  ['events-per-venue', 'Events per Venue', 'Number', 'Total events ÷ active venues'],
  [
    'venue-revenue-contribution',
    'Venue Revenue Contribution',
    'Percentage',
    'Venue GMV ÷ platform GMV',
  ],
  [
    'venue-cancellation-rate',
    'Venue Cancellation Rate',
    'Percentage',
    'Cancelled venue sessions ÷ all venue sessions',
  ],
  ['avg-venue-rating', 'Avg. Venue Rating', 'Rating', 'Average approved venue/event rating (0–5)'],

  ['admin-actions-mtd', 'Admin Actions (MTD)', 'Count', 'Admin audit log entries this month'],
  [
    'critical-actions-logged',
    'Critical Actions Logged',
    'Count',
    'High-risk admin actions this month (delete, refund, suspend, etc.)',
  ],
  [
    'avg-approval-time',
    'Avg. Approval Time',
    'Duration',
    'Average turnaround for completed approval / escalation requests',
  ],
  [
    'active-impersonation-sessions',
    'Active Impersonation Sessions',
    'Count',
    'Impersonation sessions logged this month',
  ],

  [
    'system-uptime',
    'System Uptime (%)',
    'Percentage',
    'Share of executive data sources reachable on last refresh',
  ],
  [
    'failed-transactions',
    'Failed Transactions',
    'Count',
    'Payment transactions with failed status (MTD)',
  ],
  [
    'compliance-flags',
    'Compliance Flags',
    'Count',
    'Flagged audit logs and open compliance-related issues',
  ],
  [
    'open-support-tickets',
    'Open Support Tickets',
    'Count',
    'Support tickets in Open, In Progress, or On Hold',
  ],
]

export const EXECUTIVE_OVERVIEW_METRICS_CATALOG = catalogFromMetricRows(
  EXECUTIVE_KPI_DEFS,
) as ExecutiveOverviewMetricCatalogItem[]

const derived = deriveMetricExports(EXECUTIVE_OVERVIEW_METRICS_CATALOG)
export const EXECUTIVE_OVERVIEW_METRIC_IDS = derived.ids
export const EXECUTIVE_OVERVIEW_METRIC_ID_SET = derived.idSet
export const DEFAULT_EXECUTIVE_METRIC_IDS = derived.defaultIds
