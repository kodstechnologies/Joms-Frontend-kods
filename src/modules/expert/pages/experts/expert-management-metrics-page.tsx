import { EXPERT_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const ExpertManagementMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={EXPERT_MANAGEMENT_MODULE_KEY}
    moduleName="Expert Management"
    returnTo="/experts/management"
    section="table"
    includeDashboard={false}
  />
)
