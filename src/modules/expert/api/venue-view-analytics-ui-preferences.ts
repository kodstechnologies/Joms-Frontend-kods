import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_METRICS_CATALOG,
  VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-view-analytics-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: VENUE_VIEW_ANALYTICS_MODULE_KEY,
  catalog: VENUE_VIEW_ANALYTICS_METRICS_CATALOG,
  catalogIds: VENUE_VIEW_ANALYTICS_METRIC_IDS,
  defaultIds: DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS,
})

export const fetchVenueViewAnalyticsDashboardMetricPreferences = prefs.fetch
export const saveVenueViewAnalyticsDashboardMetricPreferences = prefs.save
export const resetVenueViewAnalyticsDashboardMetricPreferences = prefs.reset
