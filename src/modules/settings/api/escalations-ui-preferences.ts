import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_ESCALATIONS_METRIC_IDS,
  ESCALATIONS_METRICS_CATALOG,
  ESCALATIONS_METRIC_IDS,
  ESCALATIONS_MODULE_KEY,
} from '@/modules/settings/config/escalations-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: ESCALATIONS_MODULE_KEY,
  catalog: ESCALATIONS_METRICS_CATALOG,
  catalogIds: ESCALATIONS_METRIC_IDS,
  defaultIds: DEFAULT_ESCALATIONS_METRIC_IDS,
})

export const fetchEscalationsDashboardMetricPreferences = prefs.fetch
export const saveEscalationsDashboardMetricPreferences = prefs.save
export const resetEscalationsDashboardMetricPreferences = prefs.reset
