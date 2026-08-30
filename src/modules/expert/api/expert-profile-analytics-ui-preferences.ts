import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG,
  EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/expert-profile-analytics-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
  catalog: EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG,
  catalogIds: EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  defaultIds: DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  legacyIdMap: EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
})

export const fetchExpertProfileAnalyticsDashboardMetricPreferences = prefs.fetch
export const saveExpertProfileAnalyticsDashboardMetricPreferences = prefs.save
export const resetExpertProfileAnalyticsDashboardMetricPreferences = prefs.reset
