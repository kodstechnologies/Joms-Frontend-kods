import type { NavigateFunction } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertApplicationView } from '../api/expert-application-api'
import { fetchVenueFullView, fetchVenues } from '../api/venue-api'
import { fetchVenueKycByPartnerId } from '../api/venue-kyc-api'
import { getVenueApiId } from './venue-list'
import {
  isKycSubmittedForApplication,
  isSubmittedKycStatus,
} from '../utils/expert-application-helpers'

export type PartnerProfileRef = {
  id?: string | null
  partnerId?: string | null
  serviceType?: string | null
  servicetype?: string | null
  venueKycId?: string | null
  venueKycStatus?: string | null
  basicProfile?: { serviceType?: string | null } | null
}

export const isVenueServiceType = (serviceType?: string | null) =>
  String(serviceType || '')
    .trim()
    .toLowerCase() === 'venue'

export const isVenuePartner = (partner?: PartnerProfileRef | null) => {
  if (!partner) return false
  if (
    isVenueServiceType(
      partner.serviceType || partner.servicetype || partner.basicProfile?.serviceType,
    )
  ) {
    return true
  }
  return Boolean(partner.venueKycId || partner.venueKycStatus)
}

const getPartnerProfileId = (partner: PartnerProfileRef) =>
  String(partner.id || partner.partnerId || '').trim()

export const getVenueKycApplicationPath = (kycId: string) =>
  `/experts/management/application/${kycId}?source=venue_kyc`

export const getExpertApplicationPath = (expert: {
  id: string
  serviceType?: string | null
  venueKycId?: string | null
  venueKycStatus?: string | null
}) => {
  if (isVenueServiceType(expert.serviceType)) {
    if (!expert.venueKycId || !isSubmittedKycStatus(expert.venueKycStatus)) {
      return null
    }

    return getVenueKycApplicationPath(expert.venueKycId)
  }

  return `/experts/management/application/${expert.id}`
}

export const openExpertApplicationView = async (
  expert: {
    id: string
    serviceType?: string | null
    venueKycId?: string | null
    venueKycStatus?: string | null
  },
  navigate: NavigateFunction,
) => {
  if (isVenueServiceType(expert.serviceType)) {
    if (expert.venueKycId && isSubmittedKycStatus(expert.venueKycStatus)) {
      navigate(getVenueKycApplicationPath(expert.venueKycId))
      return
    }

    if (expert.venueKycId && !isSubmittedKycStatus(expert.venueKycStatus)) {
      toast.error('KYC is not submitted by partner')
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

export const resolveVenuePartnerProfilePath = async (partnerId: string): Promise<string | null> => {
  try {
    const response = await fetchVenueFullView(partnerId)
    const venueId = String(response?.data?.overview?.venue?._id || '').trim()
    if (venueId) return `/venues/management/profile/${venueId}`
  } catch {
    // Partner may only have a list record or KYC.
  }

  try {
    const list = await fetchVenues({ ownerId: partnerId, limit: 1 })
    const venue = list?.data?.[0]
    const venueId = venue ? getVenueApiId(venue) : ''
    if (venueId) return `/venues/management/profile/${venueId}`
  } catch {
    // Continue to KYC.
  }

  try {
    const response = await fetchVenueKycByPartnerId(partnerId)
    const kycId = readKycId(response)
    const kycStatus =
      response && typeof response === 'object'
        ? (response as { data?: { status?: string }; status?: string }).data?.status ||
          (response as { status?: string }).status
        : ''
    if (kycId && isSubmittedKycStatus(kycStatus)) {
      return getVenueKycApplicationPath(kycId)
    }
  } catch {
    // No venue profile available.
  }

  return null
}

export const openVenuePartnerProfile = async (partnerId: string, navigate: NavigateFunction) => {
  const path = await resolveVenuePartnerProfilePath(partnerId)
  if (path) {
    navigate(path)
    return
  }

  toast.error('Venue profile not found for this partner.')
}

export const openPartnerProfile = async (
  partner: PartnerProfileRef,
  navigate: NavigateFunction,
) => {
  const partnerId = getPartnerProfileId(partner)
  if (!partnerId) return

  if (isVenuePartner(partner)) {
    await openVenuePartnerProfile(partnerId, navigate)
    return
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
      const kycStatus = response?.data?.status

      if (!kycId || !isSubmittedKycStatus(kycStatus)) {
        toast.error('KYC is not submitted by partner')
        return
      }

      navigate(getVenueKycApplicationPath(kycId))
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
