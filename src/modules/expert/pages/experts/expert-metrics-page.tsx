import { EXPERT_DASHBOARD_MODULE_KEY } from '../../api/ui-preferences-api'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

type ExpertMetricsPageProps = {
  returnTo?: string
}

export const ExpertMetricsPage = ({ returnTo = '/experts/dashboard' }: ExpertMetricsPageProps) => (
  <ModuleMetricsPage
    moduleKey={EXPERT_DASHBOARD_MODULE_KEY}
    moduleName="Expert Dashboard"
    returnTo={returnTo}
    section="dashboard"
    includeTableColumns={false}
    maxActiveMetrics={14}
  />
)
