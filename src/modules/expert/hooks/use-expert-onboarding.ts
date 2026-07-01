import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createExpertBasicProfile,
  submitExpertApplication,
  updateExpertGallery,
  updateExpertIdentityVerification,
  updateExpertWorkExperience,
} from '../api/expert-onboarding-api'

export const useExpertOnboardingMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['experts'] })
  }

  const saveBasicProfile = useMutation({
    mutationFn: createExpertBasicProfile,
    onSuccess: invalidate,
  })

  const saveIdentityVerification = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      updateExpertIdentityVerification(id, payload),
    onSuccess: invalidate,
  })

  const saveWorkExperience = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { workExperience: unknown[] }
    }) => updateExpertWorkExperience(id, payload),
    onSuccess: invalidate,
  })

  const saveGallery = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      updateExpertGallery(id, payload),
    onSuccess: invalidate,
  })

  const submitApplication = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { internalNotes?: string; isVerified: boolean }
    }) => submitExpertApplication(id, payload),
    onSuccess: invalidate,
  })

  return {
    saveBasicProfile,
    saveIdentityVerification,
    saveWorkExperience,
    saveGallery,
    submitApplication,
  }
}
