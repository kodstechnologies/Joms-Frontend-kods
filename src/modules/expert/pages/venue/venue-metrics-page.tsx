import { VENUE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { ModuleMetricsPage } from '../shared/module-metrics-page'

export const VenueMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey={VENUE_MANAGEMENT_MODULE_KEY}
    moduleName="Venue Management"
    returnTo="/venues/management"
    section="all"
  />
)

export const VenueDashboardMetricsPage = () => (
  <ModuleMetricsPage
    moduleKey="venue-dashboard"
    moduleName="Venue Dashboard"
    returnTo="/venues/dashboard"
    section="dashboard"
    includeTableColumns={false}
  />
)
