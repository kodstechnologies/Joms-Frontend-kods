import { venueApiClient } from '@/shared/lib/axios'
import type {
  VenueResponse,
  VenueDetailResponse,
  VenueDraftResponse,
  VenueProfileResponse,
  VenueCategoryResponse,
} from '../type/venue.ts'
import type { VenueFormData } from '../utils/venue-form.ts'
import {
  mapCancellationPolicyToHours,
  mapSpaceTypeToApi,
} from '../utils/venue-form.ts'

export const fetchVenues = async (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  const response = await venueApiClient.get<VenueResponse>(
    '/venues/internal/admin/venues',
    { params },
  )
  return response.data
}

export const fetchVenueById = async (id: string) => {
  const response = await venueApiClient.get<VenueDetailResponse>(`/venues/${id}`)
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
  const response = await venueApiClient.patch(
    `/venues/admin/details/${venueId}`,
    payload,
  )
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
    location: { address?: string; landmark?: string; city?: string }
    parkingAvailable?: boolean
    accessibility?: boolean
  },
) => {
  const response = await venueApiClient.patch(
    `/venues/admin/location/${venueId}`,
    payload,
  )
  return response.data
}

export const createAdminSpace = async (
  venueId: string,
  payload: Record<string, unknown>,
) => {
  const response = await venueApiClient.post(
    `/venues/admin/space/${venueId}`,
    payload,
  )
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
  const response = await venueApiClient.post(
    `/venues/admin/amenities/${venueId}`,
    payload,
  )
  return response.data
}


export const createAdminVenueGallery = async (
  venueId: string,
  spaceId: string,
  payload: FormData,
) => {
  const response = await venueApiClient.post(
    `/venues/admin/gallery/${venueId}`,
    payload,
    {
      params: { spaceId },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return response.data
}



export const createPricing = async (
  spaceId: string,
  payload: Record<string, unknown>,
) => {
  const response = await venueApiClient.post(`/venues/pricing/${spaceId}`, payload)
  return response.data
}

export const createVenueTerms = async (
  venueId: string,
  payload: Record<string, unknown>,
) => {
  const response = await venueApiClient.post(`/venues/venue-terms/${venueId}`, payload)
  return response.data
}

export const submitVenue = async (venueId: string) => {
  const response = await venueApiClient.post(`/venues/submit/${venueId}`)
  return response.data
}


export const submitAdminVenue = async (
  venueId: string,
) => {
  const response =
    await venueApiClient.post(
      `/venues/admin/submit/${venueId}`,
    )

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

        seatingStyle:
          venueData.capacityType === 'seated'
            ? venueData.seatingType
            : undefined,

        areaSqFeet: venueData.areaSqFt
          ? Number(venueData.areaSqFt)
          : undefined,
      }
      : {
        guestLimit: venueData.guestCount
          ? Number(venueData.guestCount)
          : undefined,
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
      contacts: venueData.contacts.filter(
        (c) => c.name || c.phone || c.email,
      ),
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

export const createVenueGallery = async (
  venueId: string,
  spaceId: string,
  payload: FormData,
) => {
  const response = await venueApiClient.post(`/venues/gallery/${venueId}`, payload, {
    params: { spaceId },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const createSpace = async (
  venueId: string,
  payload: Record<string, unknown>,
) => {
  const response = await venueApiClient.post(`/venues/space/${venueId}`, payload)
  return response.data
}

export const updateVenueProfile = async (
  payload: {
    location?: {
      address?: string; landmark?: string; city?: string
      latitude?: number; longitude?: number
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
export const createAmenityCategory = async (payload: {
  category: string
}) => {
  const response = await venueApiClient.post(
    '/amenities-master',
    payload,
  )
  return response.data
}

export const addAmenitySubCategory = async (
  categoryId: string,
  payload: FormData,
) => {
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