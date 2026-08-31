import {
  EXPERT_LEADERBOARD_MODULE_KEY,
  EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/expert-leaderboard-table-columns.config'
import {
  EXPERT_DELETED_MODULE_KEY,
  EXPERT_DELETED_TABLE_COLUMNS_CATALOG,
  EXPERT_MANAGEMENT_MODULE_KEY,
  EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  EXPERT_PENDING_APPROVALS_MODULE_KEY,
  EXPERT_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  EXPERT_REPORTED_MODULE_KEY,
  EXPERT_REPORTED_TABLE_COLUMNS_CATALOG,
  EXPERT_SUSPENDED_MODULE_KEY,
  EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/expert-management-table-columns.config'
import {
  SERVICE_DELETED_MODULE_KEY,
  SERVICE_DELETED_TABLE_COLUMNS_CATALOG,
  SERVICE_MANAGEMENT_MODULE_KEY,
  SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  SERVICE_PENDING_APPROVALS_MODULE_KEY,
  SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  SERVICE_REPORTED_MODULE_KEY,
  SERVICE_REPORTED_TABLE_COLUMNS_CATALOG,
  SERVICE_SUSPENDED_MODULE_KEY,
  SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/service-management-table-columns.config'
import {
  REFERRALS_DASHBOARD_METRICS_CATALOG,
  REFERRALS_MAX_ACTIVE_METRICS,
  REFERRALS_TABLE_COLUMNS_CATALOG,
} from '@/modules/referrals/config/referral-management-table-columns.config'
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
  FINANCE_ESCROW_MAX_ACTIVE_METRICS,
  FINANCE_ESCROW_METRICS_CATALOG,
  FINANCE_ESCROW_MODULE_KEY,
} from '@/modules/payments/config/finance-escrow-metrics.config'
import { FINANCE_ESCROW_TABLE_COLUMNS_CATALOG } from '@/modules/payments/config/finance-escrow-table-columns.config'
import {
  FINANCE_EVENTS_MODULE_KEY,
  FINANCE_EVENTS_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-events-table-columns.config'
import {
  FINANCE_PAYOUTS_MODULE_KEY,
  FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG,
  FINANCE_PAYOUTS_MAX_ACTIVE_METRICS,
  FINANCE_PAYOUTS_METRICS_CATALOG,
} from '@/modules/payments/config/finance-payouts-table-columns.config'
import {
  FINANCE_INVOICES_MODULE_KEY,
  FINANCE_INVOICES_TABLE_COLUMNS_CATALOG,
  FINANCE_INVOICES_MAX_ACTIVE_METRICS,
  FINANCE_INVOICES_METRICS_CATALOG,
} from '@/modules/payments/config/finance-invoices-table-columns.config'
import {
  FINANCE_MEMBERSHIPS_MODULE_KEY,
  FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-memberships-table-columns.config'
import {
  MEMBERSHIP_MAX_ACTIVE_METRICS,
  MEMBERSHIP_METRICS_CATALOG,
  MEMBERSHIPS_MODULE_KEY,
  MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
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
import { TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '@/modules/support-management/config/ticket-management-table-columns.config'
import {
  PAST_TICKETS_MAX_ACTIVE_METRICS,
  PAST_TICKETS_METRICS_CATALOG,
  PAST_TICKETS_MODULE_KEY,
} from '@/modules/support-management/config/past-tickets-metrics.config'
import { PAST_TICKETS_TABLE_COLUMNS_CATALOG } from '@/modules/support-management/config/past-tickets-table-columns.config'
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
import { PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG } from '@/modules/settings/config/platform-health-table-columns.config'
import {
  INCIDENT_MAX_ACTIVE_METRICS,
  INCIDENT_METRICS_CATALOG,
  INCIDENT_MODULE_KEY,
} from '@/modules/settings/config/incident-metrics.config'
import { INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG } from '@/modules/settings/config/incident-table-columns.config'
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
import {
  SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
  SERVICE_PERFORMANCE_METRICS_CATALOG,
  SERVICE_PERFORMANCE_MODULE_KEY,
} from '@/modules/expert/config/service-performance-metrics.config'
import { SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/service-performance-table-columns.config'
import {
  CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS,
  CONSULTATION_PERFORMANCE_METRICS_CATALOG,
  CONSULTATION_PERFORMANCE_MODULE_KEY,
} from '@/modules/expert/config/consultation-performance-metrics.config'
import { CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/consultation-performance-table-columns.config'
import {
  VENUE_MANAGEMENT_MODULE_KEY,
  VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG,
  VENUE_PENDING_APPROVALS_MODULE_KEY,
  VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  VENUE_REPORTED_MODULE_KEY,
  VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
  VENUE_SUSPENDED_MODULE_KEY,
  VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG,
  VENUE_DELETED_MODULE_KEY,
  VENUE_DELETED_TABLE_COLUMNS_CATALOG,
  VENUE_DASHBOARD_MODULE_KEY,
  VENUE_DASHBOARD_METRICS_CATALOG,
} from '@/modules/expert/config/venue-management-table-columns.config'

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
    moduleKey: FINANCE_ESCROW_MODULE_KEY,
    moduleName: 'Escrow Management',
    returnTo: '/finance/escrow',
    maxActiveMetrics: FINANCE_ESCROW_MAX_ACTIVE_METRICS,
    metrics: FINANCE_ESCROW_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_ESCROW_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-events': {
    moduleKey: FINANCE_EVENTS_MODULE_KEY,
    moduleName: 'Finance Events',
    returnTo: '/finance/events',
    columns: FINANCE_EVENTS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-payouts': {
    moduleKey: FINANCE_PAYOUTS_MODULE_KEY,
    moduleName: 'Payout Management',
    returnTo: '/finance/payouts',
    maxActiveMetrics: FINANCE_PAYOUTS_MAX_ACTIVE_METRICS,
    metrics: FINANCE_PAYOUTS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-invoices': {
    moduleKey: FINANCE_INVOICES_MODULE_KEY,
    moduleName: 'Invoices & Billing',
    returnTo: '/finance/invoices',
    maxActiveMetrics: FINANCE_INVOICES_MAX_ACTIVE_METRICS,
    metrics: FINANCE_INVOICES_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_INVOICES_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-memberships': {
    moduleKey: FINANCE_MEMBERSHIPS_MODULE_KEY,
    moduleName: 'Membership Revenue',
    returnTo: '/finance/memberships',
    columns: FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
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
    maxActiveMetrics: REFERRALS_MAX_ACTIVE_METRICS,
    metrics: REFERRALS_DASHBOARD_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: REFERRALS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  memberships: {
    moduleKey: MEMBERSHIPS_MODULE_KEY,
    moduleName: 'Membership Management',
    returnTo: '/memberships/experts',
    maxActiveMetrics: MEMBERSHIP_MAX_ACTIVE_METRICS,
    metrics: MEMBERSHIP_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: MEMBERSHIPS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
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
    columns: TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'past-tickets': {
    moduleKey: PAST_TICKETS_MODULE_KEY,
    moduleName: 'Past Tickets',
    returnTo: '/support/past-tickets',
    maxActiveMetrics: PAST_TICKETS_MAX_ACTIVE_METRICS,
    metrics: PAST_TICKETS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: PAST_TICKETS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
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
    columns: [],
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
    columns: PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'incident-tracking': {
    moduleKey: INCIDENT_MODULE_KEY,
    moduleName: 'Incident Tracking',
    returnTo: '/settings/main',
    maxActiveMetrics: INCIDENT_MAX_ACTIVE_METRICS,
    metrics: INCIDENT_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
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
      column('campaign-id', 'Campaign ID', 'Text', 'Campaign identifier', false),
      column('title', 'Title', 'Text', 'Internal communication title'),
      column('channel', 'Channel', 'Text', 'Delivery channel (email, in-app, push)'),
      column('type', 'Type', 'Text', 'Communication type'),
      column('audience', 'Audience', 'Text', 'Target audience'),
      column('audience-size', 'Audience Size', 'Count', 'Number of recipients', false),
      column(
        'content-preview',
        'Content Preview',
        'Text',
        'Short preview of message content',
        false,
      ),
      column('status', 'Status', 'Status', 'Delivery status'),
      column('priority', 'Priority', 'Text', 'Message priority', false),
      column('created-by', 'Created By', 'Text', 'Creator name'),
      column('created-on', 'Created On', 'Date', 'Created timestamp'),
      column('scheduled-at', 'Scheduled At', 'Date', 'Scheduled send time', false),
      column('sent-at', 'Sent At', 'Date', 'Actual send time', false),
      column('delivered-count', 'Delivered Count', 'Count', 'Successful deliveries', false),
      column('failed-count', 'Failed Count', 'Count', 'Failed deliveries', false),
      column('open-rate', 'Open Rate', 'Percentage', 'Opened / delivered', false),
      column('click-rate', 'Click Rate', 'Percentage', 'Clicked / delivered', false),
      column('last-updated', 'Last Updated', 'Date', 'Last update timestamp', false),
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
  'expert-management': {
    moduleKey: EXPERT_MANAGEMENT_MODULE_KEY,
    moduleName: 'Expert Management',
    returnTo: '/experts/management',
    columns: EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'expert-pending-approvals': {
    moduleKey: EXPERT_PENDING_APPROVALS_MODULE_KEY,
    moduleName: 'Pending Approvals',
    returnTo: '/experts/pending-approvals',
    columns: EXPERT_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'expert-reported': {
    moduleKey: EXPERT_REPORTED_MODULE_KEY,
    moduleName: 'Reported Experts',
    returnTo: '/experts/reported',
    columns: EXPERT_REPORTED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'expert-suspended': {
    moduleKey: EXPERT_SUSPENDED_MODULE_KEY,
    moduleName: 'Suspended Experts',
    returnTo: '/experts/suspended',
    columns: EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'expert-deleted': {
    moduleKey: EXPERT_DELETED_MODULE_KEY,
    moduleName: 'Deleted Experts',
    returnTo: '/experts/deleted',
    columns: EXPERT_DELETED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-management': {
    moduleKey: SERVICE_MANAGEMENT_MODULE_KEY,
    moduleName: 'Service Management',
    returnTo: '/services/management',
    columns: SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-pending-approvals': {
    moduleKey: SERVICE_PENDING_APPROVALS_MODULE_KEY,
    moduleName: 'Pending Approvals',
    returnTo: '/services/management/pending',
    columns: SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-reported': {
    moduleKey: SERVICE_REPORTED_MODULE_KEY,
    moduleName: 'Reported Services',
    returnTo: '/services/management/reported',
    columns: SERVICE_REPORTED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-suspended': {
    moduleKey: SERVICE_SUSPENDED_MODULE_KEY,
    moduleName: 'Suspended Services',
    returnTo: '/services/management/suspended',
    columns: SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-deleted': {
    moduleKey: SERVICE_DELETED_MODULE_KEY,
    moduleName: 'Deleted Services',
    returnTo: '/services/management/deleted',
    columns: SERVICE_DELETED_TABLE_COLUMNS_CATALOG.map((item) => ({
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
  'service-performance': {
    moduleKey: SERVICE_PERFORMANCE_MODULE_KEY,
    moduleName: 'Service Performance',
    returnTo: '/experts/management',
    maxActiveMetrics: SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
    metrics: SERVICE_PERFORMANCE_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'consultation-performance': {
    moduleKey: CONSULTATION_PERFORMANCE_MODULE_KEY,
    moduleName: 'Consultation Performance',
    returnTo: '/experts/management',
    maxActiveMetrics: CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS,
    metrics: CONSULTATION_PERFORMANCE_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'service-dashboard': {
    moduleKey: 'service-dashboard',
    moduleName: 'Service Marketplace',
    returnTo: '/services/dashboard',
    maxActiveMetrics: 100,
    metrics: [],
  },
  'venue-management': {
    moduleKey: VENUE_MANAGEMENT_MODULE_KEY,
    moduleName: 'Venue Management',
    returnTo: '/venues/management',
    maxActiveMetrics: VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG.length,
    metrics: VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-pending-approvals': {
    moduleKey: VENUE_PENDING_APPROVALS_MODULE_KEY,
    moduleName: 'Venue Pending Approvals',
    returnTo: '/venues/management/pending',
    columns: VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-reported': {
    moduleKey: VENUE_REPORTED_MODULE_KEY,
    moduleName: 'Reported Venues',
    returnTo: '/venues/management/reported',
    columns: VENUE_REPORTED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-suspended': {
    moduleKey: VENUE_SUSPENDED_MODULE_KEY,
    moduleName: 'Suspended Venues',
    returnTo: '/venues/management/suspended',
    columns: VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-deleted': {
    moduleKey: VENUE_DELETED_MODULE_KEY,
    moduleName: 'Deleted Venues',
    returnTo: '/venues/management/deleted',
    columns: VENUE_DELETED_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'venue-dashboard': {
    moduleKey: VENUE_DASHBOARD_MODULE_KEY,
    moduleName: 'Venue Dashboard',
    returnTo: '/venues/dashboard',
    maxActiveMetrics: VENUE_DASHBOARD_METRICS_CATALOG.length,
    metrics: VENUE_DASHBOARD_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
}

export const getModuleMetricsDefinition = (moduleKey: string) => MODULE_METRICS_REGISTRY[moduleKey]
