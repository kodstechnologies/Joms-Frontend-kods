import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import {
  buildBasicProfileFormData,
  buildGalleryFormData,
  buildIdentityVerificationFormData,
  buildSubmitPayload,
  buildWorkExperiencePayload,
  createEmptyExpertOnboardingForm,
  type ExpertOnboardingFormData,
} from '../../utils/expert-onboarding-form'

const STEPS = [
  { id: '01', title: 'Basic Profile', description: 'Core Information' },
  { id: '02', title: 'Identity Verification', description: 'Government ID' },
  { id: '03', title: 'Work Experience', description: 'Work History' },
  { id: '04', title: 'Gallery', description: 'Work Images' },
  { id: '05', title: 'Final Review', description: 'Preview' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
}

const validateStep = (step: number, form: ExpertOnboardingFormData): string | null => {
  if (step === 1) {
    if (!form.fullname.trim()) return 'Full name is required.'
    if (!form.phoneNumber.trim()) return 'Phone number is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!form.serviceType) return 'Service type is required.'
    if (form.serviceCategory.length === 0) return 'At least one service category is required.'
  }
  if (step === 2) {
    if (!form.idType) return 'ID type is required.'
    if (!form.idNumber.trim()) return 'ID number is required.'
    if (!form.panNumber.trim()) return 'PAN number is required.'
    if (form.gstAvailable && !form.gstNumber.trim()) return 'GST number is required.'
  }
  if (step === 3) {
    const hasEntry = form.workExperience.some((entry) => entry.jobTitle.trim())
    if (!hasEntry) return 'At least one work experience entry is required.'
  }
  if (step === 4) {
    if (form.galleryImages.length > 5) return 'A maximum of 5 images are allowed.'
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

  const [currentStep, setCurrentStep] = useState(1)
  const [expertId, setExpertId] = useState<string | null>(expertIdParam)
  const [formData, setFormData] = useState<ExpertOnboardingFormData>(
    createEmptyExpertOnboardingForm,
  )

  const {
    saveBasicProfile,
    saveIdentityVerification,
    saveWorkExperience,
    saveGallery,
    submitApplication,
  } = useExpertOnboardingMutations()

  const updateExpertIdInUrl = (id: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('expertId', id)
    setSearchParams(params, { replace: true })
  }

  const handleNextStep = async () => {
    const validationError = validateStep(currentStep, formData)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      if (currentStep === 1) {
        if (!expertId) {
          const response = await saveBasicProfile.mutateAsync(
            buildBasicProfileFormData(formData),
          )
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
        await saveGallery.mutateAsync({
          id: expertId,
          payload: buildGalleryFormData(formData),
        })
        setCurrentStep(5)
        return
      }

      if (currentStep === 5) {
        await submitApplication.mutateAsync({
          id: expertId,
          payload: buildSubmitPayload(formData),
        })
        toast.success('Application submitted successfully')
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
    navigate('/experts/management')
  }

  const isLoading =
    saveBasicProfile.isPending ||
    saveIdentityVerification.isPending ||
    saveWorkExperience.isPending ||
    saveGallery.isPending ||
    submitApplication.isPending

  const primaryLabel = (() => {
    if (isLoading) return 'Saving…'
    if (currentStep === 5) return 'Create Account'
    return 'Save & Continue'
  })()

  return (
    <CreateListingWizard
      title="Expert Profile Creation"
      breadcrumbs={[
        { label: 'Expert management' },
        { label: 'Manage Experts' },
        { label: 'Create Account', isActive: true },
      ]}
      steps={STEPS}
      currentStep={currentStep}
      onBack={handleBack}
      secondaryAction={{
        label: 'Save as Draft',
        onClick: () => toast.message('Draft saving is coming soon'),
      }}
      primaryAction={{
        label: primaryLabel,
        onClick: handleNextStep,
        disabled: isLoading,
        className:
          currentStep === 5
            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
            : undefined,
      }}
    >
      {currentStep === 1 && (
        <ExpertBasicProfileStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 2 && (
        <ExpertIdentityVerificationStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 3 && (
        <ExpertWorkExperienceStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 4 && (
        <ExpertGalleryStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 5 && (
        <ExpertFinalReviewStep formData={formData} setFormData={setFormData} />
      )}
    </CreateListingWizard>
  )
}
