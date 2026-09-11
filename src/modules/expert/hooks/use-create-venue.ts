import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  buildAvailabilityPayload,
  buildGalleryFormData,
  buildPricingPayload,
  buildSpacePayload,
  buildTermsPayload,
  createAdminVenue,
  updateAdminVenueDetails,
  updateAdminVenueLocation,
  createAdminSpace,
  updateAdminSpace,
  createAdminVenueAmenity,
  createAdminVenueGallery,
  createAdminAvailability,
  createPricing,
  createVenueTerms,
  submitAdminVenue,
} from '../api/venue-api'
import type { VenueFormData } from '../utils/venue-form'

export const useCreateVenue = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-draft'] })
      queryClient.invalidateQueries({ queryKey: ['venue-profile'] })
    },
  })
}

export const useVenueStepMutations = () => {
  const queryClient = useQueryClient()

  const invalidateDraft = () => {
    queryClient.invalidateQueries({ queryKey: ['venue-draft'] })
    queryClient.invalidateQueries({ queryKey: ['venue-profile'] })
  }

  const saveVenueDetails = useMutation({
    mutationFn: ({
      venueId,
      venueData,
    }: {
      venueId: string
      venueData: Pick<VenueFormData, 'venueName' | 'venueType' | 'venueCategory' | 'aboutVenue'>
    }) =>
      updateAdminVenueDetails(venueId, {
        name: venueData.venueName,
        venueType: venueData.venueType,
        venueCategoryId: venueData.venueCategory ? [venueData.venueCategory] : undefined,
        aboutVenue: venueData.aboutVenue,
      }),
    onSuccess: invalidateDraft,
  })

  const saveLocation = useMutation({
    mutationFn: ({ venueId, venueData }: { venueId: string; venueData: Partial<VenueFormData> }) =>
      updateAdminVenueLocation(venueId, {
        location: {
          address: venueData.address,
          landmark: venueData.landmark,
          city: venueData.city,
          latitude: venueData.latitude,
          longitude: venueData.longitude,
          pincode: venueData.pincode,
          state: venueData.state,
          country: venueData.country,
        },
        parkingAvailable: venueData.parkingAvailable,
        accessibility: venueData.accessibility,
      }),
    onSuccess: invalidateDraft,
  })

  const saveSpace = useMutation({
    mutationFn: ({
      venueId,
      spaceId,
      venueData,
    }: {
      venueId: string
      spaceId?: string | null
      venueData: VenueFormData
    }) => {
      const payload = buildSpacePayload(venueData)
      if (spaceId) {
        return updateAdminSpace(spaceId, payload)
      }
      return createAdminSpace(venueId, payload)
    },
    onSuccess: invalidateDraft,
  })

  const saveAmenitiesAndMedia = useMutation({
    mutationFn: async ({
      venueId,
      spaceId,
      venueData,
    }: {
      venueId: string
      spaceId: string
      venueData: VenueFormData
    }) => {
      // Group amenities by categoryId for backend [{categoryId, subCategoryIds}]
      const groupedAmenities = Object.values(
        venueData.amenities.reduce(
          (
            acc: Record<
              string,
              {
                categoryId: string
                subCategoryIds: string[]
              }
            >,
            amenity,
          ) => {
            if (!acc[amenity.categoryId]) {
              acc[amenity.categoryId] = {
                categoryId: amenity.categoryId,
                subCategoryIds: [],
              }
            }

            acc[amenity.categoryId].subCategoryIds.push(amenity.subCategoryId)

            return acc
          },
          {},
        ),
      )

      await createAdminVenueAmenity(venueId, {
        spaceId,
        amenities: groupedAmenities,
      })
      return createAdminVenueGallery(venueId, spaceId, buildGalleryFormData(venueData))
    },
    onSuccess: invalidateDraft,
  })

  const savePricing = useMutation({
    mutationFn: async ({ spaceId, venueData }: { spaceId: string; venueData: VenueFormData }) => {
      await createPricing(spaceId, buildPricingPayload(venueData))

      const availabilityPayload = buildAvailabilityPayload(venueData)
      if (
        availabilityPayload.weeklyAvailability.length > 0 ||
        availabilityPayload.blockedDates.length > 0
      ) {
        await createAdminAvailability(spaceId, availabilityPayload)
      }
    },
    onSuccess: invalidateDraft,
  })

  const saveTerms = useMutation({
    mutationFn: ({ venueId, venueData }: { venueId: string; venueData: VenueFormData }) =>
      createVenueTerms(venueId, buildTermsPayload(venueData)),
    onSuccess: invalidateDraft,
  })

  const submitVenueListing = useMutation({
    mutationFn: (venueId: string) => submitAdminVenue(venueId),
    onSuccess: invalidateDraft,
  })

  return {
    saveVenueDetails,
    saveLocation,
    saveSpace,
    saveAmenitiesAndMedia,
    savePricing,
    saveTerms,
    submitVenueListing,
  }
}
