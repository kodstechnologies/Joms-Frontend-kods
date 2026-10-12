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
import {
  BACKUP_HISTORY_COLUMNS_CATALOG,
  BACKUP_MAX_ACTIVE_METRICS,
  BACKUP_METRICS_CATALOG,
  BACKUP_MODULE_KEY,
} from '@/modules/settings/config/backup-metrics.config'
import { mapColumnsCatalog, mapMetricsCatalog, type ModuleMetricsDefinition } from './types'

export const SUPPORT_SETTINGS_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  'support-dashboard': {
    moduleKey: SUPPORT_DASHBOARD_MODULE_KEY,
    moduleName: 'Support Management',
    returnTo: '/support/dashboard',
    maxActiveMetrics: SUPPORT_DASHBOARD_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(SUPPORT_DASHBOARD_METRICS_CATALOG),
  },
  'ticket-management': {
    moduleKey: TICKET_MANAGEMENT_MODULE_KEY,
    moduleName: 'Ticket Management',
    returnTo: '/support/tickets',
    maxActiveMetrics: TICKET_MANAGEMENT_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(TICKET_MANAGEMENT_METRICS_CATALOG),
    columns: mapColumnsCatalog(TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG),
  },
  'past-tickets': {
    moduleKey: PAST_TICKETS_MODULE_KEY,
    moduleName: 'Past Tickets',
    returnTo: '/support/past-tickets',
    maxActiveMetrics: PAST_TICKETS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(PAST_TICKETS_METRICS_CATALOG),
    columns: mapColumnsCatalog(PAST_TICKETS_TABLE_COLUMNS_CATALOG),
  },
  'platform-health': {
    moduleKey: PLATFORM_HEALTH_MODULE_KEY,
    moduleName: 'Platform Health',
    returnTo: '/settings/health',
    maxActiveMetrics: PLATFORM_HEALTH_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(PLATFORM_HEALTH_METRICS_CATALOG),
    columns: mapColumnsCatalog(PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG),
  },
  'settings-logs': {
    moduleKey: SETTINGS_LOGS_MODULE_KEY,
    moduleName: 'Setting Logs',
    returnTo: '/settings/logs',
    maxActiveMetrics: SETTINGS_LOGS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(SETTINGS_LOGS_METRICS_CATALOG),
    columns: mapColumnsCatalog(SETTINGS_LOGS_TABLE_COLUMNS_CATALOG),
  },
  'incident-tracking': {
    moduleKey: INCIDENT_MODULE_KEY,
    moduleName: 'Incident Tracking',
    returnTo: '/settings/main',
    maxActiveMetrics: INCIDENT_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(INCIDENT_METRICS_CATALOG),
    columns: mapColumnsCatalog(INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG),
  },
  'backup-configuration': {
    moduleKey: BACKUP_MODULE_KEY,
    moduleName: 'Backup Configuration',
    returnTo: '/settings/main',
    maxActiveMetrics: BACKUP_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(BACKUP_METRICS_CATALOG),
    columns: mapColumnsCatalog(BACKUP_HISTORY_COLUMNS_CATALOG),
  },
  communication: {
    moduleKey: COMMUNICATION_MODULE_KEY,
    moduleName: 'Communication',
    returnTo: '/communication/management',
    maxActiveMetrics: COMMUNICATION_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(COMMUNICATION_METRICS_CATALOG),
    columns: mapColumnsCatalog(COMMUNICATION_TABLE_COLUMNS_CATALOG),
  },
  'rbac-hub': {
    moduleKey: RBAC_HUB_MODULE_KEY,
    moduleName: 'Role Based Access',
    returnTo: '/settings/access',
    maxActiveMetrics: RBAC_HUB_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(RBAC_HUB_METRICS_CATALOG),
    columns: mapColumnsCatalog(RBAC_HUB_TABLE_COLUMNS_CATALOG),
  },
  'admin-logs': {
    moduleKey: ADMIN_LOGS_MODULE_KEY,
    moduleName: 'Admin Logs',
    returnTo: '/settings/access',
    maxActiveMetrics: ADMIN_LOGS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(ADMIN_LOGS_METRICS_CATALOG),
  },
  escalations: {
    moduleKey: ESCALATIONS_MODULE_KEY,
    moduleName: 'All Escalation',
    returnTo: '/settings/escalations',
    maxActiveMetrics: ESCALATIONS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(ESCALATIONS_METRICS_CATALOG),
    columns: mapColumnsCatalog(ESCALATIONS_TABLE_COLUMNS_CATALOG),
  },
}
