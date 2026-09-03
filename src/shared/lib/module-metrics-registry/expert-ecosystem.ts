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
import { mapColumnsCatalog, mapMetricsCatalog, type ModuleMetricsDefinition } from './types'

type MetricCatalog = Parameters<typeof mapMetricsCatalog>[0]
type ColumnCatalog = Parameters<typeof mapColumnsCatalog>[0]

/** Expert analytics / performance / category / clientele surfaces. */
function analyticsSurface(
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

/** Expert management / queue / leaderboard list surfaces. */
function listSurface(
  moduleKey: string,
  moduleName: string,
  returnTo: string,
  columns: ColumnCatalog,
  metrics?: MetricCatalog,
  maxActiveMetrics?: number,
): ModuleMetricsDefinition {
  return {
    moduleKey,
    moduleName,
    returnTo,
    columns: mapColumnsCatalog(columns),
    ...(metrics ? { metrics: mapMetricsCatalog(metrics) } : {}),
    ...(maxActiveMetrics !== undefined ? { maxActiveMetrics } : {}),
  }
}

export const EXPERT_ECOSYSTEM_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  // --- analytics / performance ---
  'expert-profile-analytics': analyticsSurface(
    EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
    'Expert Profile Analytics',
    '/experts/management',
    EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
    EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG,
  ),
  'expert-clientele': analyticsSurface(
    EXPERT_CLIENTELE_MODULE_KEY,
    'Expert Clientele',
    '/experts/management',
    EXPERT_CLIENTELE_MAX_ACTIVE_METRICS,
    EXPERT_CLIENTELE_METRICS_CATALOG,
    EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG,
  ),
  'service-category-management': analyticsSurface(
    SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY,
    'Service Category Management',
    '/categories/management',
    SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
    SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG,
    SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  ),
  'venue-category-management': analyticsSurface(
    VENUE_CATEGORY_MANAGEMENT_MODULE_KEY,
    'Venue Category Management',
    '/venues/categories/management',
    VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
    VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG,
    VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  ),
  'venue-profile-analytics': analyticsSurface(
    VENUE_PROFILE_ANALYTICS_MODULE_KEY,
    'Venue Profile Analytics',
    '/venues/management',
    VENUE_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
    VENUE_PROFILE_ANALYTICS_METRICS_CATALOG,
  ),
  'venue-view-analytics': analyticsSurface(
    VENUE_VIEW_ANALYTICS_MODULE_KEY,
    'Venue View Analytics',
    '/venues/management',
    VENUE_VIEW_ANALYTICS_MAX_ACTIVE_METRICS,
    VENUE_VIEW_ANALYTICS_METRICS_CATALOG,
  ),
  'service-performance': analyticsSurface(
    SERVICE_PERFORMANCE_MODULE_KEY,
    'Service Performance',
    '/experts/management',
    SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
    SERVICE_PERFORMANCE_METRICS_CATALOG,
    SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG,
  ),
  'consultation-performance': analyticsSurface(
    CONSULTATION_PERFORMANCE_MODULE_KEY,
    'Consultation Performance',
    '/experts/management',
    CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS,
    CONSULTATION_PERFORMANCE_METRICS_CATALOG,
    CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG,
  ),
  'service-dashboard': analyticsSurface(
    'service-dashboard',
    'Service Marketplace',
    '/services/dashboard',
    100,
    [],
  ),
  'venue-management': analyticsSurface(
    VENUE_MANAGEMENT_MODULE_KEY,
    'Venue Management',
    '/venues/management',
    VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG.length,
    VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG,
    VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  ),
  'venue-dashboard': analyticsSurface(
    VENUE_DASHBOARD_MODULE_KEY,
    'Venue Dashboard',
    '/venues/dashboard',
    VENUE_DASHBOARD_METRICS_CATALOG.length,
    VENUE_DASHBOARD_METRICS_CATALOG,
  ),

  // --- management / queues / leaderboards ---
  'expert-leaderboard': listSurface(
    EXPERT_LEADERBOARD_MODULE_KEY,
    'Expert Leaderboard',
    '/experts/leaderboard',
    EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG,
  ),
  'expert-management': listSurface(
    EXPERT_MANAGEMENT_MODULE_KEY,
    'Expert Management',
    '/experts/management',
    EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  ),
  'expert-pending-approvals': listSurface(
    EXPERT_PENDING_APPROVALS_MODULE_KEY,
    'Pending Approvals',
    '/experts/pending-approvals',
    EXPERT_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  ),
  'expert-reported': listSurface(
    EXPERT_REPORTED_MODULE_KEY,
    'Reported Experts',
    '/experts/reported',
    EXPERT_REPORTED_TABLE_COLUMNS_CATALOG,
  ),
  'expert-suspended': listSurface(
    EXPERT_SUSPENDED_MODULE_KEY,
    'Suspended Experts',
    '/experts/suspended',
    EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG,
  ),
  'expert-deleted': listSurface(
    EXPERT_DELETED_MODULE_KEY,
    'Deleted Experts',
    '/experts/deleted',
    EXPERT_DELETED_TABLE_COLUMNS_CATALOG,
  ),
  'service-management': listSurface(
    SERVICE_MANAGEMENT_MODULE_KEY,
    'Service Management',
    '/services/management',
    SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  ),
  'service-pending-approvals': listSurface(
    SERVICE_PENDING_APPROVALS_MODULE_KEY,
    'Pending Approvals',
    '/services/management/pending',
    SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  ),
  'service-reported': listSurface(
    SERVICE_REPORTED_MODULE_KEY,
    'Reported Services',
    '/services/management/reported',
    SERVICE_REPORTED_TABLE_COLUMNS_CATALOG,
  ),
  'service-suspended': listSurface(
    SERVICE_SUSPENDED_MODULE_KEY,
    'Suspended Services',
    '/services/management/suspended',
    SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG,
  ),
  'service-deleted': listSurface(
    SERVICE_DELETED_MODULE_KEY,
    'Deleted Services',
    '/services/management/deleted',
    SERVICE_DELETED_TABLE_COLUMNS_CATALOG,
  ),
  'venue-leaderboard': listSurface(
    VENUE_LEADERBOARD_MODULE_KEY,
    'Venue Leaderboard',
    '/venues/leaderboard',
    VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG,
  ),
  'venue-pending-approvals': listSurface(
    VENUE_PENDING_APPROVALS_MODULE_KEY,
    'Venue Pending Approvals',
    '/venues/management/pending',
    VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  ),
  'venue-reported': listSurface(
    VENUE_REPORTED_MODULE_KEY,
    'Reported Venues',
    '/venues/management/reported',
    VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
  ),
  'venue-suspended': listSurface(
    VENUE_SUSPENDED_MODULE_KEY,
    'Suspended Venues',
    '/venues/management/suspended',
    VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG,
  ),
  'venue-deleted': listSurface(
    VENUE_DELETED_MODULE_KEY,
    'Deleted Venues',
    '/venues/management/deleted',
    VENUE_DELETED_TABLE_COLUMNS_CATALOG,
  ),
}
