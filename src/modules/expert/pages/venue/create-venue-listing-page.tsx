import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

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
import { mapHoursToCancellationPolicy } from '../../utils/venue-form'

export const CreateVenueListingPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const venueId = searchParams.get('venueId')
  const isViewMode = searchParams.get('view') === 'true'

  const [currentStep, setCurrentStep] = useState(1)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    saveVenueDetails,
    saveLocation,
    saveSpace,
    saveAmenitiesAndMedia,
    savePricing,
    saveTerms,
    submitVenueListing,
  } = useVenueStepMutations()

  const [venueData, setVenueData] = useState({
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
      name: string; phone: string; email: string
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
      question: string; answer: string
    }[],
  })
  useEffect(() => {
    if (!venueId) return

    const loadVenue = async () => {
      try {
        const response = await fetchAdminDraftVenue(venueId)
        const venue = response?.data
        const gallery = venue?.gallery
        const spaces = (venue?.spaces || []) as any[]
        const space = spaces[0]
        const pricing = space?.pricing?.[0] ?? venue?.pricing?.[0]
        const terms = venue?.terms

        if (space?._id) setSpaceId(String(space._id))
        setVenueData(prev => ({
          ...prev,
          venueName: venue?.name || '',
          venueType: venue?.venueType || '',
          venueCategory: venue?.venueCategoryId?.[0]?._id
            || venue?.venueCategoryId?.[0]
            || '',
          aboutVenue: venue?.aboutVenue || '',
          address: venue?.location?.address || '',
          landmark: venue?.location?.landmark || '',
          city: venue?.location?.city || '',
          parkingAvailable: venue?.parkingAvailable ?? false,
          accessibility: venue?.accessibility ?? false,
          spaceName: '',
          spaceType: '',
          capacityType: 'seated',
          guestCount: '',
          seatingType: '',
          areaSqFt: '',
          locationType: 'same',
          inHouseCatering: false,
          decorationAvailable: false,

          amenities: Array.isArray(venue?.amenities?.amenities)
            ? venue.amenities.amenities.flatMap((amenity: any) => {
              return (amenity.subCategories || []).map(
                (subCategory: any) => ({
                  categoryId: amenity.categoryId,
                  subCategoryId: subCategory._id,
                  name: subCategory.name || '',
                  image: subCategory.image || '',
                }),
              )
            })
            : [],

          venueCoverImageUrl: gallery?.venueCoverImages?.[0]?.url || '',
          venueImageUrl: gallery?.spaceCoverImages?.[0]?.url || '',
          galleryImageUrls: (gallery?.galleryImages || []).map(
            (img: { url: string }) => img.url,
          ),
          contacts:
            gallery?.contact?.contacts?.length > 0
              ? gallery.contact.contacts.map((contact: any) => ({
                name: contact.name || '',
                phone: contact.phone || '',
                email: contact.email || '',
              }))
              : [{ name: '', phone: '', email: '' }],


          weekdayPrice: pricing?.weekdayPrice ? String(pricing.weekdayPrice) : '',
          weekendPrice: pricing?.weekendPrice ? String(pricing.weekendPrice) : '',
          discount: pricing?.discount ? String(pricing.discount) : '',
          reservationFee: pricing?.reservationFee ? String(pricing.reservationFee) : '',


          terms: Array.isArray(terms?.terms)
            ? terms.terms.join('\n')
            : String(terms?.terms || ''),
          cancellationPolicy: mapHoursToCancellationPolicy(
            terms?.cancellation?.freeCancellationHours,
          ),
          refundPercentage: String(terms?.cancellation?.refundPercentage ?? '0'),
          faqs:
            terms?.faqs?.length > 0
              ? terms.faqs.map((faq: any) => ({
                question: faq.question || '',
                answer: faq.answer || '',
              }))
              : [{ question: '', answer: '' }],
        }))
      } catch (err) {
        console.error('Failed to load venue draft', err)
      }
    }

    loadVenue()
  }, [venueId])


  const handleNextStep = async () => {
    setError(null)
    try {
      if (currentStep === 1 && venueId) {
        await saveVenueDetails.mutateAsync({ venueId, venueData })
      }

      if (currentStep === 2 && venueId) {
        await saveLocation.mutateAsync({ venueId, venueData })
      }

      if (currentStep === 3 && venueId) {
        const result = await saveSpace.mutateAsync({ venueId, venueData })

        const newSpaceId = result?.data?._id || result?._id
        if (newSpaceId) setSpaceId(String(newSpaceId))
      }

      if (currentStep === 4 && venueId && spaceId) {
        await saveAmenitiesAndMedia.mutateAsync({ venueId, spaceId, venueData })
      }

      if (currentStep === 5 && spaceId) {
        await savePricing.mutateAsync({ spaceId, venueData })
      }

      if (currentStep === 6 && venueId) {
        await saveTerms.mutateAsync({ venueId, venueData })
      }

      if (currentStep === 7 && venueId) {
        await submitVenueListing.mutateAsync(venueId)

        navigate('/venues/management')

        return
      }
      setCurrentStep(prev => Math.min(prev + 1, 7))
    } catch (err: any) {
      console.error('Step save failed', err)
      setError(err?.response?.data?.message || 'Failed to save. Please try again.')
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

  const breadcrumbs = [
    { label: 'Expert Management' },
    { label: 'Venue Management' },
    { label: isViewMode ? 'View Venue' : 'Create Venue', isActive: true },
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

  return (
    <CreateListingWizard
      title={isViewMode ? 'View Venue' : 'Create Venue Listing'}
      breadcrumbs={breadcrumbs}
      steps={venueSteps}
      currentStep={currentStep}
      onBack={() => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1)
      }}
      primaryAction={{
        label: isLoading ? 'Saving…' : currentStep === 7 ? 'Submit' : 'Next',
        onClick: handleNextStep,
      }}
    >

      {error && (
        <div className="mx-auto mb-4 max-w-4xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <VenueDetailsStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 2 && (
        <LocationDetailsStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 3 && (
        <SpacesStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 4 && (
        <AmenitiesMediaStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 5 && (
        <PricingStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 6 && (
        <TermsConditionsStep venueData={venueData} setVenueData={setVenueData} />
      )}
      {currentStep === 7 && (
        <FinalCheckStep venueData={venueData} />
      )}
    </CreateListingWizard>
  )
}
