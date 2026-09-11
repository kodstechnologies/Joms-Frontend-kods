import { useState } from 'react'
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
  mapExpertProfileToOnboardingForm,
  type ExpertOnboardingFormData,
} from '../../utils/expert-onboarding-form'
import { validateMobileNumber } from '@/shared/lib/phone'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'

const STEPS = [
  { id: '01', title: 'Basic Profile', description: 'Core Information' },
  { id: '02', title: 'Identity Verification', description: 'Government ID' },
  { id: '03', title: 'Work Experience', description: 'Work History' },
  { id: '04', title: 'Gallery', description: 'Work Images' },
  { id: '05', title: 'Final Review', description: 'Preview' },
]

const validateStep = (
  step: number,
  form: ExpertOnboardingFormData,
  isEdit: boolean,
): string | null => {
  if (step === 1) {
    if (!form.fullname.trim()) return 'Full name is required.'
    const phoneError = validateMobileNumber(form.phoneNumber)
    if (phoneError) return phoneError
    if (!form.email.trim()) return 'Email is required.'
    if (!form.serviceType) return 'Service type is required.'
    if (form.serviceCategory.length === 0) return 'At least one service category is required.'
  }
  if (step === 2) {
    if (!form.idType) return 'ID type is required.'
    if (!form.idNumber.trim()) return 'ID number is required.'
    if (!form.panNumber.trim()) return 'PAN number is required.'
    if (form.gstAvailable && !form.gstNumber.trim()) return 'GST number is required.'
    if (!form.panCardFile && !form.panCardFileName) {
      return 'PAN card document is required.'
    }
    if (!form.certificateFile && !form.certificateFileName) {
      return 'Certificate / license document is required.'
    }
    if (form.gstAvailable && !form.gstCertificateFile && !form.gstCertificateFileName) {
      return 'GST certificate is required.'
    }
  }
  if (step === 3) {
    const validEntries = form.workExperience.filter(
      (entry) => entry.jobTitle.trim() || entry.companyName.trim(),
    )
    if (validEntries.length === 0) return 'At least one work experience entry is required.'
    for (let i = 0; i < validEntries.length; i++) {
      if (!validEntries[i].jobTitle.trim()) {
        return `Job title is required for work experience entry #${i + 1}.`
      }
      if (!validEntries[i].companyName.trim()) {
        return `Company name is required for work experience entry #${i + 1}.`
      }
    }
  }
  if (step === 4) {
    if (form.galleryPreviews.length > 5) return 'A maximum of 5 images are allowed.'
    if (!isEdit && form.galleryImages.length === 0 && form.galleryPreviews.length === 0) {
      return null
    }
  }
  if (step === 5) {
    if (!form.isVerified) return 'Please verify the profile before submission.'
  }
  return null
}

export const CreateExpertPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const expertIdParam = searchParams.get('expertId')
  const isEditMode = searchParams.get('mode') === 'edit' && Boolean(expertIdParam)

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
    const validationError = validateStep(currentStep, formData, isEditMode)
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
        { label: 'Expert management' },
        { label: 'Manage Experts' },
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
