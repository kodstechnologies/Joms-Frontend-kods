import { useSearchParams } from 'react-router-dom'

import { ConsultationViewPage } from './consultation-view-page'
import { ServiceViewPage } from './service-view-page'

export const ServiceManagementViewRoute = () => {
  const [searchParams] = useSearchParams()
  const serviceType = searchParams.get('type') || ''

  if (serviceType.toLowerCase().includes('consultation')) {
    return <ConsultationViewPage />
  }

  return <ServiceViewPage />
}
