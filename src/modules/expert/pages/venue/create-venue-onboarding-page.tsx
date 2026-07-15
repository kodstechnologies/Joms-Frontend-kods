import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  CreateListingWizard,
  VenueOnboardingBasicProfileStep,
  VenueOnboardingLocationStep,
  VenueOnboardingKycStep,
  VenueOnboardingFinalReviewStep,
} from '@/modules/expert/components'
import { createExpertBasicProfile } from '@/modules/expert/api/expert-onboarding-api'
import {
  useVenueOnboardingMutations,
  useVenueOnboardingReview,
} from '@/modules/expert/hooks/use-venue-onboarding'
import type { VenueCategory } from '@/modules/expert/type/venue'
import {
  buildBasicProfileFormData,
  buildKycFormData,
  buildLocationFormData,
  buildVenuePartnerProfileFormData,
  createEmptyVenueOnboardingForm,
  type VenueOnboardingFormData,
} from '@/modules/expert/utils/venue-onboarding-form'
import { sanitizeMobileNumber, validateMobileNumber } from '@/shared/lib/phone'

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

export function CreateVenueOnboardingPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const partnerIdParam = searchParams.get('partnerId') || ''
  const venueIdParam = searchParams.get('venueId')

  const [currentStep, setCurrentStep] = useState(1)
  const [createdPartnerId, setCreatedPartnerId] = useState('')
  const [createdVenueId, setCreatedVenueId] = useState<string | null>(null)
  const [formData, setFormData] = useState<VenueOnboardingFormData>(createEmptyVenueOnboardingForm)
  const [hasInitializedStep, setHasInitializedStep] = useState(false)
  const [isCreatingPartner, setIsCreatingPartner] = useState(false)

  const partnerId = partnerIdParam || createdPartnerId
  const venueId = venueIdParam || createdVenueId

  const { saveBasicProfile, saveLocation, saveKyc, createAccount } = useVenueOnboardingMutations()

  const { data: reviewData, refetch: refetchReview } = useVenueOnboardingReview(venueId)

  const [lastSyncedReview, setLastSyncedReview] = useState(reviewData)
  if (reviewData !== lastSyncedReview) {
    setLastSyncedReview(reviewData)

    if (reviewData?.data?.venue) {
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
        venueCategoryName:
          (typeof venue.venueCategoryId?.[0] === 'object'
            ? (venue.venueCategoryId[0] as VenueCategory).name
            : prev.venueCategoryName) || prev.venueCategoryName,
        hostingSinceYears: venue.hostingSince?.years
          ? String(venue.hostingSince.years)
          : prev.hostingSinceYears,
        hostingSinceMonths: venue.hostingSince?.months
          ? String(venue.hostingSince.months)
          : prev.hostingSinceMonths,
        pocName: venue.pocName || prev.pocName,
        pocContactNumber: venue.pocContactNumber || prev.pocContactNumber,
        phone: venue.phone ? sanitizeMobileNumber(venue.phone) : prev.phone,
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
        gstUndertakingEmail: kyc?.businessKyc?.gstUndertakingEmail || prev.gstUndertakingEmail,
        internalNotes: venue.adminInternalNotes || prev.internalNotes,
      }))

      if (venueIdParam && !hasInitializedStep) {
        setHasInitializedStep(true)
        setCurrentStep(inferStepFromCurrentStep(venue.currentStep))
      }
    }
  }

  const updateVenueIdInUrl = (id: string, nextPartnerId = partnerId) => {
    const params = new URLSearchParams(searchParams)
    params.set('venueId', id)
    if (nextPartnerId) params.set('partnerId', nextPartnerId)
    setSearchParams(params, { replace: true })
  }

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!formData.name.trim()) return 'Venue name is required.'
      const phoneError = validateMobileNumber(formData.phone)
      if (phoneError) return phoneError
      if (!formData.email.trim()) return 'Email is required.'
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
      toast.error(validationError)
      return
    }

    try {
      if (currentStep === 1) {
        if (!venueId) {
          let activePartnerId = partnerId

          if (!activePartnerId) {
            setIsCreatingPartner(true)
            const partnerResponse = await createExpertBasicProfile(
              buildVenuePartnerProfileFormData(formData),
            )
            activePartnerId = partnerResponse.data._id
            setCreatedPartnerId(activePartnerId)
            setIsCreatingPartner(false)
          }

          const response = await saveBasicProfile.mutateAsync(
            buildBasicProfileFormData(activePartnerId, formData),
          )
          const newVenueId = response.data._id
          setCreatedVenueId(newVenueId)
          updateVenueIdInUrl(newVenueId, activePartnerId)
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
      setIsCreatingPartner(false)
      toast.error(getApiErrorMessage(err))
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
    createAccount.isPending ||
    isCreatingPartner

  const primaryLabel = (() => {
    if (isLoading) return 'Saving…'
    if (currentStep === 4) return 'Create Account'
    return 'Next'
  })()

  return (
    <CreateListingWizard
      title="Venue Profile Creation"
      breadcrumbs={[
        { label: 'Venue management' },
        { label: 'Manage Venues' },
        { label: 'Create Profile', isActive: true },
      ]}
      steps={ONBOARDING_STEPS}
      currentStep={currentStep}
      onBack={handleBack}
      primaryAction={{
        label: primaryLabel,
        onClick: handleNextStep,
        disabled: isLoading,
      }}
    >
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

export default CreateVenueOnboardingPage
