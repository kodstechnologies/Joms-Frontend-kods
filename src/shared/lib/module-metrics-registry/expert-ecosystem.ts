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
import {
  SERVICE_DASHBOARD_MAX_ACTIVE_METRICS,
  SERVICE_DASHBOARD_METRICS_CATALOG,
  SERVICE_DASHBOARD_MODULE_KEY,
} from '@/modules/expert/config/service-dashboard-metrics.config'
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

/** Expert-ecosystem entries — written as explicit objects (avoid stamp helpers). */
export const EXPERT_ECOSYSTEM_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  // --- analytics / performance ---
  'expert-profile-analytics': {
    moduleKey: EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
    moduleName: 'Expert Profile Analytics',
    returnTo: '/experts/management',
    maxActiveMetrics: EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG),
  },
  'expert-clientele': {
    moduleKey: EXPERT_CLIENTELE_MODULE_KEY,
    moduleName: 'Expert Clientele',
    returnTo: '/experts/management',
    maxActiveMetrics: EXPERT_CLIENTELE_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(EXPERT_CLIENTELE_METRICS_CATALOG),
    columns: mapColumnsCatalog(EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG),
  },
  'service-category-management': {
    moduleKey: SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY,
    moduleName: 'Service Category Management',
    returnTo: '/categories/management',
    maxActiveMetrics: SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG),
    columns: mapColumnsCatalog(SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG),
  },
  'venue-category-management': {
    moduleKey: VENUE_CATEGORY_MANAGEMENT_MODULE_KEY,
    moduleName: 'Venue Category Management',
    returnTo: '/venues/categories/management',
    maxActiveMetrics: VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG),
    columns: mapColumnsCatalog(VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG),
  },
  'venue-profile-analytics': {
    moduleKey: VENUE_PROFILE_ANALYTICS_MODULE_KEY,
    moduleName: 'Venue Profile Analytics',
    returnTo: '/venues/management',
    maxActiveMetrics: VENUE_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(VENUE_PROFILE_ANALYTICS_METRICS_CATALOG),
  },
  'venue-view-analytics': {
    moduleKey: VENUE_VIEW_ANALYTICS_MODULE_KEY,
    moduleName: 'Venue View Analytics',
    returnTo: '/venues/management',
    maxActiveMetrics: VENUE_VIEW_ANALYTICS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(VENUE_VIEW_ANALYTICS_METRICS_CATALOG),
  },
  'service-performance': {
    moduleKey: SERVICE_PERFORMANCE_MODULE_KEY,
    moduleName: 'Service Performance',
    returnTo: '/experts/management',
    maxActiveMetrics: SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(SERVICE_PERFORMANCE_METRICS_CATALOG),
    columns: mapColumnsCatalog(SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG),
  },
  'consultation-performance': {
    moduleKey: CONSULTATION_PERFORMANCE_MODULE_KEY,
    moduleName: 'Consultation Performance',
    returnTo: '/experts/management',
    maxActiveMetrics: CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(CONSULTATION_PERFORMANCE_METRICS_CATALOG),
    columns: mapColumnsCatalog(CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG),
  },
  'service-dashboard': {
    moduleKey: SERVICE_DASHBOARD_MODULE_KEY,
    moduleName: 'Service Marketplace',
    returnTo: '/services/dashboard',
    maxActiveMetrics: SERVICE_DASHBOARD_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(SERVICE_DASHBOARD_METRICS_CATALOG),
  },
  'venue-management': {
    moduleKey: VENUE_MANAGEMENT_MODULE_KEY,
    moduleName: 'Venue Management',
    returnTo: '/venues/management',
    maxActiveMetrics: VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG.length,
    metrics: mapMetricsCatalog(VENUE_MANAGEMENT_DASHBOARD_METRICS_CATALOG),
    columns: mapColumnsCatalog(VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG),
  },
  'venue-dashboard': {
    moduleKey: VENUE_DASHBOARD_MODULE_KEY,
    moduleName: 'Venue Dashboard',
    returnTo: '/venues/dashboard',
    maxActiveMetrics: VENUE_DASHBOARD_METRICS_CATALOG.length,
    metrics: mapMetricsCatalog(VENUE_DASHBOARD_METRICS_CATALOG),
  },

  // --- management / queues / leaderboards ---
  'expert-leaderboard': {
    moduleKey: EXPERT_LEADERBOARD_MODULE_KEY,
    moduleName: 'Expert Leaderboard',
    returnTo: '/experts/leaderboard',
    columns: mapColumnsCatalog(EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG),
  },
  'expert-management': {
    moduleKey: EXPERT_MANAGEMENT_MODULE_KEY,
    moduleName: 'Expert Management',
    returnTo: '/experts/management',
    columns: mapColumnsCatalog(EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG),
  },
  'expert-pending-approvals': {
    moduleKey: EXPERT_PENDING_APPROVALS_MODULE_KEY,
    moduleName: 'Pending Approvals',
    returnTo: '/experts/pending-approvals',
    columns: mapColumnsCatalog(EXPERT_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG),
  },
  'expert-reported': {
    moduleKey: EXPERT_REPORTED_MODULE_KEY,
    moduleName: 'Reported Experts',
    returnTo: '/experts/reported',
    columns: mapColumnsCatalog(EXPERT_REPORTED_TABLE_COLUMNS_CATALOG),
  },
  'expert-suspended': {
    moduleKey: EXPERT_SUSPENDED_MODULE_KEY,
    moduleName: 'Suspended Experts',
    returnTo: '/experts/suspended',
    columns: mapColumnsCatalog(EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG),
  },
  'expert-deleted': {
    moduleKey: EXPERT_DELETED_MODULE_KEY,
    moduleName: 'Deleted Experts',
    returnTo: '/experts/deleted',
    columns: mapColumnsCatalog(EXPERT_DELETED_TABLE_COLUMNS_CATALOG),
  },
  'service-management': {
    moduleKey: SERVICE_MANAGEMENT_MODULE_KEY,
    moduleName: 'Service Management',
    returnTo: '/services/management',
    columns: mapColumnsCatalog(SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG),
  },
  'service-pending-approvals': {
    moduleKey: SERVICE_PENDING_APPROVALS_MODULE_KEY,
    moduleName: 'Pending Approvals',
    returnTo: '/services/management/pending',
    columns: mapColumnsCatalog(SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG),
  },
  'service-reported': {
    moduleKey: SERVICE_REPORTED_MODULE_KEY,
    moduleName: 'Reported Services',
    returnTo: '/services/management/reported',
    columns: mapColumnsCatalog(SERVICE_REPORTED_TABLE_COLUMNS_CATALOG),
  },
  'service-suspended': {
    moduleKey: SERVICE_SUSPENDED_MODULE_KEY,
    moduleName: 'Suspended Services',
    returnTo: '/services/management/suspended',
    columns: mapColumnsCatalog(SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG),
  },
  'service-deleted': {
    moduleKey: SERVICE_DELETED_MODULE_KEY,
    moduleName: 'Deleted Services',
    returnTo: '/services/management/deleted',
    columns: mapColumnsCatalog(SERVICE_DELETED_TABLE_COLUMNS_CATALOG),
  },
  'venue-leaderboard': {
    moduleKey: VENUE_LEADERBOARD_MODULE_KEY,
    moduleName: 'Venue Leaderboard',
    returnTo: '/venues/leaderboard',
    columns: mapColumnsCatalog(VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG),
  },
  'venue-pending-approvals': {
    moduleKey: VENUE_PENDING_APPROVALS_MODULE_KEY,
    moduleName: 'Venue Pending Approvals',
    returnTo: '/venues/management/pending',
    columns: mapColumnsCatalog(VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG),
  },
  'venue-reported': {
    moduleKey: VENUE_REPORTED_MODULE_KEY,
    moduleName: 'Reported Venues',
    returnTo: '/venues/management/reported',
    columns: mapColumnsCatalog(VENUE_REPORTED_TABLE_COLUMNS_CATALOG),
  },
  'venue-suspended': {
    moduleKey: VENUE_SUSPENDED_MODULE_KEY,
    moduleName: 'Suspended Venues',
    returnTo: '/venues/management/suspended',
    columns: mapColumnsCatalog(VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG),
  },
  'venue-deleted': {
    moduleKey: VENUE_DELETED_MODULE_KEY,
    moduleName: 'Deleted Venues',
    returnTo: '/venues/management/deleted',
    columns: mapColumnsCatalog(VENUE_DELETED_TABLE_COLUMNS_CATALOG),
  },
}
