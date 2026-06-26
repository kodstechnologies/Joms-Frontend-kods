import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  CreateListingWizard,
  VenueOnboardingBasicProfileStep,
  VenueOnboardingLocationStep,
  VenueOnboardingKycStep,
  VenueOnboardingFinalReviewStep,
} from '@/modules/expert/components'
import {
  useVenueOnboardingMutations,
  useVenueOnboardingReview,
} from '@/modules/expert/hooks/use-venue-onboarding'
import type { VenueCategory } from '@/modules/expert/type/venue'
import {
  buildBasicProfileFormData,
  buildKycFormData,
  buildLocationFormData,
  createEmptyVenueOnboardingForm,
  type VenueOnboardingFormData,
} from '@/modules/expert/utils/venue-onboarding-form'

const ONBOARDING_STEPS = [
  { id: '01', title: 'Basic Profile', description: 'Core Information' },
  { id: '02', title: 'Location', description: 'Venue Address' },
  { id: '03', title: 'KYC Details', description: 'Government Documents' },
  { id: '04', title: 'Final Review', description: 'Preview' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
}

const inferStepFromCurrentStep = (currentStep?: string) => {
  if (!currentStep) return 1
  if (currentStep === 'location') return 2
  if (currentStep === 'business_kyc' || currentStep === 'kyc') return 3
  if (currentStep === 'submitted' || currentStep === 'review') return 4
  return 2
}

export const CreateVenueOnboardingPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const partnerId = searchParams.get('partnerId') || ''
  const venueIdParam = searchParams.get('venueId')

  const [currentStep, setCurrentStep] = useState(1)
  const [venueId, setVenueId] = useState<string | null>(venueIdParam)
  const [formData, setFormData] = useState<VenueOnboardingFormData>(
    createEmptyVenueOnboardingForm,
  )
  const [hasInitializedStep, setHasInitializedStep] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const { saveBasicProfile, saveLocation, saveKyc, createAccount } =
    useVenueOnboardingMutations()

  const { data: reviewData, refetch: refetchReview } = useVenueOnboardingReview(venueId)

  useEffect(() => {
    if (!venueIdParam) return
    setVenueId(venueIdParam)
  }, [venueIdParam])

  useEffect(() => {
    if (!reviewData?.data?.venue) return

    const venue = reviewData.data.venue
    const kyc = reviewData.data.kyc

    setFormData((prev) => ({
      ...prev,
      name: venue.name || prev.name,
      venueType: venue.venueType || prev.venueType,
      venueCategoryId:
        (typeof venue.venueCategoryId?.[0] === 'object'
          ? (venue.venueCategoryId[0] as VenueCategory)._id
          : (venue.venueCategoryId?.[0] as string)) || prev.venueCategoryId,
      hostingSinceYears: venue.hostingSince?.years
        ? String(venue.hostingSince.years)
        : prev.hostingSinceYears,
      hostingSinceMonths: venue.hostingSince?.months
        ? String(venue.hostingSince.months)
        : prev.hostingSinceMonths,
      pocName: venue.pocName || prev.pocName,
      pocContactNumber: venue.pocContactNumber || prev.pocContactNumber,
      phone: venue.phone || prev.phone,
      email: venue.email || prev.email,
      profileImageUrl: venue.profileImageUrl || prev.profileImageUrl,
      coverImageUrl: venue.coverImageUrl || prev.coverImageUrl,
      address: venue.location?.address || prev.address,
      city: venue.location?.city || prev.city,
      pincode: venue.location?.pincode || prev.pincode,
      state: venue.location?.state || prev.state,
      country: venue.location?.country || prev.country,
      landmark: venue.location?.landmark || prev.landmark,
      latitude: venue.location?.latitude ?? prev.latitude,
      longitude: venue.location?.longitude ?? prev.longitude,
      venueImageUrls: venue.venueImages || prev.venueImageUrls,
      idType: kyc?.governmentId?.idType || prev.idType,
      idNumber: kyc?.governmentId?.idNumber || prev.idNumber,
      hasGST: kyc?.businessKyc?.hasGST ?? prev.hasGST,
      gstNumber: kyc?.businessKyc?.gstNumber || prev.gstNumber,
      kycState: kyc?.businessKyc?.state || prev.kycState,
      panNumber: kyc?.businessKyc?.panNumber || prev.panNumber,
      typeOfVenue: kyc?.businessKyc?.typeOfVenue || prev.typeOfVenue,
      itReturnsFiledLast2Years:
        kyc?.businessKyc?.itReturnsFiledLast2Years ?? prev.itReturnsFiledLast2Years,
      gstUndertakingEmail:
        kyc?.businessKyc?.gstUndertakingEmail || prev.gstUndertakingEmail,
      internalNotes: venue.adminInternalNotes || prev.internalNotes,
    }))
  }, [reviewData])

  useEffect(() => {
    if (!venueIdParam || !reviewData?.data?.venue || hasInitializedStep) return
    setCurrentStep(inferStepFromCurrentStep(reviewData.data.venue.currentStep))
    setHasInitializedStep(true)
  }, [venueIdParam, reviewData?.data?.venue, hasInitializedStep])

  const updateVenueIdInUrl = (id: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('venueId', id)
    if (partnerId) params.set('partnerId', partnerId)
    setSearchParams(params, { replace: true })
  }

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!partnerId) return 'Partner ID is required. Add ?partnerId=<id> to the URL.'
      if (!formData.name.trim()) return 'Venue name is required.'
      if (!formData.venueCategoryId) return 'Category is required.'
    }
    if (step === 2) {
      if (!formData.address.trim()) return 'Address is required.'
      if (!formData.city.trim()) return 'City is required.'
      if (!formData.pincode.trim()) return 'Pin code is required.'
    }
    if (step === 3) {
      if (!formData.idType) return 'ID type is required.'
      if (!formData.idNumber.trim()) return 'ID number is required.'
      if (!formData.panNumber.trim()) return 'PAN number is required.'
      if (!formData.typeOfVenue) return 'Type of venue is required.'
      if (formData.hasGST && !formData.gstNumber.trim()) return 'GST number is required.'
    }
    if (step === 4) {
      if (!formData.isVerified) return 'Please confirm verification before creating account.'
    }
    return null
  }

  const handleNextStep = async () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    try {
      if (currentStep === 1) {
        if (!venueId) {
          const response = await saveBasicProfile.mutateAsync(
            buildBasicProfileFormData(partnerId, formData),
          )
          const newVenueId = response.data._id
          setVenueId(newVenueId)
          updateVenueIdInUrl(newVenueId)
        }
        setCurrentStep(2)
        return
      }

      if (currentStep === 2 && venueId) {
        await saveLocation.mutateAsync({
          venueId,
          payload: buildLocationFormData(formData),
        })
        setCurrentStep(3)
        return
      }

      if (currentStep === 3 && venueId) {
        await saveKyc.mutateAsync({
          venueId,
          payload: buildKycFormData(formData),
        })
        await refetchReview()
        setCurrentStep(4)
        return
      }

      if (currentStep === 4 && venueId) {
        await createAccount.mutateAsync({
          venueId,
          payload: {
            internalNotes: formData.internalNotes,
            isVerified: formData.isVerified,
          },
        })
        toast.success('Venue account created successfully')
        navigate(`/venues/management/create?venueId=${venueId}`)
        return
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      return
    }
    navigate('/venues/management')
  }

  const isLoading =
    saveBasicProfile.isPending ||
    saveLocation.isPending ||
    saveKyc.isPending ||
    createAccount.isPending

  const primaryLabel = (() => {
    if (isLoading) return 'Saving…'
    if (currentStep === 4) return 'Create Account'
    return 'Next'
  })()

  return (
    <CreateListingWizard
      title="User Profile Creation"
      breadcrumbs={[
        { label: 'User management' },
        { label: 'Manage User' },
        { label: 'Create Account', isActive: true },
      ]}
      steps={ONBOARDING_STEPS}
      currentStep={currentStep}
      onBack={handleBack}
      primaryAction={{
        label: primaryLabel,
        onClick: handleNextStep,
        disabled: isLoading,
        className:
          currentStep === 4
            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
            : undefined,
      }}
    >
      {!partnerId && currentStep === 1 && (
        <div className="mx-auto mb-4 max-w-5xl rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Add <code className="text-amber-100">?partnerId=&lt;id&gt;</code> to the URL
          before creating a venue account.
        </div>
      )}

      {error && (
        <div className="mx-auto mb-4 max-w-5xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <VenueOnboardingBasicProfileStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 2 && (
        <VenueOnboardingLocationStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 3 && (
        <VenueOnboardingKycStep formData={formData} setFormData={setFormData} />
      )}
      {currentStep === 4 && (
        <VenueOnboardingFinalReviewStep
          formData={formData}
          setFormData={setFormData}
          reviewVenue={reviewData?.data?.venue}
          reviewKyc={reviewData?.data?.kyc}
        />
      )}
    </CreateListingWizard>
  )
}
