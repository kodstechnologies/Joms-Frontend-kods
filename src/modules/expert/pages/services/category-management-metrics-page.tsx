import { SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS } from '../../config/service-category-management-metrics.config'
import { useCategoryManagementScope } from '../../components/category/category-management-scope'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const CategoryManagementMetricsPage = () => {
  const scope = useCategoryManagementScope()
  return (
    <ModuleMetricsPage
      moduleKey={scope.moduleKey}
      moduleName="Category Management"
      returnTo={scope.basePath}
      maxActiveMetrics={SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS}
    />
  )
}
