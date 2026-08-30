import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_METRICS_CATALOG,
  PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_MODULE_KEY,
} from '@/modules/settings/config/platform-health-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: PLATFORM_HEALTH_MODULE_KEY,
  catalog: PLATFORM_HEALTH_METRICS_CATALOG,
  catalogIds: PLATFORM_HEALTH_METRIC_IDS,
  defaultIds: DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
})

export const fetchPlatformHealthDashboardMetricPreferences = prefs.fetch
export const savePlatformHealthDashboardMetricPreferences = prefs.save
export const resetPlatformHealthDashboardMetricPreferences = prefs.reset
