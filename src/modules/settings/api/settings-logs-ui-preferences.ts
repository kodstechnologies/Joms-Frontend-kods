import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_SETTINGS_LOGS_METRIC_IDS,
  SETTINGS_LOGS_METRICS_CATALOG,
  SETTINGS_LOGS_METRIC_IDS,
  SETTINGS_LOGS_MODULE_KEY,
} from '@/modules/settings/config/settings-logs-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: SETTINGS_LOGS_MODULE_KEY,
  catalog: SETTINGS_LOGS_METRICS_CATALOG,
  catalogIds: SETTINGS_LOGS_METRIC_IDS,
  defaultIds: DEFAULT_SETTINGS_LOGS_METRIC_IDS,
})

export const fetchSettingsLogsDashboardMetricPreferences = prefs.fetch
export const saveSettingsLogsDashboardMetricPreferences = prefs.save
export const resetSettingsLogsDashboardMetricPreferences = prefs.reset
