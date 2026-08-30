import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_METRIC_IDS,
  COMMUNICATION_MODULE_KEY,
  DEFAULT_COMMUNICATION_METRIC_IDS,
} from '@/modules/communication/config/communication-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: COMMUNICATION_MODULE_KEY,
  catalog: COMMUNICATION_METRICS_CATALOG,
  catalogIds: COMMUNICATION_METRIC_IDS,
  defaultIds: DEFAULT_COMMUNICATION_METRIC_IDS,
})

export const fetchCommunicationDashboardMetricPreferences = prefs.fetch
export const saveCommunicationDashboardMetricPreferences = prefs.save
export const resetCommunicationDashboardMetricPreferences = prefs.reset
