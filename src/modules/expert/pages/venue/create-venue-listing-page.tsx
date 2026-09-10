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
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useVenuePublicSettings } from '@/modules/settings/hooks/use-venue-public-settings'
import {
  createDefaultWeeklyAvailability,
  createEmptyVenueFormData,
  buildVenueGalleryPreviewsFromUrls,
  mapHoursToCancellationPolicy,
  mapSpaceTypeFromApi,
  mapVenueAmenitySelections,
  type VenueFormData,
} from '../../utils/venue-form'

const parseMoneyInput = (value?: string) => {
  if (value == null || !String(value).trim()) return undefined
  const normalized = String(value).replace(/[^0-9.-]/g, '')
  if (!normalized) return undefined
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : undefined
}

const clearSpaceGalleryFields = (): Pick<
  VenueFormData,
  | 'venueCoverImage'
  | 'venueImage'
  | 'galleryImages'
  | 'venueCoverImageUrl'
  | 'venueImageUrl'
  | 'galleryImageUrls'
  | 'galleryPreviews'
> => ({
  venueCoverImage: null,
  venueImage: null,
  galleryImages: [],
  venueCoverImageUrl: '',
  venueImageUrl: '',
  galleryImageUrls: [],
  galleryPreviews: [],
})

type DraftWeeklyAvailabilityEntry = { day: string; from?: string; to?: string; enabled?: boolean }
type DraftBlockedDate = { date?: string; from?: string; to?: string }
type DraftAmenitySubCategory = { _id?: string; name?: string; image?: string } | string
type DraftAmenity = {
  categoryId?: string | { _id: string }
  subCategoryIds?: DraftAmenitySubCategory[]
  subCategories?: DraftAmenitySubCategory[]
  items?: Array<{ _id?: string; name?: string; image?: string; icon?: string }>
}
type DraftContact = { name?: string; phone?: string; email?: string }
type DraftFaq = { question?: string; answer?: string }
type DraftPricing = {
  serviceType?: string
  setDays?: number
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
  location?: {
    address?: string
    landmark?: string
    city?: string
    pincode?: string
    state?: string
    country?: string
    latitude?: number | null
    longitude?: number | null
  }
  inHouseCatering?: boolean
  decorationAvailable?: boolean
  parkingAvailable?: boolean
  accessibility?: boolean
  pricing?: DraftPricing[]
  venueCoverImages?: Array<{ url: string }>
  spaceCoverImages?: Array<{ url: string }>
  galleryImages?: Array<{ url: string }>
  galleryContact?: { contacts?: DraftContact[] }
  amenities?: { amenities?: DraftAmenity[] }
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
  location?: {
    address?: string
    landmark?: string
    city?: string
    latitude?: number
    longitude?: number
    pincode?: string
    state?: string
    country?: string
  }
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
  profileImageUrl?: string
  coverImageUrl?: string
  venueImages?: string[]
}

const toEntityId = (value?: unknown) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
    return String((value as { _id: unknown })._id || '')
  }
  if (typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    return String((value as { id: unknown }).id || '')
  }
  return String(value)
}

const extractVenueCategory = (venue?: DraftVenue) => {
  if (Array.isArray(venue?.venueCategoryId) && venue.venueCategoryId.length > 0) {
    return toEntityId(venue.venueCategoryId[0])
  }
  if (venue?.venueCategoryId) {
    return toEntityId(venue.venueCategoryId as unknown)
  }
  return (venue as unknown as { venueCategory?: string })?.venueCategory || ''
}

const toImageUrl = (img: unknown): string => {
  if (!img) return ''
  if (typeof img === 'string') return img.trim()
  if (
    typeof img === 'object' &&
    img !== null &&
    'url' in img &&
    typeof (img as { url?: unknown }).url === 'string'
  ) {
    return ((img as { url: string }).url || '').trim()
  }
  return ''
}

const resolveGalleryUrls = (space?: DraftVenueSpace, _venue?: DraftVenue) => {
  // Only use this space's gallery — never fall back to venue-level / other-space images.
  const venueCoverImageUrl = toImageUrl(space?.venueCoverImages?.[0]) || ''
  const venueImageUrl = toImageUrl(space?.spaceCoverImages?.[0]) || ''
  const spaceGalleryImgs = (space?.galleryImages || []).map(toImageUrl).filter(Boolean)

  const cleanCover = venueCoverImageUrl.split('?')[0].trim().toLowerCase()
  const cleanVenue = venueImageUrl.split('?')[0].trim().toLowerCase()

  const seen = new Set<string>()
  const allGalleryUrls: string[] = []

  for (const url of spaceGalleryImgs) {
    const clean = url.split('?')[0].trim().toLowerCase()
    if (!clean || clean === cleanCover || clean === cleanVenue || seen.has(clean)) {
      continue
    }
    seen.add(clean)
    allGalleryUrls.push(url)
  }

  const contacts =
    space?.galleryContact?.contacts && space.galleryContact.contacts.length > 0
      ? space.galleryContact.contacts
      : null

  return {
    venueCoverImageUrl,
    venueImageUrl,
    galleryImageUrls: allGalleryUrls,
    contacts: contacts
      ? contacts.map((contact) => ({
          name: contact.name || '',
          phone: contact.phone || '',
          email: contact.email || '',
        }))
      : null,
  }
}

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

  const { data: venueSettings } = useVenuePublicSettings()
  const pricingControls = venueSettings?.pricingControls
  const allowBaseRates =
    pricingControls?.hourlyRates !== false || pricingControls?.fullDayRates !== false
  const allowFullDay = pricingControls?.fullDayRates !== false
  const allowHourlyOnly =
    pricingControls?.hourlyRates !== false && pricingControls?.fullDayRates === false
  const allowWeekendPricing = Boolean(pricingControls?.weekendPricing)

  const [venueData, setVenueData] = useState<VenueFormData>(createEmptyVenueFormData)

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
        const spaces = venue?.spaces || []
        const space = spaces[0]
        const galleryUrls = resolveGalleryUrls(space, venue)
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

        if (space?._id) {
          setSpaceId(String(space._id))
        } else {
          setSpaceId(null)
        }

        setVenueData((prev) => ({
          ...prev,
          venueName: venue?.name || '',
          venueType: venue?.venueType || '',
          venueCategory: extractVenueCategory(venue),
          aboutVenue: venue?.aboutVenue || '',
          address: venue?.location?.address || '',
          landmark: venue?.location?.landmark || '',
          city: venue?.location?.city || '',
          pincode: venue?.location?.pincode || '',
          state: venue?.location?.state || '',
          country: venue?.location?.country || '',
          latitude: venue?.location?.latitude ?? null,
          longitude: venue?.location?.longitude ?? null,
          parkingAvailable: venue?.parkingAvailable ?? false,
          accessibility: venue?.accessibility ?? false,
          spaceName: isEditMode ? space?.name || '' : '',
          spaceType: isEditMode ? mapSpaceTypeFromApi(space?.spaceType) : '',
          capacityType: isEditMode ? space?.capacityMode || 'seated' : 'seated',
          guestCount: isEditMode && space?.capacityRange != null ? String(space.capacityRange) : '',
          seatingType: isEditMode ? space?.seatingStyle || '' : '',
          areaSqFt: isEditMode && space?.areaSqFeet != null ? String(space.areaSqFeet) : '',
          locationType: isEditMode && space?.isSameAsVenueLocation === false ? 'different' : 'same',
          spaceAddress:
            isEditMode && space?.isSameAsVenueLocation === false
              ? String(space?.location?.address || '')
              : '',
          spaceLandmark:
            isEditMode && space?.isSameAsVenueLocation === false
              ? String(space?.location?.landmark || '')
              : '',
          spaceCity:
            isEditMode && space?.isSameAsVenueLocation === false
              ? String(space?.location?.city || '')
              : '',
          spacePincode:
            isEditMode && space?.isSameAsVenueLocation === false
              ? String(space?.location?.pincode || '')
              : '',
          spaceState:
            isEditMode && space?.isSameAsVenueLocation === false
              ? String(space?.location?.state || '')
              : '',
          spaceCountry:
            isEditMode && space?.isSameAsVenueLocation === false
              ? String(space?.location?.country || '')
              : '',
          spaceLatitude:
            isEditMode && space?.isSameAsVenueLocation === false
              ? (space?.location?.latitude ?? null)
              : null,
          spaceLongitude:
            isEditMode && space?.isSameAsVenueLocation === false
              ? (space?.location?.longitude ?? null)
              : null,
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

          amenities: isEditMode
            ? mapVenueAmenitySelections(
                (space?.amenities as Record<string, unknown> | undefined) ||
                  (venue?.amenities as Record<string, unknown> | undefined),
              )
            : [],

          ...(isEditMode
            ? {
                venueCoverImageUrl: galleryUrls.venueCoverImageUrl || '',
                venueImageUrl: galleryUrls.venueImageUrl || '',
                galleryImageUrls: galleryUrls.galleryImageUrls,
                galleryPreviews: buildVenueGalleryPreviewsFromUrls({
                  venueCoverImageUrl: galleryUrls.venueCoverImageUrl || '',
                  venueImageUrl: galleryUrls.venueImageUrl || '',
                  galleryImageUrls: galleryUrls.galleryImageUrls,
                }),
                contacts: galleryUrls.contacts ?? prev.contacts,
              }
            : {
                ...clearSpaceGalleryFields(),
                contacts: prev.contacts,
              }),
          venueCoverImage: null,
          venueImage: null,
          galleryImages: [],

          weekdayPrice: pricing?.weekdayPrice ? String(pricing.weekdayPrice) : '',
          weekendPrice: pricing?.weekendPrice ? String(pricing.weekendPrice) : '',
          discount: pricing?.discount ? String(pricing.discount) : '',
          reservationFee: pricing?.reservationFee ? String(pricing.reservationFee) : '',
          serviceType: pricing?.serviceType || 'entire_space',
          setDays: pricing?.setDays != null ? String(pricing.setDays) : '',

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
        const message = getApiErrorMessage(err)
        if (/unauthorized|token/i.test(message)) {
          toast.error('Session expired or missing. Please log in again.')
        } else {
          toast.error(message)
        }
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
        const creatingNewSpace = !spaceId
        const result = await saveSpace.mutateAsync({ venueId, spaceId, venueData })

        const newSpaceId = result?.data?._id || result?._id || spaceId
        if (newSpaceId) setSpaceId(String(newSpaceId))

        if (creatingNewSpace) {
          setVenueData((prev) => ({
            ...prev,
            ...clearSpaceGalleryFields(),
            amenities: [],
          }))
        }

        toast.success(
          isEditMode && !creatingNewSpace
            ? 'Space updated successfully'
            : 'Space created successfully',
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

        if (venueId) {
          const refreshed = await fetchAdminDraftVenue(venueId)
          const refreshedVenue = refreshed?.data as DraftVenue | undefined
          const refreshedSpace =
            refreshedVenue?.spaces?.find((s) => String(s._id) === String(spaceId)) ||
            refreshedVenue?.spaces?.[0]
          const refreshedGalleryUrls = resolveGalleryUrls(refreshedSpace, refreshedVenue)

          setVenueData((prev) => ({
            ...prev,
            venueCoverImage: null,
            venueImage: null,
            galleryImages: [],
            venueCoverImageUrl: refreshedGalleryUrls.venueCoverImageUrl,
            venueImageUrl: refreshedGalleryUrls.venueImageUrl,
            galleryImageUrls: refreshedGalleryUrls.galleryImageUrls,
            galleryPreviews: buildVenueGalleryPreviewsFromUrls(refreshedGalleryUrls),
          }))
        }
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

        const allowWeekend = allowWeekendPricing || Boolean(parseMoneyInput(venueData.weekendPrice))
        const pricingMissing: string[] = []
        if (!venueData.serviceType?.trim()) pricingMissing.push('Service type')
        if (allowBaseRates && parseMoneyInput(venueData.weekdayPrice) == null) {
          pricingMissing.push('Weekday price')
        }
        if (allowWeekend && parseMoneyInput(venueData.weekendPrice) == null) {
          pricingMissing.push('Weekend price')
        }
        if (allowFullDay && !allowHourlyOnly && !String(venueData.setDays || '').trim()) {
          pricingMissing.push('Set days')
        }
        if (pricingMissing.length) {
          toast.error(`Missing required fields: ${pricingMissing.join(', ')}`)
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
      toast.error(getApiErrorMessage(err, 'Failed to save. Please try again.'))
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
