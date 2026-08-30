import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP,
  SUPPORT_DASHBOARD_METRICS_CATALOG,
  SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_MODULE_KEY,
} from '@/modules/support-management/config/support-dashboard-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: SUPPORT_DASHBOARD_MODULE_KEY,
  catalog: SUPPORT_DASHBOARD_METRICS_CATALOG,
  catalogIds: SUPPORT_DASHBOARD_METRIC_IDS,
  defaultIds: DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS,
  legacyIdMap: SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP,
})

export const fetchSupportDashboardMetricPreferences = prefs.fetch
export const saveSupportDashboardMetricPreferences = prefs.save
export const resetSupportDashboardMetricPreferences = prefs.reset
