import { SERVICE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const ServiceMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={SERVICE_MANAGEMENT_MODULE_KEY}
    moduleName="Service Management"
    returnTo="/services/management"
    section="table"
    includeDashboard={false}
  />
)

export const ServiceDashboardMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey="service-dashboard"
    moduleName="Service Dashboard"
    returnTo="/services/dashboard"
    section="dashboard"
    includeTableColumns={false}
  />
)
