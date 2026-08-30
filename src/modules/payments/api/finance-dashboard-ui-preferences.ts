import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_METRICS_CATALOG,
  FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_MODULE_KEY,
} from '@/modules/payments/config/finance-dashboard-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: FINANCE_DASHBOARD_MODULE_KEY,
  catalog: FINANCE_DASHBOARD_METRICS_CATALOG,
  catalogIds: FINANCE_DASHBOARD_METRIC_IDS,
  defaultIds: DEFAULT_FINANCE_DASHBOARD_METRIC_IDS,
})

export const fetchFinanceDashboardMetricPreferences = prefs.fetch
export const saveFinanceDashboardMetricPreferences = prefs.save
export const resetFinanceDashboardMetricPreferences = prefs.reset
