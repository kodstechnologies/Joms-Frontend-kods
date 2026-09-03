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
import { mapColumnsCatalog, mapMetricsCatalog, type ModuleMetricsDefinition } from './types'

/** Growth-domain entries — written as explicit objects (small set; avoid stamp helpers). */
export const GROWTH_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  referrals: {
    moduleKey: 'referrals',
    moduleName: 'Referral Management',
    returnTo: '/referrals/management',
    maxActiveMetrics: REFERRALS_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(REFERRALS_DASHBOARD_METRICS_CATALOG),
    columns: mapColumnsCatalog(REFERRALS_TABLE_COLUMNS_CATALOG),
  },
  memberships: {
    moduleKey: MEMBERSHIPS_MODULE_KEY,
    moduleName: 'Membership Management',
    returnTo: '/memberships/experts',
    maxActiveMetrics: MEMBERSHIP_MAX_ACTIVE_METRICS,
    metrics: mapMetricsCatalog(MEMBERSHIP_METRICS_CATALOG),
    columns: mapColumnsCatalog(MEMBERSHIPS_TABLE_COLUMNS_CATALOG),
  },
  'executive-overview': {
    moduleKey: EXECUTIVE_OVERVIEW_MODULE_KEY,
    moduleName: 'Executive Overview',
    returnTo: '/dashboard/executive',
    maxActiveMetrics: EXECUTIVE_OVERVIEW_METRICS_CATALOG.length,
    metrics: mapMetricsCatalog(EXECUTIVE_OVERVIEW_METRICS_CATALOG),
    columns: [],
  },
}
