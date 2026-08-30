import { createDashboardMetricPreferenceApi } from '@/modules/expert/api/dashboard-metric-preference-handlers'
import {
  DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP,
  TICKET_MANAGEMENT_METRICS_CATALOG,
  TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_MODULE_KEY,
} from '@/modules/support-management/config/ticket-management-metrics.config'

const prefs = createDashboardMetricPreferenceApi({
  moduleKey: TICKET_MANAGEMENT_MODULE_KEY,
  catalog: TICKET_MANAGEMENT_METRICS_CATALOG,
  catalogIds: TICKET_MANAGEMENT_METRIC_IDS,
  defaultIds: DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  legacyIdMap: TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP,
})

export const fetchTicketManagementDashboardMetricPreferences = prefs.fetch
export const saveTicketManagementDashboardMetricPreferences = prefs.save
export const resetTicketManagementDashboardMetricPreferences = prefs.reset
