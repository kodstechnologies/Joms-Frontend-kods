import type { NavigateFunction } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertApplicationView } from '../api/expert-application-api'
import { fetchVenueFullView, fetchVenues } from '../api/venue-api'
import { fetchVenueKycByPartnerId } from '../api/venue-kyc-api'
import { getVenueApiId } from './venue-list'
import { isKycSubmittedForApplication } from '../utils/expert-application-helpers'

const isVenueServiceType = (serviceType?: string | null) => serviceType?.toLowerCase() === 'venue'

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

const readKycId = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as { _id?: string; data?: { _id?: string } | null }
  return String(record.data?._id || record._id || '').trim()
}

export const openVenuePartnerProfile = async (partnerId: string, navigate: NavigateFunction) => {
  try {
    const response = await fetchVenueFullView(partnerId)
    const venueId = String(response?.data?.overview?.venue?._id || '').trim()
    if (venueId) {
      navigate(`/venues/management/profile/${venueId}`)
      return
    }
  } catch {
    // Partner may only have a list record, KYC, or a partner profile.
  }

  try {
    const list = await fetchVenues({ ownerId: partnerId, limit: 1 })
    const venue = list?.data?.[0]
    const venueId = venue ? getVenueApiId(venue) : ''
    if (venueId) {
      navigate(`/venues/management/profile/${venueId}`)
      return
    }
  } catch {
    // Continue to KYC / partner profile.
  }

  try {
    const response = await fetchVenueKycByPartnerId(partnerId)
    const kycId = readKycId(response)
    if (kycId) {
      navigate(`/experts/management/application/${kycId}?source=venue_kyc`)
      return
    }
  } catch {
    // Continue to partner profile.
  }

  navigate(`/experts/management/profile/${partnerId}`)
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
