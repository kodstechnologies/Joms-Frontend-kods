import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  VENUE_PROFILE_ANALYTICS_METRICS_CATALOG,
  VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-profile-analytics-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: VENUE_PROFILE_ANALYTICS_MODULE_KEY,
  catalog: VENUE_PROFILE_ANALYTICS_METRICS_CATALOG,
  catalogIds: VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  defaultIds: DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  legacyIdMap: VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
})

export const fetchVenueProfileAnalyticsDashboardMetricPreferences = prefs.fetch
export const saveVenueProfileAnalyticsDashboardMetricPreferences = prefs.save
export const resetVenueProfileAnalyticsDashboardMetricPreferences = prefs.reset
