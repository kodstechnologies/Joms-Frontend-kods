import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  saveVenueOnboardingBasicProfile,
  saveVenueOnboardingLocation,
  saveVenueOnboardingKyc,
  fetchVenueOnboardingReview,
  createVenueOnboardingAccount,
} from '../api/venue-api'

export const useVenueOnboardingReview = (venueId?: string | null) => {
  return useQuery({
    queryKey: ['venue-onboarding-review', venueId],
    queryFn: () => fetchVenueOnboardingReview(venueId!),
    enabled: Boolean(venueId),
  })
}

export const useVenueOnboardingMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = (venueId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['venues'] })
    if (venueId) {
      queryClient.invalidateQueries({ queryKey: ['venue-onboarding-review', venueId] })
    }
  }

  const saveBasicProfile = useMutation({
    mutationFn: saveVenueOnboardingBasicProfile,
    onSuccess: () => invalidate(),
  })

  const saveLocation = useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: FormData }) =>
      saveVenueOnboardingLocation(venueId, payload),
    onSuccess: (_, { venueId }) => invalidate(venueId),
  })

  const saveKyc = useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: FormData }) =>
      saveVenueOnboardingKyc(venueId, payload),
    onSuccess: (_, { venueId }) => invalidate(venueId),
  })

  const createAccount = useMutation({
    mutationFn: ({
      venueId,
      payload,
    }: {
      venueId: string
      payload: { internalNotes?: string; isVerified: boolean }
    }) => createVenueOnboardingAccount(venueId, payload),
    onSuccess: (_, { venueId }) => invalidate(venueId),
  })

  return {
    saveBasicProfile,
    saveLocation,
    saveKyc,
    createAccount,
  }
}
