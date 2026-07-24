export type MetricsCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive?: boolean
  defaultVisible?: boolean
}

export type ModuleMetricsDefinition = {
  moduleKey: string
  moduleName: string
  returnTo: string
  metrics?: MetricsCatalogItem[]
  columns?: MetricsCatalogItem[]
  maxActiveMetrics?: number
}

const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultActive = false,
): MetricsCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

const column = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = true,
): MetricsCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

/** Frontend fallback catalogs for modules without (or with empty) server catalogs */
export const MODULE_METRICS_REGISTRY: Record<string, ModuleMetricsDefinition> = {
  'finance-dashboard': {
    moduleKey: 'finance-dashboard',
    moduleName: 'Finance Dashboard',
    returnTo: '/finance/dashboard',
    maxActiveMetrics: 4,
    metrics: [
      metric('total-revenue', 'Total Revenue', 'Currency', 'Platform revenue', true),
      metric('pending-payouts', 'Pending Payouts', 'Count', 'Awaiting payouts', true),
      metric('active-escrows', 'Active Escrows', 'Count', 'Open escrow holds', true),
      metric('refunds-mtd', 'Refunds (MTD)', 'Count', 'Refunds this month', true),
      metric('failed-payments', 'Failed Payments', 'Count', 'Failed payment attempts'),
      metric('tax-liability', 'Tax Liability', 'Currency', 'Estimated tax liability'),
    ],
  },
  'finance-venues': {
    moduleKey: 'finance-venues',
    moduleName: 'Finance Venues',
    returnTo: '/finance/venues',
    maxActiveMetrics: 4,
    metrics: [
      metric('venue-revenue', 'Venue Revenue', 'Currency', 'Revenue from venues', true),
      metric('venue-bookings', 'Venue Bookings', 'Count', 'Venue booking count', true),
      metric(
        'pending-settlements',
        'Pending Settlements',
        'Count',
        'Unsettled venue payments',
        true,
      ),
      metric(
        'avg-booking-value',
        'Avg. Booking Value',
        'Currency',
        'Average venue booking value',
        true,
      ),
    ],
  },
  'finance-services': {
    moduleKey: 'finance-services',
    moduleName: 'Finance Services',
    returnTo: '/finance/services',
    maxActiveMetrics: 4,
    metrics: [
      metric('service-revenue', 'Service Revenue', 'Currency', 'Revenue from services', true),
      metric('service-bookings', 'Service Bookings', 'Count', 'Service booking count', true),
      metric(
        'pending-settlements',
        'Pending Settlements',
        'Count',
        'Unsettled service payments',
        true,
      ),
      metric(
        'avg-order-value',
        'Avg. Order Value',
        'Currency',
        'Average service order value',
        true,
      ),
    ],
  },
  'finance-refunds': {
    moduleKey: 'finance-refunds',
    moduleName: 'Finance Refunds',
    returnTo: '/finance/refunds',
    maxActiveMetrics: 4,
    metrics: [
      metric('total-refunds', 'Total Refunds', 'Count', 'All refund requests', true),
      metric('pending-refunds', 'Pending Refunds', 'Count', 'Awaiting approval', true),
      metric('approved-refunds', 'Approved Refunds', 'Count', 'Approved refunds', true),
      metric('refund-amount', 'Refund Amount', 'Currency', 'Total refunded amount', true),
    ],
  },
  'finance-reconciliation': {
    moduleKey: 'finance-reconciliation',
    moduleName: 'Reconciliation',
    returnTo: '/finance/reconciliation',
    maxActiveMetrics: 4,
    metrics: [
      metric('matched', 'Matched', 'Count', 'Matched records', true),
      metric('unmatched', 'Unmatched', 'Count', 'Unmatched records', true),
      metric('discrepancies', 'Discrepancies', 'Count', 'Amount mismatches', true),
      metric('reconciled-mtd', 'Reconciled (MTD)', 'Count', 'Reconciled this month', true),
    ],
  },
  'finance-tax': {
    moduleKey: 'finance-tax',
    moduleName: 'Tax Compliance',
    returnTo: '/finance/tax',
    maxActiveMetrics: 4,
    metrics: [
      metric('tax-collected', 'Tax Collected', 'Currency', 'Collected tax amount', true),
      metric('pending-filings', 'Pending Filings', 'Count', 'Pending tax filings', true),
      metric('compliant', 'Compliant', 'Count', 'Compliant entities', true),
      metric('overdue', 'Overdue', 'Count', 'Overdue filings', true),
    ],
  },
  'finance-escrow': {
    moduleKey: 'finance-escrow',
    moduleName: 'Escrow Management',
    returnTo: '/finance/escrow',
    maxActiveMetrics: 4,
    metrics: [
      metric('active-escrows', 'Active Escrows', 'Count', 'Open escrow holds', true),
      metric('held-amount', 'Held Amount', 'Currency', 'Total held in escrow', true),
      metric('released-mtd', 'Released (MTD)', 'Currency', 'Released this month', true),
      metric('disputed', 'Disputed', 'Count', 'Disputed escrows', true),
    ],
  },
  'finance-revenue': {
    moduleKey: 'finance-revenue',
    moduleName: 'Revenue Overview',
    returnTo: '/finance/revenue',
    maxActiveMetrics: 4,
    metrics: [
      metric('gross-revenue', 'Gross Revenue', 'Currency', 'Gross platform revenue', true),
      metric('net-revenue', 'Net Revenue', 'Currency', 'Net after fees', true),
      metric('growth-rate', 'Growth Rate', 'Percentage', 'Revenue growth', true),
      metric('top-category', 'Top Category', 'Text', 'Highest revenue category', true),
    ],
  },
  referrals: {
    moduleKey: 'referrals',
    moduleName: 'Referral Management',
    returnTo: '/referrals/management',
    maxActiveMetrics: 4,
    metrics: [
      metric('total-referrals', 'Total Referrals', 'Count', 'All referrals', true),
      metric('successful', 'Successful', 'Count', 'Converted referrals', true),
      metric('pending', 'Pending', 'Count', 'Pending referrals', true),
      metric('rewards-paid', 'Rewards Paid', 'Currency', 'Total rewards paid', true),
    ],
  },
  memberships: {
    moduleKey: 'memberships',
    moduleName: 'Membership Plans',
    returnTo: '/memberships/plans',
    maxActiveMetrics: 4,
    metrics: [
      metric('active-members', 'Active Members', 'Count', 'Active memberships', true),
      metric('total-plans', 'Total Plans', 'Count', 'Available plans', true),
      metric('mrr', 'MRR', 'Currency', 'Monthly recurring revenue', true),
      metric('churn-rate', 'Churn Rate', 'Percentage', 'Membership churn', true),
    ],
  },
  'support-dashboard': {
    moduleKey: 'support-dashboard',
    moduleName: 'Support Dashboard',
    returnTo: '/support/dashboard',
    maxActiveMetrics: 4,
    metrics: [
      metric('open-tickets', 'Open Tickets', 'Count', 'Currently open tickets', true),
      metric('avg-response', 'Avg. Response', 'Average', 'Average first response time', true),
      metric('resolved-mtd', 'Resolved (MTD)', 'Count', 'Resolved this month', true),
      metric('csat', 'CSAT', 'Percentage', 'Customer satisfaction', true),
    ],
  },
  'ticket-management': {
    moduleKey: 'ticket-management',
    moduleName: 'Ticket Management',
    returnTo: '/support/tickets',
    maxActiveMetrics: 4,
    metrics: [
      metric('open', 'Open', 'Count', 'Open tickets', true),
      metric('in-progress', 'In Progress', 'Count', 'Tickets in progress', true),
      metric('escalated', 'Escalated', 'Count', 'Escalated tickets', true),
      metric('resolved', 'Resolved', 'Count', 'Resolved tickets', true),
    ],
    columns: [
      column('ticket-id', 'Ticket ID', 'Text', 'Unique ticket id'),
      column('subject', 'Subject', 'Text', 'Ticket subject'),
      column('status', 'Status', 'Status', 'Current status'),
      column('priority', 'Priority', 'Text', 'Priority level'),
      column('created-at', 'Created At', 'Date', 'Created timestamp'),
      column('assignee', 'Assignee', 'Text', 'Assigned agent', false),
    ],
  },
  'past-tickets': {
    moduleKey: 'past-tickets',
    moduleName: 'Past Tickets',
    returnTo: '/support/past-tickets',
    maxActiveMetrics: 4,
    metrics: [
      metric('closed', 'Closed', 'Count', 'Closed tickets', true),
      metric('resolved', 'Resolved', 'Count', 'Resolved tickets', true),
      metric('avg-resolution', 'Avg. Resolution', 'Average', 'Average resolution time', true),
      metric('reopened', 'Reopened', 'Count', 'Reopened tickets', true),
    ],
  },
  'executive-overview': {
    moduleKey: 'executive-overview',
    moduleName: 'Executive Overview',
    returnTo: '/dashboard/executive',
    maxActiveMetrics: 4,
    metrics: [
      metric('gmv', 'GMV', 'Currency', 'Gross merchandise value', true),
      metric('active-users', 'Active Users', 'Count', 'Active platform users', true),
      metric('orders-mtd', 'Orders (MTD)', 'Count', 'Orders this month', true),
      metric('nps', 'NPS', 'Number', 'Net promoter score', true),
    ],
  },
  'platform-health': {
    moduleKey: 'platform-health',
    moduleName: 'Platform Health',
    returnTo: '/settings/health',
    maxActiveMetrics: 4,
    metrics: [
      metric('uptime', 'Uptime', 'Percentage', 'Service uptime', true),
      metric('incidents', 'Incidents', 'Count', 'Open incidents', true),
      metric('latency', 'Latency', 'Average', 'Average API latency', true),
      metric('error-rate', 'Error Rate', 'Percentage', 'Error rate', true),
    ],
  },
  'incident-tracking': {
    moduleKey: 'incident-tracking',
    moduleName: 'Incident Tracking',
    returnTo: '/settings/health',
    maxActiveMetrics: 4,
    metrics: [
      metric('open-incidents', 'Open Incidents', 'Count', 'Currently open', true),
      metric('critical', 'Critical', 'Count', 'Critical severity', true),
      metric('resolved-mtd', 'Resolved (MTD)', 'Count', 'Resolved this month', true),
      metric('mttr', 'MTTR', 'Average', 'Mean time to resolve', true),
    ],
  },
  communication: {
    moduleKey: 'communication',
    moduleName: 'Communication',
    returnTo: '/communication/management',
    maxActiveMetrics: 4,
    metrics: [
      metric('sent', 'Sent', 'Count', 'Messages sent', true),
      metric('delivered', 'Delivered', 'Count', 'Delivered messages', true),
      metric('open-rate', 'Open Rate', 'Percentage', 'Message open rate', true),
      metric('failed', 'Failed', 'Count', 'Failed deliveries', true),
    ],
  },
  'rbac-hub': {
    moduleKey: 'rbac-hub',
    moduleName: 'RBAC Hub',
    returnTo: '/settings/access',
    maxActiveMetrics: 4,
    metrics: [
      metric('admins', 'Admins', 'Count', 'Total admins', true),
      metric('sub-admins', 'Sub-Admins', 'Count', 'Sub-admin accounts', true),
      metric('roles', 'Roles', 'Count', 'Configured roles', true),
      metric('active-sessions', 'Active Sessions', 'Count', 'Active admin sessions', true),
    ],
  },
  'admin-logs': {
    moduleKey: 'admin-logs',
    moduleName: 'Admin Logs',
    returnTo: '/settings/access',
    maxActiveMetrics: 4,
    metrics: [
      metric('events-today', 'Events Today', 'Count', 'Log events today', true),
      metric('critical', 'Critical', 'Count', 'Critical events', true),
      metric('warnings', 'Warnings', 'Count', 'Warning events', true),
      metric('unique-actors', 'Unique Actors', 'Count', 'Distinct actors', true),
    ],
  },
  escalations: {
    moduleKey: 'escalations',
    moduleName: 'Escalations',
    returnTo: '/settings/escalations',
    maxActiveMetrics: 4,
    metrics: [
      metric('open', 'Open', 'Count', 'Open escalations', true),
      metric('high-priority', 'High Priority', 'Count', 'High priority', true),
      metric('resolved-mtd', 'Resolved (MTD)', 'Count', 'Resolved this month', true),
      metric('avg-time', 'Avg. Time', 'Average', 'Average escalation time', true),
    ],
  },
}

export const getModuleMetricsDefinition = (moduleKey: string) => MODULE_METRICS_REGISTRY[moduleKey]
