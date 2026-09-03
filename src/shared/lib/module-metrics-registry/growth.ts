import {
  REFERRALS_DASHBOARD_METRICS_CATALOG,
  REFERRALS_MAX_ACTIVE_METRICS,
  REFERRALS_TABLE_COLUMNS_CATALOG,
} from '@/modules/referrals/config/referral-management-table-columns.config'
import {
  EXECUTIVE_OVERVIEW_METRICS_CATALOG,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'
import {
  MEMBERSHIP_MAX_ACTIVE_METRICS,
  MEMBERSHIP_METRICS_CATALOG,
  MEMBERSHIPS_MODULE_KEY,
  MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
} from '@/modules/memberships/config/membership-metrics.config'
import type { ModuleMetricsDefinition } from './types'

export const GROWTH_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
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
}
