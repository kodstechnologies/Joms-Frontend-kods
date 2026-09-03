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
import type { ModuleMetricsDefinition } from './types'

export const EXPERT_ECOSYSTEM_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
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
