import {
  EXPERT_LEADERBOARD_MODULE_KEY,
  EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/expert-leaderboard-table-columns.config'
import {
  VENUE_LEADERBOARD_MODULE_KEY,
  VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/venue-leaderboard-table-columns.config'
import {
  EXPERT_CLIENTELE_MAX_ACTIVE_METRICS,
  EXPERT_CLIENTELE_METRICS_CATALOG,
  EXPERT_CLIENTELE_MODULE_KEY,
} from '@/modules/expert/config/expert-clientele-metrics.config'
import { EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/expert-clientele-table-columns.config'
import {
  SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG,
  SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY,
} from '@/modules/expert/config/service-category-management-metrics.config'
import { SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/service-category-management-table-columns.config'
import {
  VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
  VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG,
  VENUE_CATEGORY_MANAGEMENT_MODULE_KEY,
} from '@/modules/expert/config/venue-category-management-metrics.config'
import { VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/venue-category-management-table-columns.config'
import {
  COMMUNICATION_MAX_ACTIVE_METRICS,
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_MODULE_KEY,
} from '@/modules/communication/config/communication-metrics.config'
import {
  EXECUTIVE_OVERVIEW_METRICS_CATALOG,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'
import {
  FINANCE_REVENUE_MODULE_KEY,
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-revenue-table-columns.config'
import {
  FINANCE_SERVICES_MODULE_KEY,
  FINANCE_SERVICES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-services-table-columns.config'
import {
  FINANCE_VENUES_MODULE_KEY,
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-venues-table-columns.config'
import {
  FINANCE_TAX_MODULE_KEY,
  FINANCE_TAX_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-tax-table-columns.config'
import {
  FINANCE_RECONCILIATION_MODULE_KEY,
  FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-reconciliation-table-columns.config'
import {
  FINANCE_DASHBOARD_MAX_ACTIVE_METRICS,
  FINANCE_DASHBOARD_METRICS_CATALOG,
  FINANCE_DASHBOARD_MODULE_KEY,
} from '@/modules/payments/config/finance-dashboard-metrics.config'
import {
  FINANCE_REFUNDS_MAX_ACTIVE_METRICS,
  FINANCE_REFUNDS_METRICS_CATALOG,
  FINANCE_REFUNDS_MODULE_KEY,
} from '@/modules/payments/config/finance-refunds-metrics.config'
import { FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG } from '@/modules/payments/config/finance-refunds-table-columns.config'
import {
  MEMBERSHIP_MAX_ACTIVE_METRICS,
  MEMBERSHIP_METRICS_CATALOG,
  MEMBERSHIPS_MODULE_KEY,
} from '@/modules/memberships/config/membership-metrics.config'
import {
  RBAC_HUB_MAX_ACTIVE_METRICS,
  RBAC_HUB_METRICS_CATALOG,
  RBAC_HUB_MODULE_KEY,
} from '@/modules/rbac/config/rbac-metrics.config'
import { RBAC_HUB_TABLE_COLUMNS_CATALOG } from '@/modules/rbac/config/rbac-hub-table-columns.config'
import {
  SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS,
  SUPPORT_DASHBOARD_METRICS_CATALOG,
  SUPPORT_DASHBOARD_MODULE_KEY,
} from '@/modules/support-management/config/support-dashboard-metrics.config'
import {
  TICKET_MANAGEMENT_MAX_ACTIVE_METRICS,
  TICKET_MANAGEMENT_METRICS_CATALOG,
  TICKET_MANAGEMENT_MODULE_KEY,
} from '@/modules/support-management/config/ticket-management-metrics.config'
import {
  ESCALATIONS_MAX_ACTIVE_METRICS,
  ESCALATIONS_METRICS_CATALOG,
  ESCALATIONS_MODULE_KEY,
} from '@/modules/settings/config/escalations-metrics.config'
import { ESCALATIONS_TABLE_COLUMNS_CATALOG } from '@/modules/settings/config/escalations-table-columns.config'
import {
  PLATFORM_HEALTH_MAX_ACTIVE_METRICS,
  PLATFORM_HEALTH_METRICS_CATALOG,
  PLATFORM_HEALTH_MODULE_KEY,
} from '@/modules/settings/config/platform-health-metrics.config'
import {
  EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/expert-profile-analytics-metrics.config'
import {
  VENUE_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
  VENUE_PROFILE_ANALYTICS_METRICS_CATALOG,
  VENUE_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-profile-analytics-metrics.config'
import {
  VENUE_VIEW_ANALYTICS_MAX_ACTIVE_METRICS,
  VENUE_VIEW_ANALYTICS_METRICS_CATALOG,
  VENUE_VIEW_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-view-analytics-metrics.config'

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
    moduleKey: FINANCE_DASHBOARD_MODULE_KEY,
    moduleName: 'Finance Dashboard',
    returnTo: '/finance/dashboard',
    maxActiveMetrics: FINANCE_DASHBOARD_MAX_ACTIVE_METRICS,
    metrics: FINANCE_DASHBOARD_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'finance-venues': {
    moduleKey: FINANCE_VENUES_MODULE_KEY,
    moduleName: 'Finance Venues',
    returnTo: '/finance/venues',
    columns: FINANCE_VENUES_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-services': {
    moduleKey: FINANCE_SERVICES_MODULE_KEY,
    moduleName: 'Finance Services',
    returnTo: '/finance/services',
    columns: FINANCE_SERVICES_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-refunds': {
    moduleKey: FINANCE_REFUNDS_MODULE_KEY,
    moduleName: 'Refunds & Chargebacks',
    returnTo: '/finance/refunds',
    maxActiveMetrics: FINANCE_REFUNDS_MAX_ACTIVE_METRICS,
    metrics: FINANCE_REFUNDS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-reconciliation': {
    moduleKey: FINANCE_RECONCILIATION_MODULE_KEY,
    moduleName: 'Reconciliation',
    returnTo: '/finance/reconciliation',
    columns: FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-tax': {
    moduleKey: FINANCE_TAX_MODULE_KEY,
    moduleName: 'Tax Compliance',
    returnTo: '/finance/tax',
    columns: FINANCE_TAX_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
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
    moduleKey: FINANCE_REVENUE_MODULE_KEY,
    moduleName: 'Revenue Overview',
    returnTo: '/finance/revenue',
    columns: FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  referrals: {
    moduleKey: 'referrals',
    moduleName: 'Referral Management',
    returnTo: '/referrals/management',
    maxActiveMetrics: 12,
    metrics: [
      metric(
        'total-referrals',
        'Total Referrals Generated',
        'Count',
        'Total referral records created',
        true,
      ),
      metric(
        'user-share-rate',
        'User-to-User Share Rate',
        'Percentage',
        'Share rate for user-to-user referrals',
        true,
      ),
      metric(
        'admin-send-success',
        'Admin Send Success Rate',
        'Percentage',
        'Successful admin invite deliveries',
        true,
      ),
      metric(
        'acceptance-rate',
        'Referral Acceptance Rate',
        'Percentage',
        'Referral invitation conversion',
        true,
      ),
      metric(
        'onboarding-rate',
        'Onboarding Rate',
        'Percentage',
        'Referred users who completed onboarding',
        true,
      ),
      metric('conversion-rate', 'Conversion Rate', 'Percentage', 'Referral conversion rate', true),
      metric(
        'expiry-rate',
        'Referral Expiry Rate',
        'Percentage',
        'Referral codes expired without use',
        true,
      ),
      metric(
        'top-source',
        'Top Source Performance',
        'Text',
        'Best-performing referral source',
        true,
      ),
      metric(
        'goals-completed',
        'Total Goals Completed (10/10)',
        'Count',
        'Total referral milestones achieved',
        true,
      ),
      metric(
        'memberships-unlocked',
        'Memberships unlocked',
        'Count',
        'Memberships unlocked via referrals',
        true,
      ),
      metric(
        'avg-referrals',
        'Average referrals per user',
        'Average',
        'Average successful referrals per referring user',
        true,
      ),
      metric(
        'avg-days-to-goal',
        'Average days to reach goal',
        'Average',
        'Average time to complete referral milestone',
        true,
      ),
    ],
    columns: [
      column('referral-id', 'Referral ID', 'Text', 'Unique referral identifier'),
      column('referrer', 'Referrer', 'Text', 'Referring user or admin name'),
      column('referred-expert', 'Referred Expert', 'Text', 'Invited expert name'),
      column('source-type', 'Source Type', 'Text', 'Referral source type'),
      column('status', 'Status', 'Status', 'Current referral status'),
      column('goal-progress', 'Goal Progress', 'Text', 'Signup progress toward referral goal'),
      column('created-at', 'Created At', 'Date', 'Referral creation and expiry window'),
    ],
  },
  memberships: {
    moduleKey: MEMBERSHIPS_MODULE_KEY,
    moduleName: 'Membership Plans',
    returnTo: '/memberships/plans',
    maxActiveMetrics: MEMBERSHIP_MAX_ACTIVE_METRICS,
    metrics: MEMBERSHIP_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'support-dashboard': {
    moduleKey: SUPPORT_DASHBOARD_MODULE_KEY,
    moduleName: 'Support Management',
    returnTo: '/support/dashboard',
    maxActiveMetrics: SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS,
    metrics: SUPPORT_DASHBOARD_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'ticket-management': {
    moduleKey: TICKET_MANAGEMENT_MODULE_KEY,
    moduleName: 'Ticket Management',
    returnTo: '/support/tickets',
    maxActiveMetrics: TICKET_MANAGEMENT_MAX_ACTIVE_METRICS,
    metrics: TICKET_MANAGEMENT_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
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
    moduleKey: EXECUTIVE_OVERVIEW_MODULE_KEY,
    moduleName: 'Executive Overview',
    returnTo: '/dashboard/executive',
    maxActiveMetrics: EXECUTIVE_OVERVIEW_METRICS_CATALOG.length,
    metrics: EXECUTIVE_OVERVIEW_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'platform-health': {
    moduleKey: PLATFORM_HEALTH_MODULE_KEY,
    moduleName: 'Platform Health',
    returnTo: '/settings/health',
    maxActiveMetrics: PLATFORM_HEALTH_MAX_ACTIVE_METRICS,
    metrics: PLATFORM_HEALTH_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'incident-tracking': {
    moduleKey: 'incident-tracking',
    moduleName: 'Incident Tracking',
    returnTo: '/settings/main',
    maxActiveMetrics: 4,
    metrics: [
      metric('open-incidents', 'Open Incidents', 'Count', 'Currently open', true),
      metric('critical', 'Critical', 'Count', 'Critical severity', true),
      metric('resolved-mtd', 'Resolved (MTD)', 'Count', 'Resolved this month', true),
      metric('mttr', 'MTTR', 'Average', 'Mean time to resolve', true),
    ],
  },
  communication: {
    moduleKey: COMMUNICATION_MODULE_KEY,
    moduleName: 'Communication',
    returnTo: '/communication/management',
    maxActiveMetrics: COMMUNICATION_MAX_ACTIVE_METRICS,
    metrics: COMMUNICATION_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: [
      column('message-id', 'Message ID', 'Text', 'Unique communication id'),
      column('title', 'Title', 'Text', 'Internal communication title'),
      column('channel', 'Channel', 'Text', 'Delivery channel'),
      column('type', 'Type', 'Text', 'Communication type'),
      column('audience', 'Audience', 'Text', 'Target audience'),
      column('status', 'Status', 'Status', 'Delivery status'),
      column('created-by', 'Created By', 'Text', 'Creator name'),
      column('created-on', 'Created On', 'Date', 'Created timestamp'),
    ],
  },
  'rbac-hub': {
    moduleKey: RBAC_HUB_MODULE_KEY,
    moduleName: 'Role Based Access',
    returnTo: '/settings/access',
    maxActiveMetrics: RBAC_HUB_MAX_ACTIVE_METRICS,
    metrics: RBAC_HUB_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: RBAC_HUB_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
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
    moduleKey: ESCALATIONS_MODULE_KEY,
    moduleName: 'All Escalation',
    returnTo: '/settings/escalations',
    maxActiveMetrics: ESCALATIONS_MAX_ACTIVE_METRICS,
    metrics: ESCALATIONS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: ESCALATIONS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'expert-profile-analytics': {
    moduleKey: EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
    moduleName: 'Expert Profile Analytics',
    returnTo: '/experts/management',
    maxActiveMetrics: EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
    metrics: EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'expert-leaderboard': {
    moduleKey: EXPERT_LEADERBOARD_MODULE_KEY,
    moduleName: 'Expert Leaderboard',
    returnTo: '/experts/leaderboard',
    columns: EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-leaderboard': {
    moduleKey: VENUE_LEADERBOARD_MODULE_KEY,
    moduleName: 'Venue Leaderboard',
    returnTo: '/venues/leaderboard',
    columns: VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'expert-clientele': {
    moduleKey: EXPERT_CLIENTELE_MODULE_KEY,
    moduleName: 'Expert Clientele',
    returnTo: '/experts/management',
    maxActiveMetrics: EXPERT_CLIENTELE_MAX_ACTIVE_METRICS,
    metrics: EXPERT_CLIENTELE_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-category-management': {
    moduleKey: SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY,
    moduleName: 'Service Category Management',
    returnTo: '/categories/management',
    maxActiveMetrics: SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
    metrics: SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-category-management': {
    moduleKey: VENUE_CATEGORY_MANAGEMENT_MODULE_KEY,
    moduleName: 'Venue Category Management',
    returnTo: '/venues/categories/management',
    maxActiveMetrics: VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
    metrics: VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-profile-analytics': {
    moduleKey: VENUE_PROFILE_ANALYTICS_MODULE_KEY,
    moduleName: 'Venue Profile Analytics',
    returnTo: '/venues/management',
    maxActiveMetrics: VENUE_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
    metrics: VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'venue-view-analytics': {
    moduleKey: VENUE_VIEW_ANALYTICS_MODULE_KEY,
    moduleName: 'Venue View Analytics',
    returnTo: '/venues/management',
    maxActiveMetrics: VENUE_VIEW_ANALYTICS_MAX_ACTIVE_METRICS,
    metrics: VENUE_VIEW_ANALYTICS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'service-dashboard': {
    moduleKey: 'service-dashboard',
    moduleName: 'Service Marketplace',
    returnTo: '/services/dashboard',
    maxActiveMetrics: 100,
    metrics: [] /*
      metric('listed-services', 'Listed Services', 'Count', 'Total listed services', true),
      metric('active-services', 'Active Services', 'Count', 'Live and bookable services', true),
      metric('paused-services', 'Paused Services', 'Count', 'Temporarily unavailable services'),
      metric('archived-services', 'Archived Services', 'Count', 'No longer available services'),
      metric('deleted-services', 'Deleted Services', 'Count', 'Soft-deleted services'),
      metric(
        'most-opted-service-category',
        'Most Opted Service Category',
        'Text',
        'Category with highest completed orders',
      ),
      metric(
        'most-opted-service-sub-category',
        'Most Opted Service Sub-Category',
        'Text',
        'Sub-category with highest completed orders',
      ),
      metric(
        'total-service-orders',
        'Total Service Orders',
        'Count',
        'Total service orders placed',
        true,
      ),
      metric(
        'completed-service-orders',
        'Completed Service Orders',
        'Count',
        'Successfully completed orders',
      ),
      metric('in-progress-service-orders', 'In Progress Service Orders', 'Count', 'Active orders'),
      metric(
        'disputed-service-orders',
        'Disputed Service Orders',
        'Count',
        'Orders with active disputes',
      ),
      metric(
        'service-completion-rate',
        'Service Completion Rate',
        'Percentage',
        'Percentage of completed orders',
      ),
      metric('avg-delivery-time', 'Average Delivery Time', 'Average', 'Average delivery duration'),
      metric(
        'total-service-revenue',
        'Total Service Revenue',
        'Currency',
        'Revenue from completed service orders',
        true,
      ),
      metric(
        'avg-revenue-per-service',
        'Average Revenue per Service',
        'Currency',
        'Average revenue per completed service',
      ),
      metric('avg-order-value', 'Average Order Value (AOV)', 'Currency', 'Average order value'),
      metric('avg-service-rating', 'Average Service Rating', 'Average', 'Average customer rating'),
      metric(
        'customer-satisfaction',
        'Customer Satisfaction',
        'Percentage',
        'Positive feedback percentage',
      ),
      metric(
        'on-time-delivery',
        'On-Time Delivery %',
        'Percentage',
        'Orders delivered within promised SLA',
      ),
      metric(
        'avg-services-per-expert',
        'Average services per Expert',
        'Average',
        'Average services listed by each expert',
      ),
      metric(
        'total-refund-amount',
        'Total Refund Amount',
        'Currency',
        'Total refunds issued for services',
      ),
      metric('refund-rate', 'Refund Rate', 'Percentage', 'Percentage of refunded service orders'),
      metric(
        'listed-consultations',
        'Listed Consultations',
        'Count',
        'Total consultation listings',
      ),
      metric('active-consultations', 'Active Consultations', 'Count', 'Live consultations'),
      metric('paused-consultations', 'Paused Consultations', 'Count', 'Temporarily unavailable'),
      metric('archived-consultations', 'Archived Consultations', 'Count', 'No longer offered'),
      metric(
        'deleted-consultations',
        'Deleted Consultations',
        'Count',
        'Soft-deleted consultations',
      ),
      metric('consultation-bookings', 'Consultation Bookings', 'Count', 'Total bookings'),
      metric(
        'completed-consultations',
        'Completed Consultations',
        'Count',
        'Successfully completed bookings',
      ),
      metric(
        'scheduled-consultations',
        'Scheduled Consultations',
        'Count',
        'Upcoming confirmed consultations',
      ),
      metric('cancelled-consultations', 'Cancelled Consultations', 'Count', 'Cancelled bookings'),
      metric(
        'consultation-completion-rate',
        'Consultation Completion Rate',
        'Percentage',
        'Successful completion percentage',
      ),
      metric(
        'avg-consultation-duration',
        'Average Consultation Duration',
        'Average',
        'Average consultation length',
      ),
      metric(
        'total-consultation-revenue',
        'Total Consultation Revenue',
        'Currency',
        'Revenue from completed consultations',
      ),
      metric(
        'avg-revenue-per-consultation',
        'Average Revenue per Consultation',
        'Currency',
        'Revenue per completed consultations',
      ),
      metric(
        'avg-booking-value',
        'Average Booking Value',
        'Currency',
        'Average consultation booking value',
      ),
      metric(
        'most-opted-consultation-category',
        'Most Opted Consultation Category',
        'Text',
        'Most booked consultation category',
      ),
      metric(
        'avg-consultation-rating',
        'Average Consultation Rating',
        'Average',
        'Average consultation rating',
      ),
      metric(
        'consultation-satisfaction',
        'Consultation Satisfaction',
        'Percentage',
        'Positive consultation feedback',
      ),
    */,
  },
  'venue-dashboard': {
    moduleKey: 'venue-dashboard',
    moduleName: 'Venue Dashboard',
    returnTo: '/venues/dashboard',
    maxActiveMetrics: 100,
    metrics: [] /*
      metric('total-venues', 'Total Venues', 'Count', 'Total registered venues', true),
      metric('active-venues', 'Active Venues', 'Count', 'Live venues available for booking', true),
      metric('suspended-venues', 'Suspended Venues', 'Count', 'Suspended venues'),
      metric('reported-venues', 'Reported Venues', 'Count', 'Venues currently under review'),
      metric('deleted-venues', 'Deleted Venues', 'Count', 'Soft deleted venues'),
      metric('total-spaces', 'Total Spaces', 'Count', 'Total spaces across all venues'),
      metric('active-spaces', 'Active Spaces', 'Count', 'Active spaces'),
      metric('suspended-spaces', 'Suspended Spaces', 'Count', 'Suspended spaces'),
      metric('reported-spaces', 'Reported Spaces', 'Count', 'Reported spaces'),
      metric('deleted-spaces', 'Deleted Spaces', 'Count', 'Deleted spaces'),
      metric(
        'total-event-bookings',
        'Total Event Bookings',
        'Count',
        'Total offline event bookings',
      ),
      metric('total-meetup-bookings', 'Total Meetup Bookings', 'Count', 'Total meetup bookings'),
      metric(
        'events-per-venue',
        'Average Events per Venue',
        'Average',
        'Average completed events hosted',
        true,
      ),
      metric(
        'avg-meetups-per-venue',
        'Average Meetups per Venue',
        'Average',
        'Average completed meetups hosted',
      ),
      metric(
        'total-revenue',
        'Total Venue Revenue',
        'Currency',
        'Revenue generated from venue bookings',
        true,
      ),
      metric(
        'avg-revenue-per-venue',
        'Average Revenue per Venue',
        'Currency',
        'Average revenue generated per venue',
      ),
      metric(
        'avg-revenue-per-space',
        'Average Revenue per Space',
        'Currency',
        'Average revenue generated per space',
      ),
      metric(
        'avg-booking-value',
        'Average Booking Value',
        'Currency',
        'Average value of completed bookings',
      ),
      metric(
        'avg-utilization',
        'Space Utilization Rate',
        'Percentage',
        'Average utilization of venue spaces',
        true,
      ),
      metric(
        'space-cancellation-rate',
        'Space Cancellation Rate',
        'Percentage',
        'Percentage of cancelled bookings',
      ),
      metric('avg-rating', 'Average Venue Rating', 'Average', 'Average customer rating', true),
      metric(
        'satisfaction',
        'Venue Satisfaction Score',
        'Percentage',
        'Percentage of positive feedback',
        true,
      ),
      metric(
        'repeat-booking-rate',
        'Repeat Booking Rate',
        'Percentage',
        'Returning customer percentage',
      ),
      metric('peak-utilization-hours', 'Peak Utilization Hours', 'Text', 'Most booked time slot'),
      metric('total-refund-amount', 'Total Refund Amount', 'Currency', 'Total refunds processed'),
      metric('refund-rate', 'Refund Rate', 'Percentage', 'Percentage of refunded bookings'),
      metric(
        'cancellation-rate',
        'Host Cancellation Rate',
        'Percentage',
        'Percentage of bookings cancelled by hosts',
        true,
      ),
      metric(
        'host-initiated-cancellations',
        'Host Initiated Cancellations',
        'Count',
        'Total bookings cancelled by hosts',
      ),
    */,
  },
}

export const getModuleMetricsDefinition = (moduleKey: string) => MODULE_METRICS_REGISTRY[moduleKey]
