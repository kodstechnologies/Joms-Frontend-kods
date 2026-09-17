import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'

import {
  CreateListingWizard,
  ExpertBasicProfileStep,
  ExpertIdentityVerificationStep,
  ExpertWorkExperienceStep,
  ExpertGalleryStep,
  ExpertFinalReviewStep,
} from '../../components'
import { useExpertOnboardingMutations } from '../../hooks/use-expert-onboarding'
import { useExpertProfile } from '../../hooks/use-expert-profile'
import {
  buildBasicProfileFormData,
  buildGalleryFormData,
  buildIdentityVerificationFormData,
  buildSubmitPayload,
  buildWorkExperiencePayload,
  createEmptyExpertOnboardingForm,
  getExpertOnboardingStepError,
  mapExpertProfileToOnboardingForm,
  type ExpertOnboardingFormData,
} from '../../utils/expert-onboarding-form'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import { useExpertAccountControls } from '@/modules/settings/hooks/use-expert-public-settings'
import { RESTRICTION_MESSAGES } from '@/modules/settings/hooks/use-app-restrictions'

const STEPS = [
  { id: '01', title: 'Basic Profile', description: 'Core Information' },
  { id: '02', title: 'Identity Verification', description: 'Government ID' },
  { id: '03', title: 'Work Experience', description: 'Work History' },
  { id: '04', title: 'Gallery', description: 'Work Images' },
  { id: '05', title: 'Final Review', description: 'Preview' },
]

export const CreateExpertPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const expertIdParam = searchParams.get('expertId')
  const isEditMode = searchParams.get('mode') === 'edit' && Boolean(expertIdParam)
  const { allowNewAccounts, isLoading: controlsLoading } = useExpertAccountControls()

  const [currentStep, setCurrentStep] = useState(1)
  const [expertId, setExpertId] = useState<string | null>(expertIdParam)
  const [formData, setFormData] = useState<ExpertOnboardingFormData>(() => ({
    ...createEmptyExpertOnboardingForm(),
    serviceType: 'concierge',
  }))
  const [lastSyncedProfileId, setLastSyncedProfileId] = useState<string | null>(null)

  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useExpertProfile(isEditMode ? (expertIdParam ?? undefined) : undefined)

  const {
    saveBasicProfile,
    updateBasicProfile,
    saveIdentityVerification,
    saveWorkExperience,
    saveGallery,
    submitApplication,
  } = useExpertOnboardingMutations()

  useEffect(() => {
    if (controlsLoading || isEditMode) return
    if (!allowNewAccounts) {
      toast.error(RESTRICTION_MESSAGES.expertCreate)
      navigate('/experts/management', { replace: true })
    }
  }, [allowNewAccounts, controlsLoading, isEditMode, navigate])

  if (isEditMode && profileResponse?.data && profileResponse.data._id !== lastSyncedProfileId) {
    setLastSyncedProfileId(profileResponse.data._id)
    setFormData(mapExpertProfileToOnboardingForm(profileResponse.data))
    setExpertId(profileResponse.data._id)
  }

  const updateExpertIdInUrl = (id: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('expertId', id)
    if (isEditMode) params.set('mode', 'edit')
    setSearchParams(params, { replace: true })
  }

  const handleNextStep = async () => {
    const validationError = getExpertOnboardingStepError(currentStep, formData, isEditMode)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      if (currentStep === 1) {
        if (expertId) {
          await updateBasicProfile.mutateAsync({
            id: expertId,
            payload: buildBasicProfileFormData(formData),
          })
        } else {
          if (!allowNewAccounts) {
            toast.error(RESTRICTION_MESSAGES.expertCreate)
            return
          }
          const response = await saveBasicProfile.mutateAsync(buildBasicProfileFormData(formData))
          const newId = response.data._id
          setExpertId(newId)
          updateExpertIdInUrl(newId)
        }
        setCurrentStep(2)
        return
      }

      if (!expertId) {
        toast.error('Missing expert id. Please complete the basic profile step first.')
        return
      }

      if (currentStep === 2) {
        await saveIdentityVerification.mutateAsync({
          id: expertId,
          payload: buildIdentityVerificationFormData(formData),
        })
        setCurrentStep(3)
        return
      }

      if (currentStep === 3) {
        await saveWorkExperience.mutateAsync({
          id: expertId,
          payload: buildWorkExperiencePayload(formData),
        })
        setCurrentStep(4)
        return
      }

      if (currentStep === 4) {
        if (isEditMode || formData.galleryImages.length > 0) {
          await saveGallery.mutateAsync({
            id: expertId,
            payload: buildGalleryFormData(formData),
          })
        }
        setCurrentStep(5)
        return
      }

      if (currentStep === 5) {
        const result = await submitApplication.mutateAsync({
          id: expertId,
          payload: buildSubmitPayload(formData),
        })

        // Partner was submitted. Check if KYC auto-approval had a warning.
        const kycWarning = (result as { kycWarning?: string } | undefined)?.kycWarning

        if (isEditMode) {
          if (kycWarning) {
            toast.warning(`Profile updated, but KYC could not be auto-approved: ${kycWarning}`)
          } else {
            toast.success('Expert profile updated successfully')
          }
          navigate(`/experts/management/profile/${expertId}`)
          return
        }

        if (kycWarning) {
          toast.warning(
            `Expert created, but KYC auto-approval failed: ${kycWarning}. Please complete KYC manually.`,
          )
        } else {
          toast.success('Expert created and KYC approved successfully')
        }
        navigate('/experts/management')
        return
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      return
    }
    if (isEditMode && expertId) {
      navigate(`/experts/management/profile/${expertId}`)
      return
    }
    navigateBackOrFallback(navigate, '/experts/management')
  }

  const isLoading =
    saveBasicProfile.isPending ||
    updateBasicProfile.isPending ||
    saveIdentityVerification.isPending ||
    saveWorkExperience.isPending ||
    saveGallery.isPending ||
    submitApplication.isPending

  const primaryLabel = (() => {
    if (isLoading) return 'Saving…'
    if (currentStep === 5) return isEditMode ? 'Save Changes' : 'Create Account'
    return 'Save & Continue'
  })()

  if (!isEditMode && (controlsLoading || !allowNewAccounts)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (isEditMode && isProfileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (isEditMode && (isProfileError || (!isProfileLoading && !profileResponse?.data))) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-white">Failed to load expert profile for editing.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="text-brand-accent underline"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <CreateListingWizard
      title={isEditMode ? 'Edit Expert Profile' : 'Expert Profile Creation'}
      breadcrumbs={[
        { label: 'Expert Management', to: '/experts/management' },
        { label: 'Manage Experts', to: '/experts/management' },
        { label: isEditMode ? 'Edit Profile' : 'Create Account', isActive: true },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      onBack={handleBack}
      primaryAction={{
        label: primaryLabel,
        onClick: handleNextStep,
        disabled: isLoading,
      }}
    >
      {currentStep === 1 && (
        <ExpertBasicProfileStep
          formData={formData}
          setFormData={setFormData}
          lockedServiceType="concierge"
          excludePartnerId={expertId}
          requireSampleWorkFile={!isEditMode}
        />
      )}
      {currentStep === 2 && (
        <ExpertIdentityVerificationStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 3 && (
        <ExpertWorkExperienceStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 4 && <ExpertGalleryStep formData={formData} setFormData={setFormData} />}
      {currentStep === 5 && (
        <ExpertFinalReviewStep formData={formData} setFormData={setFormData} expertId={expertId} />
      )}
    </CreateListingWizard>
  )
}
