import { SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const CategoryManagementMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY}
    moduleName="Category Management"
    returnTo="/categories/management"
    section="table"
    includeDashboard={false}
    maxActiveMetrics={4}
  />
)
