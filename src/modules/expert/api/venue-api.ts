import { venueApiClient, adminApiClient } from '@/shared/lib/axios'
import type {
  VenueResponse,
  VenueDetailResponse,
  VenueDraftResponse,
  VenueProfileResponse,
  VenueCategoryResponse,
  VenueStatus,
} from '../type/venue.ts'
import type {
  VenueOnboardingBasicProfileResponse,
  VenueOnboardingLocationResponse,
  VenueOnboardingKycResponse,
  VenueOnboardingReviewResponse,
  VenueOnboardingCreateAccountResponse,
} from '../type/venue-onboarding.ts'
import type { VenueFullViewResponse } from '../type/venue-full-view.ts'
import type { VenueFormData } from '../utils/venue-form.ts'
import { mapCancellationPolicyToHours, mapSpaceTypeToApi } from '../utils/venue-form.ts'

export const fetchVenues = async (params?: {
  page?: number
  limit?: number
  status?: VenueStatus | 'reported'
  search?: string
}) => {
  const response = await venueApiClient.get<VenueResponse>('/venues/internal/admin/venues', {
    params,
  })
  return response.data
}

export type SuspendVenuePayload = {
  selectedReasons: string[]
  startDate?: string
  endDate?: string
  suspendIndefinitely: boolean
  reasonDetails: string
  adminNotes: string
}

export const suspendVenue = async (venueId: string, payload: SuspendVenuePayload) => {
  const response = await venueApiClient.patch(`/venues/admin/suspend/${venueId}`, payload)
  return response.data
}

export type DeleteVenuePayload = {
  selectedReasons: string[]
  reasonDetails?: string
  adminNotes: string
}

export const deleteVenue = async (venueId: string, payload: DeleteVenuePayload) => {
  const response = await venueApiClient.patch(`/venues/admin/delete/${venueId}`, payload)
  return response.data
}

export type SetVenueOwnerPasswordPayload = {
  newPassword: string
  confirmNewPassword: string
}

export const setVenueOwnerPassword = async (
  partnerId: string,
  payload: SetVenueOwnerPasswordPayload,
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${partnerId}/password`,
    payload,
  )
  return response.data
}

export const restoreVenue = async (venueId: string) => {
  const response = await venueApiClient.patch(`/venues/admin/restore/${venueId}`)
  return response.data
}

export const activateVenue = async (venueId: string) => {
  const response = await venueApiClient.patch(`/venues/admin/activate/${venueId}`)
  return response.data
}

export const fetchVenueById = async (id: string) => {
  const response = await venueApiClient.get<VenueDetailResponse>(`/venues/${id}`)
  return response.data
}

export const fetchVenueFullView = async (venueId: string, spaceId?: string) => {
  const response = await venueApiClient.get<VenueFullViewResponse>(
    `/venues/admin/${venueId}/full-view`,
    {
      params: spaceId ? { spaceId } : undefined,
    },
  )
  return response.data
}

export type UpdateVenueSpaceStatusPayload =
  | {
      status: 'approved'
      adminNote?: string
    }
  | {
      status: 'rejected'
      reasonFor: string[]
      rejectionReason: string
      adminNote?: string
    }

export const updateVenueSpaceStatus = async (
  spaceId: string,
  payload: UpdateVenueSpaceStatusPayload,
) => {
  const response = await venueApiClient.patch(`/venues/space/admin/status/${spaceId}`, payload)
  return response.data
}

export type UpdateVenueSpaceVisibilityPayload = {
  action: 'hide' | 'activate' | 'suspend'
  selectedReasons?: string[]
  startDate?: string
  endDate?: string
  suspendIndefinitely?: boolean
  reasonDetails?: string
  adminNotes?: string
}

export const updateVenueSpaceVisibility = async (
  spaceId: string,
  payload: UpdateVenueSpaceVisibilityPayload,
) => {
  const response = await venueApiClient.patch(`/venues/space/admin/visibility/${spaceId}`, payload)
  return response.data
}

export const fetchVenueDraft = async () => {
  const response = await venueApiClient.get<VenueDraftResponse>('/venues/draft')
  return response.data
}

export const fetchVenueProfile = async (venueId?: string) => {
  const response = await venueApiClient.get<VenueProfileResponse>('/venues/profile', {
    params: venueId ? { venueId } : undefined,
  })
  return response.data
}

export const fetchVenueCategories = async () => {
  const response = await venueApiClient.get<VenueCategoryResponse>('/venue-categories')
  return response.data
}

export const createAdminVenue = async (payload: {
  partnerId: string
  name: string
  venueType: string
  venueCategoryId: string[]
  aboutVenue?: string
}) => {
  const response = await venueApiClient.post('/venues/admin', payload)
  return response.data
}

export const updateAdminVenueDetails = async (
  venueId: string,
  payload: { venueCategoryId?: string[]; aboutVenue?: string },
) => {
  const response = await venueApiClient.patch(`/venues/admin/details/${venueId}`, payload)
  return response.data
}

export const fetchAdminVenueDetails = async (venueId: string) => {
  const response = await venueApiClient.get(`/venues/admin/${venueId}`)
  return response.data
}

export const fetchAdminDraftVenue = async (venueId: string) => {
  const response = await venueApiClient.get(`/venues/admin/draft/${venueId}`)
  return response.data
}

export const updateAdminVenueLocation = async (
  venueId: string,
  payload: {
    location: {
      address?: string
      landmark?: string
      city?: string
      latitude?: number | null
      longitude?: number | null
      pincode?: string
      state?: string
      country?: string
    }
    parkingAvailable?: boolean
    accessibility?: boolean
  },
) => {
  const response = await venueApiClient.patch(`/venues/admin/location/${venueId}`, payload)
  return response.data
}

export const createAdminSpace = async (venueId: string, payload: Record<string, unknown>) => {
  const response = await venueApiClient.post(`/venues/admin/space/${venueId}`, payload)
  return response.data
}

export const updateAdminSpace = async (spaceId: string, payload: Record<string, unknown>) => {
  const response = await venueApiClient.patch(`/venues/admin/space/${spaceId}`, payload)
  return response.data
}

export const createAdminVenueAmenity = async (
  venueId: string,
  payload: {
    spaceId: string
    amenities: Array<{
      categoryId: string
      subCategoryIds: string[]
    }>
  },
) => {
  const response = await venueApiClient.post(`/venues/admin/amenities/${venueId}`, payload)
  return response.data
}

export const createAdminVenueGallery = async (
  venueId: string,
  spaceId: string,
  payload: FormData,
) => {
  const response = await venueApiClient.post(`/venues/admin/gallery/${venueId}`, payload, {
    params: { spaceId },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const createPricing = async (spaceId: string, payload: Record<string, unknown>) => {
  const response = await venueApiClient.post(`/venues/pricing/${spaceId}`, payload)
  return response.data
}

export const createAdminAvailability = async (
  spaceId: string,
  payload: {
    weeklyAvailability: Array<{ day: string; from: string; to: string }>
    blockedDates: Array<{ date: string; from: string; to: string }>
  },
) => {
  const response = await venueApiClient.post(`/venues/admin/availability/${spaceId}`, payload)
  return response.data
}

export const createVenueTerms = async (venueId: string, payload: Record<string, unknown>) => {
  const response = await venueApiClient.post(`/venues/venue-terms/${venueId}`, payload)
  return response.data
}

export const submitVenue = async (venueId: string) => {
  const response = await venueApiClient.post(`/venues/submit/${venueId}`)
  return response.data
}

export const submitAdminVenue = async (venueId: string) => {
  const response = await venueApiClient.post(`/venues/admin/submit/${venueId}`)

  return response.data
}

export const buildSpacePayload = (venueData: VenueFormData) => {
  const spaceType = mapSpaceTypeToApi(venueData.spaceType)

  return {
    name: venueData.spaceName,
    spaceType,

    ...(spaceType === 'auditorium'
      ? {
          capacityMode: venueData.capacityType || 'seated',

          seatingStyle: venueData.capacityType === 'seated' ? venueData.seatingType : undefined,

          areaSqFeet: venueData.areaSqFt ? Number(venueData.areaSqFt) : undefined,
        }
      : {
          guestLimit: venueData.guestCount ? Number(venueData.guestCount) : undefined,
        }),

    isSameAsVenueLocation: venueData.locationType === 'same',

    ...(venueData.locationType === 'different'
      ? {
          location: null,
        }
      : {}),

    parkingAvailable: venueData.parkingAvailable,
    accessibility: venueData.accessibility,
    inHouseCatering: venueData.inHouseCatering,
    decorationAvailable: venueData.decorationAvailable,
  }
}

export const buildPricingPayload = (venueData: VenueFormData) => ({
  serviceType: venueData.serviceType === 'per_guest' ? 'per_guest' : 'entire_space',
  setDays: venueData.setDays ? Number(venueData.setDays) : undefined,
  weekdayPrice: venueData.weekdayPrice ? Number(venueData.weekdayPrice) : undefined,
  weekendPrice: venueData.weekendPrice ? Number(venueData.weekendPrice) : undefined,
  discount: venueData.discount ? Number(venueData.discount) : undefined,
  reservationFee: venueData.reservationFee ? Number(venueData.reservationFee) : undefined,
})

export const buildAvailabilityPayload = (venueData: VenueFormData) => ({
  weeklyAvailability: (venueData.weeklyAvailability || [])
    .filter((entry) => entry.enabled && entry.from && entry.to)
    .map(({ day, from, to }) => ({ day, from, to })),
  blockedDates: (venueData.blockedDates || [])
    .filter((entry) => entry.date && entry.from && entry.to)
    .map(({ date, from, to }) => ({ date, from, to })),
})

export const buildTermsPayload = (venueData: VenueFormData) => ({
  terms: venueData.terms ? [venueData.terms] : [],
  faqs: venueData.faqs.filter((faq) => faq.question || faq.answer),
  cancellation: {
    freeCancellationHours: mapCancellationPolicyToHours(venueData.cancellationPolicy),
    refundPercentage: venueData.refundPercentage ? Number(venueData.refundPercentage) : 0,
  },
})

export const buildGalleryFormData = (venueData: VenueFormData): FormData => {
  const formData = new FormData()

  formData.append(
    'contact',
    JSON.stringify({
      contacts: venueData.contacts.filter((c) => c.name || c.phone || c.email),
    }),
  )

  if (venueData.venueCoverImage) {
    formData.append('venueCoverImages', venueData.venueCoverImage)
  }

  if (venueData.venueImage) {
    formData.append('spaceCoverImages', venueData.venueImage)
  }

  venueData.galleryImages.forEach((file) => {
    formData.append('interiorGalleryImages', file)
  })

  return formData
}

export const fetchAmenityMasters = async () => {
  const response = await venueApiClient.get('/amenities-master')
  return response.data
}

export const createVenue = async (payload: {
  venueCategoryId?: string[]
  aboutVenue?: string
  parkingAvailable?: boolean
  accessibility?: boolean
}) => {
  const response = await venueApiClient.post('/venues', payload)
  return response.data
}

export const updateVenueLocation = async (
  venueId: string,
  payload: {
    venueCategoryId?: string[]
    aboutVenue?: string
    parkingAvailable?: boolean
    accessibility?: boolean
  },
) => {
  const response = await venueApiClient.patch(`/venues/location/${venueId}`, payload)
  return response.data
}

export const createVenueAmenity = async (
  venueId: string,
  spaceId: string,
  payload: { amenities: Array<{ categoryId: string; subCategoryIds: string[] }> },
) => {
  const response = await venueApiClient.post(`/venues/amenities/${venueId}`, payload, {
    params: { spaceId },
  })
  return response.data
}

export const createVenueGallery = async (venueId: string, spaceId: string, payload: FormData) => {
  const response = await venueApiClient.post(`/venues/gallery/${venueId}`, payload, {
    params: { spaceId },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const createSpace = async (venueId: string, payload: Record<string, unknown>) => {
  const response = await venueApiClient.post(`/venues/space/${venueId}`, payload)
  return response.data
}

export const updateVenueProfile = async (
  payload: {
    location?: {
      address?: string
      landmark?: string
      city?: string
      latitude?: number
      longitude?: number
    }
    aboutVenue?: string
    parkingAvailable?: boolean
    accessibility?: boolean
  },
  venueId?: string,
) => {
  const response = await venueApiClient.patch('/venues/profile/basic', payload, {
    params: venueId ? { venueId } : undefined,
  })
  return response.data
}
export const createAmenityCategory = async (payload: { category: string }) => {
  const response = await venueApiClient.post('/amenities-master', payload)
  return response.data
}

export const addAmenitySubCategory = async (categoryId: string, payload: FormData) => {
  const response = await venueApiClient.post(
    `/amenities-master/${categoryId}/sub-category`,
    payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export const addAmenity = async (payload: FormData) => {
  const response = await venueApiClient.post('/amenities-master/add-amenity', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const saveVenueOnboardingBasicProfile = async (payload: FormData) => {
  const response = await venueApiClient.post<VenueOnboardingBasicProfileResponse>(
    '/venues/admin/onboarding/basic-profile',
    payload,
  )
  return response.data
}

export const saveVenueOnboardingLocation = async (venueId: string, payload: FormData) => {
  const response = await venueApiClient.patch<VenueOnboardingLocationResponse>(
    `/venues/admin/onboarding/${venueId}/location`,
    payload,
  )
  return response.data
}

export const saveVenueOnboardingKyc = async (venueId: string, payload: FormData) => {
  const response = await venueApiClient.patch<VenueOnboardingKycResponse>(
    `/venues/admin/onboarding/${venueId}/kyc`,
    payload,
  )
  return response.data
}

export const fetchVenueOnboardingReview = async (venueId: string) => {
  const response = await venueApiClient.get<VenueOnboardingReviewResponse>(
    `/venues/admin/onboarding/${venueId}/review`,
  )
  return response.data
}

export const createVenueOnboardingAccount = async (
  venueId: string,
  payload: { internalNotes?: string; isVerified: boolean },
) => {
  const response = await venueApiClient.post<VenueOnboardingCreateAccountResponse>(
    `/venues/admin/onboarding/${venueId}/create-account`,
    payload,
  )
  return response.data
}
