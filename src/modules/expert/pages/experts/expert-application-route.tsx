import { useSearchParams } from 'react-router-dom'

import { ExpertApplicationViewPage } from './application-view-page'
import { VenueKycApplicationViewPage } from './venue-kyc-application-view-page'

export function ExpertApplicationRoute() {
  const [searchParams] = useSearchParams()

  if (searchParams.get('source') === 'venue_kyc') {
    return <VenueKycApplicationViewPage />
  }

  return <ExpertApplicationViewPage />
}
