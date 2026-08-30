import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_RBAC_HUB_METRIC_IDS,
  RBAC_HUB_METRICS_CATALOG,
  RBAC_HUB_METRIC_IDS,
  RBAC_HUB_MODULE_KEY,
} from '@/modules/rbac/config/rbac-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: RBAC_HUB_MODULE_KEY,
  catalog: RBAC_HUB_METRICS_CATALOG,
  catalogIds: RBAC_HUB_METRIC_IDS,
  defaultIds: DEFAULT_RBAC_HUB_METRIC_IDS,
})

export const fetchRbacHubDashboardMetricPreferences = prefs.fetch
export const saveRbacHubDashboardMetricPreferences = prefs.save
export const resetRbacHubDashboardMetricPreferences = prefs.reset
