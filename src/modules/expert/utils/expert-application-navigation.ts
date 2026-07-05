import type { NavigateFunction } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertApplicationView } from '../api/expert-application-api'
import { fetchVenueKycByPartnerId } from '../api/venue-kyc-api'
import { isKycSubmittedForApplication } from '../utils/expert-application-helpers'

const isVenueServiceType = (serviceType?: string | null) =>
  serviceType?.toLowerCase() === 'venue'

export const getExpertApplicationPath = (expert: {
  id: string
  serviceType?: string | null
  venueKycId?: string | null
}) => {
  if (isVenueServiceType(expert.serviceType)) {
    if (!expert.venueKycId) {
      return null
    }

    return `/experts/management/application/${expert.venueKycId}?source=venue_kyc`
  }

  return `/experts/management/application/${expert.id}`
}

export const openExpertApplicationView = async (
  expert: {
    id: string
    serviceType?: string | null
    venueKycId?: string | null
  },
  navigate: NavigateFunction,
) => {
  if (isVenueServiceType(expert.serviceType)) {
    if (expert.venueKycId) {
      navigate(`/experts/management/application/${expert.venueKycId}?source=venue_kyc`)
      return
    }

    await openExpertKycFromProfile(expert.id, expert.serviceType, navigate)
    return
  }

  navigate(`/experts/management/application/${expert.id}`)
}

export const openExpertKycFromProfile = async (
  partnerId: string,
  serviceType: string | null | undefined,
  navigate: NavigateFunction,
) => {
  if (isVenueServiceType(serviceType)) {
    try {
      const response = await fetchVenueKycByPartnerId(partnerId)
      const kycId = response?.data?._id

      if (!kycId) {
        toast.error('No venue KYC found for this partner.')
        return
      }

      navigate(`/experts/management/application/${kycId}?source=venue_kyc`)
    } catch {
      toast.error('No venue KYC found for this partner.')
    }
    return
  }

  try {
    const response = await fetchExpertApplicationView(partnerId)
    if (!isKycSubmittedForApplication(response?.data?.expert, response?.data?.kyc)) {
      toast.error('KYC is not submitted by partner')
      return
    }
    navigate(`/experts/management/application/${partnerId}`)
  } catch {
    toast.error('KYC is not submitted by partner')
  }
}
