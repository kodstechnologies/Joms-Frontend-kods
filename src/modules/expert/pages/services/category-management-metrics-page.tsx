import { SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS } from '../../config/service-category-management-metrics.config'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const CategoryManagementMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY}
    moduleName="Category Management"
    returnTo="/categories/management"
    maxActiveMetrics={SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS}
  />
)
