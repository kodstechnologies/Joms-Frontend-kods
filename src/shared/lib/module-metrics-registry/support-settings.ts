import {
  COMMUNICATION_MAX_ACTIVE_METRICS,
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_MODULE_KEY,
} from '@/modules/communication/config/communication-metrics.config'
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
  SETTINGS_LOGS_MAX_ACTIVE_METRICS,
  SETTINGS_LOGS_METRICS_CATALOG,
  SETTINGS_LOGS_MODULE_KEY,
} from '@/modules/settings/config/settings-logs-metrics.config'
import { SETTINGS_LOGS_TABLE_COLUMNS_CATALOG } from '@/modules/settings/config/settings-logs-table-columns.config'
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
import { column, metric, type ModuleMetricsDefinition } from './types'

export const SUPPORT_SETTINGS_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
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
  'settings-logs': {
    moduleKey: SETTINGS_LOGS_MODULE_KEY,
    moduleName: 'Setting Logs',
    returnTo: '/settings/logs',
    maxActiveMetrics: SETTINGS_LOGS_MAX_ACTIVE_METRICS,
    metrics: SETTINGS_LOGS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: SETTINGS_LOGS_TABLE_COLUMNS_CATALOG.map((item) => ({
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
}
