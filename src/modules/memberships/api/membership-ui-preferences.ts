import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRICS_CATALOG,
  MEMBERSHIP_METRIC_IDS,
  MEMBERSHIPS_MODULE_KEY,
} from '@/modules/memberships/config/membership-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: MEMBERSHIPS_MODULE_KEY,
  catalog: MEMBERSHIP_METRICS_CATALOG,
  catalogIds: MEMBERSHIP_METRIC_IDS,
  defaultIds: DEFAULT_MEMBERSHIP_METRIC_IDS,
})

export const fetchMembershipDashboardMetricPreferences = prefs.fetch
export const saveMembershipDashboardMetricPreferences = prefs.save
export const resetMembershipDashboardMetricPreferences = prefs.reset
