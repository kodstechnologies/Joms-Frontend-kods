import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'

import {
  VenueDetailsStep,
  LocationDetailsStep,
  SpacesStep,
  AmenitiesMediaStep,
  PricingStep,
  TermsConditionsStep,
  FinalCheckStep,
  CreateListingWizard,
} from '@/modules/expert/components'

import { useVenueStepMutations } from '@/modules/expert/hooks/use-create-venue'
import { fetchAdminDraftVenue } from '../../api/venue-api'
import {
  createDefaultWeeklyAvailability,
  mapHoursToCancellationPolicy,
  mapSpaceTypeFromApi,
  type VenueFormData,
} from '../../utils/venue-form'

type DraftWeeklyAvailabilityEntry = { day: string; from?: string; to?: string; enabled?: boolean }
type DraftBlockedDate = { date?: string; from?: string; to?: string }
type DraftAmenitySubCategory = { _id?: string; name?: string; image?: string } | string
type DraftAmenity = {
  categoryId?: string | { _id: string }
  subCategoryIds?: DraftAmenitySubCategory[]
  subCategories?: DraftAmenitySubCategory[]
}
type DraftContact = { name?: string; phone?: string; email?: string }
type DraftFaq = { question?: string; answer?: string }
type DraftPricing = {
  weekdayPrice?: number
  weekendPrice?: number
  discount?: number
  reservationFee?: number
}
type DraftVenueSpace = {
  _id?: string
  name?: string
  spaceType?: string
  capacityMode?: string
  capacityRange?: string | number
  seatingStyle?: string
  areaSqFeet?: number
  isSameAsVenueLocation?: boolean
  inHouseCatering?: boolean
  decorationAvailable?: boolean
  parkingAvailable?: boolean
  accessibility?: boolean
  pricing?: DraftPricing[]
  availability?: {
    weeklyAvailability?: DraftWeeklyAvailabilityEntry[]
    blockedDates?: DraftBlockedDate[]
  }
}
type DraftVenue = {
  name?: string
  venueType?: string
  venueCategoryId?: Array<string | { _id: string }>
  aboutVenue?: string
  location?: { address?: string; landmark?: string; city?: string }
  parkingAvailable?: boolean
  accessibility?: boolean
  amenities?: { amenities?: DraftAmenity[] }
  gallery?: {
    venueCoverImages?: Array<{ url: string }>
    spaceCoverImages?: Array<{ url: string }>
    galleryImages?: Array<{ url: string }>
    contact?: { contacts?: DraftContact[] }
  }
  spaces?: DraftVenueSpace[]
  pricing?: DraftPricing[]
  terms?: {
    terms?: string[] | string
    cancellation?: { freeCancellationHours?: number; refundPercentage?: number }
    faqs?: DraftFaq[]
  }
}

const toEntityId = (value?: string | { _id: string }) =>
  typeof value === 'object' ? value?._id : value

export const CreateVenueListingPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const venueId = searchParams.get('venueId')
  const partnerId = searchParams.get('partnerId') || ''
  const isViewMode = searchParams.get('view') === 'true'
  const isEditMode = searchParams.get('mode') === 'edit' && Boolean(venueId)

  const [currentStep, setCurrentStep] = useState(1)
  const [spaceId, setSpaceId] = useState<string | null>(null)

  const {
    saveVenueDetails,
    saveLocation,
    saveSpace,
    saveAmenitiesAndMedia,
    savePricing,
    saveTerms,
    submitVenueListing,
  } = useVenueStepMutations()

  const [venueData, setVenueData] = useState<VenueFormData>({
    venueName: '',
    venueType: '',
    venueCategory: '',
    aboutVenue: '',
    address: '',
    landmark: '',
    city: '',
    parkingAvailable: false,
    accessibility: false,
    spaceName: '',
    spaceType: '',
    capacityType: 'seated',
    capacity: '',
    areaSqFt: '',
    guestCount: '',
    seatingType: '',
    locationType: 'same',
    seatedCapacity: '',
    standingCapacity: '',
    inHouseCatering: false,
    decorationAvailable: false,
    amenities: [] as {
      categoryId: string
      subCategoryId: string
      name: string
      image: string
    }[],
    contacts: [{ name: '', phone: '', email: '' }] as {
      name: string
      phone: string
      email: string
    }[],
    venueCoverImage: null as File | null,
    venueImage: null as File | null,
    galleryImages: [] as File[],
    venueCoverImageUrl: '',
    venueImageUrl: '',
    galleryImageUrls: [] as string[],
    serviceType: 'entire_space',
    setDays: '',
    weekdayPrice: '',
    weekendPrice: '',
    discount: '',
    reservationFee: '',
    terms: '',
    cancellationPolicy: '48hrs',
    refundPercentage: '0',
    faqs: [{ question: '', answer: '' }] as {
      question: string
      answer: string
    }[],
    weeklyAvailability: createDefaultWeeklyAvailability(),
    blockedDates: [] as { date: string; from: string; to: string }[],
  })

  useEffect(() => {
    if (!venueId && partnerId) {
      toast.warning(
        'Complete venue profile creation first, or open this page from a venue row that already has a venue ID.',
      )
    }
  }, [venueId, partnerId])

  useEffect(() => {
    if (!venueId) return

    const loadVenue = async () => {
      try {
        const response = await fetchAdminDraftVenue(venueId)
        const venue = response?.data as DraftVenue | undefined
        const gallery = venue?.gallery
        const spaces = venue?.spaces || []
        const space = isEditMode ? spaces[0] : undefined
        const pricing = isEditMode ? (space?.pricing?.[0] ?? venue?.pricing?.[0]) : undefined
        const terms = venue?.terms

        const defaultDays = createDefaultWeeklyAvailability()
        const savedWeekly = isEditMode ? (space?.availability?.weeklyAvailability ?? []) : []
        const weeklyAvailability = defaultDays.map((entry) => {
          if (!isEditMode) return entry
          const match = savedWeekly.find((d) => d.day === entry.day)
          return match
            ? { ...entry, from: match.from || entry.from, to: match.to || entry.to, enabled: true }
            : { ...entry, enabled: savedWeekly.length === 0 ? entry.enabled : false }
        })
        const blockedDates = isEditMode
          ? (space?.availability?.blockedDates ?? []).map((d) => ({
              date: d.date ? String(d.date).slice(0, 10) : '',
              from: d.from || '',
              to: d.to || '',
            }))
          : []

        if (isEditMode && space?._id) {
          setSpaceId(String(space._id))
        } else {
          setSpaceId(null)
        }

        setVenueData((prev) => ({
          ...prev,
          venueName: venue?.name || '',
          venueType: venue?.venueType || '',
          venueCategory: toEntityId(venue?.venueCategoryId?.[0]) || '',
          aboutVenue: venue?.aboutVenue || '',
          address: venue?.location?.address || '',
          landmark: venue?.location?.landmark || '',
          city: venue?.location?.city || '',
          parkingAvailable: venue?.parkingAvailable ?? false,
          accessibility: venue?.accessibility ?? false,
          spaceName: isEditMode ? space?.name || '' : '',
          spaceType: isEditMode ? mapSpaceTypeFromApi(space?.spaceType) : '',
          capacityType: isEditMode ? space?.capacityMode || 'seated' : 'seated',
          guestCount: isEditMode && space?.capacityRange != null ? String(space.capacityRange) : '',
          seatingType: isEditMode ? space?.seatingStyle || '' : '',
          areaSqFt: isEditMode && space?.areaSqFeet != null ? String(space.areaSqFeet) : '',
          locationType: isEditMode && space?.isSameAsVenueLocation === false ? 'different' : 'same',
          seatedCapacity:
            isEditMode && space?.capacityMode === 'seated' && space?.capacityRange != null
              ? String(space.capacityRange)
              : '',
          standingCapacity:
            isEditMode && space?.capacityMode === 'standing' && space?.capacityRange != null
              ? String(space.capacityRange)
              : '',
          inHouseCatering: isEditMode ? (space?.inHouseCatering ?? false) : false,
          decorationAvailable: isEditMode ? (space?.decorationAvailable ?? false) : false,

          amenities:
            isEditMode && Array.isArray(venue?.amenities?.amenities)
              ? venue.amenities.amenities.flatMap((amenity) => {
                  const subs = amenity.subCategoryIds || amenity.subCategories || []
                  return subs.map((subCategory) => {
                    const subId = typeof subCategory === 'object' ? subCategory._id : subCategory
                    return {
                      categoryId: toEntityId(amenity.categoryId) || '',
                      subCategoryId: String(subId || ''),
                      name: typeof subCategory === 'object' ? subCategory.name || '' : '',
                      image: typeof subCategory === 'object' ? subCategory.image || '' : '',
                    }
                  })
                })
              : [],

          venueCoverImageUrl: isEditMode ? gallery?.venueCoverImages?.[0]?.url || '' : '',
          venueImageUrl: isEditMode ? gallery?.spaceCoverImages?.[0]?.url || '' : '',
          galleryImageUrls: isEditMode
            ? (gallery?.galleryImages || []).map((img: { url: string }) => img.url)
            : [],
          contacts:
            isEditMode && gallery?.contact?.contacts && gallery.contact.contacts.length > 0
              ? gallery.contact.contacts.map((contact) => ({
                  name: contact.name || '',
                  phone: contact.phone || '',
                  email: contact.email || '',
                }))
              : [{ name: '', phone: '', email: '' }],

          weekdayPrice: pricing?.weekdayPrice ? String(pricing.weekdayPrice) : '',
          weekendPrice: pricing?.weekendPrice ? String(pricing.weekendPrice) : '',
          discount: pricing?.discount ? String(pricing.discount) : '',
          reservationFee: pricing?.reservationFee ? String(pricing.reservationFee) : '',

          terms: Array.isArray(terms?.terms) ? terms.terms.join('\n') : String(terms?.terms || ''),
          cancellationPolicy: mapHoursToCancellationPolicy(
            terms?.cancellation?.freeCancellationHours,
          ),
          refundPercentage: String(terms?.cancellation?.refundPercentage ?? '0'),
          faqs:
            terms?.faqs && terms.faqs.length > 0
              ? terms.faqs.map((faq) => ({
                  question: faq.question || '',
                  answer: faq.answer || '',
                }))
              : [{ question: '', answer: '' }],

          weeklyAvailability,
          blockedDates,
        }))
      } catch (err) {
        console.error('Failed to load venue draft', err)
      }
    }

    loadVenue()
  }, [venueId, isEditMode])

  const handleNextStep = async () => {
    try {
      if (currentStep === 1 && venueId) {
        await saveVenueDetails.mutateAsync({ venueId, venueData })
        toast.success('Venue details saved')
      }

      if (currentStep === 2 && venueId) {
        await saveLocation.mutateAsync({ venueId, venueData })
        toast.success('Location saved')
      }

      if (currentStep === 3 && venueId) {
        const result = await saveSpace.mutateAsync({ venueId, spaceId, venueData })

        const newSpaceId = result?.data?._id || result?._id || spaceId
        if (newSpaceId) setSpaceId(String(newSpaceId))
        toast.success(
          isEditMode && spaceId ? 'Space updated successfully' : 'Space created successfully',
        )
      }

      if (currentStep === 4) {
        if (!spaceId) {
          toast.error(
            isEditMode
              ? 'Please save space details first before updating amenities.'
              : 'Please create a space first before adding amenities.',
          )
          return
        }
        await saveAmenitiesAndMedia.mutateAsync({ venueId: venueId!, spaceId, venueData })
        toast.success('Amenities & media saved')
      }

      if (currentStep === 5) {
        if (!spaceId) {
          toast.error(
            isEditMode
              ? 'Please save space details first before updating pricing.'
              : 'Please create a space first before adding pricing.',
          )
          return
        }
        await savePricing.mutateAsync({ spaceId, venueData })
        toast.success('Pricing & availability saved')
      }

      if (currentStep === 6 && venueId) {
        await saveTerms.mutateAsync({ venueId, venueData })
        toast.success('Terms & conditions saved')
      }

      if (currentStep === 7 && venueId) {
        if (isEditMode) {
          toast.success('Venue updated successfully')
          navigate(`/venues/management/profile/${venueId}`)
          return
        }

        await submitVenueListing.mutateAsync(venueId)
        toast.success('Venue submitted successfully')

        navigate('/venues/management')

        return
      }
      setCurrentStep((prev) => Math.min(prev + 1, 7))
    } catch (err: unknown) {
      console.error('Step save failed', err)
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error?.response?.data?.message || 'Failed to save. Please try again.')
    }
  }
  const isLoading =
    saveVenueDetails.isPending ||
    saveLocation.isPending ||
    saveSpace.isPending ||
    saveAmenitiesAndMedia.isPending ||
    savePricing.isPending ||
    saveTerms.isPending ||
    submitVenueListing.isPending

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
    else if (isEditMode && venueId) navigate(`/venues/management/profile/${venueId}`)
    else navigateBackOrFallback(navigate, '/venues/management')
  }

  const breadcrumbs = [
    { label: 'Expert Management' },
    { label: 'Venue Management' },
    {
      label: isViewMode ? 'View Venue' : isEditMode ? 'Edit Venue' : 'Create Venue',
      isActive: true,
    },
  ]

  const venueSteps = [
    { id: '01', title: 'Venue Details', description: 'Basic venue information' },
    { id: '02', title: 'Location Details', description: 'Address and location' },
    { id: '03', title: 'Spaces', description: 'Space and capacity' },
    { id: '04', title: 'Amenities & Media', description: 'Facilities and photos' },
    { id: '05', title: 'Pricing', description: 'Set venue pricing' },
    { id: '06', title: 'Terms & Conditions', description: 'Rules and policies' },
    { id: '07', title: 'Final Check', description: 'Preview' },
  ]

  const primaryLabel = (() => {
    if (isLoading) return 'Saving…'
    if (currentStep === 7) return isEditMode ? 'Save Changes' : 'Submit'
    return 'Next'
  })()

  return (
    <CreateListingWizard
      title={isViewMode ? 'View Venue' : isEditMode ? 'Edit Venue Listing' : 'Create Venue Listing'}
      breadcrumbs={breadcrumbs}
      steps={venueSteps}
      currentStep={currentStep}
      onBack={handleBack}
      primaryAction={{
        label: primaryLabel,
        onClick: handleNextStep,
      }}
    >
      {currentStep === 1 && <VenueDetailsStep venueData={venueData} setVenueData={setVenueData} />}
      {currentStep === 2 && (
        <LocationDetailsStep
          venueData={venueData}
          setVenueData={setVenueData}
          isEditMode={isEditMode}
        />
      )}
      {currentStep === 3 && (
        <SpacesStep venueData={venueData} setVenueData={setVenueData} isEditMode={isEditMode} />
      )}
      {currentStep === 4 && (
        <AmenitiesMediaStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 5 && <PricingStep venueData={venueData} setVenueData={setVenueData} />}
      {currentStep === 6 && (
        <TermsConditionsStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 7 && <FinalCheckStep venueData={venueData} />}
    </CreateListingWizard>
  )
}
