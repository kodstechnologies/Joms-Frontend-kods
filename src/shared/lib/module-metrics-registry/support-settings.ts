import {
  COMMUNICATION_MAX_ACTIVE_METRICS,
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_MODULE_KEY,
} from '@/modules/communication/config/communication-metrics.config'
import { COMMUNICATION_TABLE_COLUMNS_CATALOG } from '@/modules/communication/config/communication-table-columns.config'
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
import {
  ADMIN_LOGS_MAX_ACTIVE_METRICS,
  ADMIN_LOGS_METRICS_CATALOG,
  ADMIN_LOGS_MODULE_KEY,
} from '@/modules/settings/config/admin-logs-metrics.config'
import { mapColumnsCatalog, mapMetricsCatalog, type ModuleMetricsDefinition } from './types'

type MetricCatalog = Parameters<typeof mapMetricsCatalog>[0]
type ColumnCatalog = Parameters<typeof mapColumnsCatalog>[0]

/** Support / settings / ops surfaces that expose KPI metrics (+ optional columns). */
function supportSurface(
  moduleKey: string,
  moduleName: string,
  returnTo: string,
  maxActiveMetrics: number,
  metrics: MetricCatalog,
  columns?: ColumnCatalog,
): ModuleMetricsDefinition {
  return {
    moduleKey,
    moduleName,
    returnTo,
    maxActiveMetrics,
    metrics: mapMetricsCatalog(metrics),
    ...(columns ? { columns: mapColumnsCatalog(columns) } : {}),
  }
}

export const SUPPORT_SETTINGS_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  'support-dashboard': supportSurface(
    SUPPORT_DASHBOARD_MODULE_KEY,
    'Support Management',
    '/support/dashboard',
    SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS,
    SUPPORT_DASHBOARD_METRICS_CATALOG,
  ),
  'ticket-management': supportSurface(
    TICKET_MANAGEMENT_MODULE_KEY,
    'Ticket Management',
    '/support/tickets',
    TICKET_MANAGEMENT_MAX_ACTIVE_METRICS,
    TICKET_MANAGEMENT_METRICS_CATALOG,
    TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  ),
  'past-tickets': supportSurface(
    PAST_TICKETS_MODULE_KEY,
    'Past Tickets',
    '/support/past-tickets',
    PAST_TICKETS_MAX_ACTIVE_METRICS,
    PAST_TICKETS_METRICS_CATALOG,
    PAST_TICKETS_TABLE_COLUMNS_CATALOG,
  ),
  'platform-health': supportSurface(
    PLATFORM_HEALTH_MODULE_KEY,
    'Platform Health',
    '/settings/health',
    PLATFORM_HEALTH_MAX_ACTIVE_METRICS,
    PLATFORM_HEALTH_METRICS_CATALOG,
    PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG,
  ),
  'settings-logs': supportSurface(
    SETTINGS_LOGS_MODULE_KEY,
    'Setting Logs',
    '/settings/logs',
    SETTINGS_LOGS_MAX_ACTIVE_METRICS,
    SETTINGS_LOGS_METRICS_CATALOG,
    SETTINGS_LOGS_TABLE_COLUMNS_CATALOG,
  ),
  'incident-tracking': supportSurface(
    INCIDENT_MODULE_KEY,
    'Incident Tracking',
    '/settings/main',
    INCIDENT_MAX_ACTIVE_METRICS,
    INCIDENT_METRICS_CATALOG,
    INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG,
  ),
  communication: supportSurface(
    COMMUNICATION_MODULE_KEY,
    'Communication',
    '/communication/management',
    COMMUNICATION_MAX_ACTIVE_METRICS,
    COMMUNICATION_METRICS_CATALOG,
    COMMUNICATION_TABLE_COLUMNS_CATALOG,
  ),
  'rbac-hub': supportSurface(
    RBAC_HUB_MODULE_KEY,
    'Role Based Access',
    '/settings/access',
    RBAC_HUB_MAX_ACTIVE_METRICS,
    RBAC_HUB_METRICS_CATALOG,
    RBAC_HUB_TABLE_COLUMNS_CATALOG,
  ),
  'admin-logs': supportSurface(
    ADMIN_LOGS_MODULE_KEY,
    'Admin Logs',
    '/settings/access',
    ADMIN_LOGS_MAX_ACTIVE_METRICS,
    ADMIN_LOGS_METRICS_CATALOG,
  ),
  escalations: supportSurface(
    ESCALATIONS_MODULE_KEY,
    'All Escalation',
    '/settings/escalations',
    ESCALATIONS_MAX_ACTIVE_METRICS,
    ESCALATIONS_METRICS_CATALOG,
    ESCALATIONS_TABLE_COLUMNS_CATALOG,
  ),
}
