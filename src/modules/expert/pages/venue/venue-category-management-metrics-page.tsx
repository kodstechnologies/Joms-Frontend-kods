import { VENUE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS } from '../../config/venue-category-management-metrics.config'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const VenueCategoryManagementMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={VENUE_CATEGORY_MANAGEMENT_MODULE_KEY}
    moduleName="Venue Category Management"
    returnTo="/venues/categories/management"
    maxActiveMetrics={VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS}
  />
)
