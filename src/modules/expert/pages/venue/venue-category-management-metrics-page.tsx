import { VENUE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const VenueCategoryManagementMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={VENUE_CATEGORY_MANAGEMENT_MODULE_KEY}
    moduleName="Venue Category Management"
    returnTo="/venues/categories/management"
    section="table"
    includeDashboard={false}
    maxActiveMetrics={4}
  />
)
