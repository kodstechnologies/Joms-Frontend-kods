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

  // Step 1 — save venue details (category + aboutVenue)
  const saveVenueDetails = useMutation({
    mutationFn: ({
      venueId,
      venueData,
    }: {
      venueId: string
      venueData: Pick<VenueFormData, 'venueCategory' | 'aboutVenue'>
    }) =>
      updateAdminVenueDetails(venueId, {
        venueCategoryId: venueData.venueCategory ? [venueData.venueCategory] : undefined,
        aboutVenue: venueData.aboutVenue,
      }),
    onSuccess: invalidateDraft,
  })

  // Step 2 — save location
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

  // Step 3 — create or update space
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
        const updatePayload = { ...payload }
        delete updatePayload.location
        return updateAdminSpace(spaceId, updatePayload)
      }
      return createAdminSpace(venueId, payload)
    },
    onSuccess: invalidateDraft,
  })

  // Step 4 — save amenities then gallery
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
      // Build amenities payload grouped by categoryId
      // venueData.amenities holds subCategoryIds selected by user
      // For now send as flat structure; backend expects [{categoryId, subCategoryIds}]
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

  // Step 5 — save pricing then availability
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

  // Step 6 — save terms
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
