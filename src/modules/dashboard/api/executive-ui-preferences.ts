import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_EXECUTIVE_METRIC_IDS,
  EXECUTIVE_OVERVIEW_METRICS_CATALOG,
  EXECUTIVE_OVERVIEW_METRIC_IDS,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: EXECUTIVE_OVERVIEW_MODULE_KEY,
  catalog: EXECUTIVE_OVERVIEW_METRICS_CATALOG,
  catalogIds: EXECUTIVE_OVERVIEW_METRIC_IDS,
  defaultIds: DEFAULT_EXECUTIVE_METRIC_IDS,
})

export const fetchExecutiveDashboardMetricPreferences = prefs.fetch
export const saveExecutiveDashboardMetricPreferences = prefs.save
export const resetExecutiveDashboardMetricPreferences = prefs.reset
