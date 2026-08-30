import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_METRICS_CATALOG,
  FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_MODULE_KEY,
} from '@/modules/payments/config/finance-refunds-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: FINANCE_REFUNDS_MODULE_KEY,
  catalog: FINANCE_REFUNDS_METRICS_CATALOG,
  catalogIds: FINANCE_REFUNDS_METRIC_IDS,
  defaultIds: DEFAULT_FINANCE_REFUNDS_METRIC_IDS,
})

export const fetchFinanceRefundsDashboardMetricPreferences = prefs.fetch
export const saveFinanceRefundsDashboardMetricPreferences = prefs.save
export const resetFinanceRefundsDashboardMetricPreferences = prefs.reset
