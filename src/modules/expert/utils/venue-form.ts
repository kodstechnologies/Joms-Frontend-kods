export type WeeklyAvailabilityEntry = {
  day: string
  from: string
  to: string
  enabled: boolean
}

export type BlockedDateEntry = {
  date: string
  from: string
  to: string
}

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const createDefaultWeeklyAvailability = (): WeeklyAvailabilityEntry[] =>
  WEEK_DAYS.map((day) => ({
    day,
    from: '09:00',
    to: '18:00',
    enabled: day !== 'Saturday' && day !== 'Sunday',
  }))

export type VenueAmenitySelection = {
  categoryId: string
  subCategoryId: string
  name: string
  image: string
}

export type AmenityMediaFields = {
  image?: string | null
  icon?: string | null
  icon3D?: string | null
  vectorIcon?: string | null
  name?: string | null
  _id?: string
  id?: string
}

export const resolveAmenityMediaUrl = (item?: AmenityMediaFields | null) =>
  item?.image || item?.icon || item?.icon3D || item?.vectorIcon || null

const toAmenityId = (value: unknown) => {
  if (value == null) return ''
  if (typeof value === 'object' && value && '_id' in value) {
    return String((value as { _id?: unknown })._id || '')
  }
  return String(value)
}

export const mapVenueAmenitySelections = (
  source?: Array<Record<string, unknown>> | Record<string, unknown> | null,
): VenueAmenitySelection[] => {
  const docs = !source ? [] : Array.isArray(source) ? source : [source]

  return docs.flatMap((doc) => {
    const groups = (doc?.amenities as Array<Record<string, unknown>> | undefined) || []
    return groups.flatMap((group) => {
      const categoryId = toAmenityId(group.categoryId)
      const items = (group.items as Array<Record<string, unknown>> | undefined) || []
      if (items.length > 0) {
        return items.map((item) => ({
          categoryId,
          subCategoryId: toAmenityId(item._id),
          name: String(item.name || ''),
          image: String(resolveAmenityMediaUrl(item as AmenityMediaFields) || ''),
        }))
      }

      const subs = (group.subCategoryIds || group.subCategories || []) as unknown[]
      return subs.map((sub) => {
        if (sub && typeof sub === 'object') {
          const rec = sub as Record<string, unknown>
          return {
            categoryId,
            subCategoryId: toAmenityId(rec._id),
            name: String(rec.name || ''),
            image: String(resolveAmenityMediaUrl(rec as AmenityMediaFields) || ''),
          }
        }
        return {
          categoryId,
          subCategoryId: String(sub || ''),
          name: '',
          image: '',
        }
      })
    })
  })
}

export type VenueFormData = {
  venueName: string
  venueType: string
  venueCategory: string
  aboutVenue: string
  address: string
  landmark: string
  city: string
  pincode?: string
  state?: string
  country?: string
  latitude: number | null
  longitude: number | null
  parkingAvailable: boolean
  accessibility: boolean
  spaceName: string
  spaceType: string
  capacity: string
  areaSqFt: string
  guestCount: string
  seatingType: string
  locationType: string
  spaceAddress: string
  spaceLandmark: string
  spaceCity: string
  spacePincode?: string
  spaceState?: string
  spaceCountry?: string
  spaceLatitude: number | null
  spaceLongitude: number | null
  capacityType: string
  seatedCapacity: string
  standingCapacity: string
  inHouseCatering: boolean
  decorationAvailable: boolean
  amenities: Array<{
    categoryId: string
    subCategoryId: string
    name: string
    image: string
  }>
  serviceType: string
  setDays: string
  weekdayPrice: string
  weekendPrice: string
  discount: string
  reservationFee: string
  terms: string
  cancellationPolicy: string
  refundPercentage: string
  faqs: { question: string; answer: string }[]
  contacts: { name: string; phone: string; email: string }[]
  venueCoverImage: File | null
  venueImage: File | null
  galleryImages: File[]
  venueCoverImageUrl: string
  venueImageUrl: string
  galleryImageUrls: string[]
  galleryPreviews: string[]
  weeklyAvailability: WeeklyAvailabilityEntry[]
  blockedDates: BlockedDateEntry[]
}

export const createEmptyVenueFormData = (): VenueFormData => ({
  venueName: '',
  venueType: '',
  venueCategory: '',
  aboutVenue: '',
  address: '',
  landmark: '',
  city: '',
  pincode: '',
  state: '',
  country: '',
  latitude: null,
  longitude: null,
  parkingAvailable: false,
  accessibility: false,
  spaceName: '',
  spaceType: '',
  capacity: '',
  areaSqFt: '',
  guestCount: '',
  seatingType: '',
  locationType: 'same',
  spaceAddress: '',
  spaceLandmark: '',
  spaceCity: '',
  spacePincode: '',
  spaceState: '',
  spaceCountry: '',
  spaceLatitude: null,
  spaceLongitude: null,
  capacityType: 'seated',
  seatedCapacity: '',
  standingCapacity: '',
  inHouseCatering: false,
  decorationAvailable: false,
  amenities: [],
  serviceType: 'entire_space',
  setDays: '',
  weekdayPrice: '',
  weekendPrice: '',
  discount: '',
  reservationFee: '',
  terms: '',
  cancellationPolicy: '',
  refundPercentage: '',
  faqs: [{ question: '', answer: '' }],
  contacts: [{ name: '', phone: '', email: '' }],
  venueCoverImage: null,
  venueImage: null,
  galleryImages: [],
  venueCoverImageUrl: '',
  venueImageUrl: '',
  galleryImageUrls: [],
  galleryPreviews: [],
  weeklyAvailability: createDefaultWeeklyAvailability(),
  blockedDates: [],
})

export const mapCurrentStepToUiStep = (currentStep?: string): number => {
  switch (currentStep) {
    case 'venue_details':
      return 1
    case 'location':
      return 2
    case 'spaces':
      return 3
    case 'gallery':
      return 4
    case 'pricing':
      return 5
    case 'amenities':
      return 6
    case 'contact':
    case 'submitted':
    case 'completed':
      return 7
    default:
      return 1
  }
}

const cancellationHoursMap: Record<string, number> = {
  '7days': 168,
  '48hrs': 48,
  '24hrs': 24,
  '12hrs': 12,
}

export const mapCancellationPolicyToHours = (policy: string) => cancellationHoursMap[policy] ?? 48

const reverseCancellationHoursMap: Record<number, string> = {
  168: '7days',
  48: '48hrs',
  24: '24hrs',
  12: '12hrs',
}

export const mapHoursToCancellationPolicy = (hours?: number) =>
  reverseCancellationHoursMap[hours ?? 48] ?? '48hrs'

export const mapSpaceTypeToApi = (spaceType: string) => {
  if (spaceType === 'restaurant') return 'restaurant'
  return 'auditorium'
}

export const mapSpaceTypeFromApi = (spaceType?: string) => spaceType || ''

export const mapDraftToVenueFormData = (
  draft: Record<string, unknown>,
  profile?: Record<string, unknown> | null,
): VenueFormData => {
  const base = createEmptyVenueFormData()
  const location = (draft.location || profile?.location || {}) as Record<string, unknown>
  const categories = (profile?.categories || draft.venueCategoryId || []) as Array<
    Record<string, unknown> | string
  >
  const firstCategory = categories[0]
  const categoryId =
    typeof firstCategory === 'object' && firstCategory !== null
      ? String(firstCategory._id || '')
      : String(firstCategory || '')

  const spaces = (profile?.spaces || []) as Array<Record<string, unknown>>
  const space = spaces[0]
  const pricing = (space?.pricing as Array<Record<string, unknown>> | undefined)?.[0]
  const terms = profile?.terms as Record<string, unknown> | undefined
  const gallery = space?.galleryContact as Record<string, unknown> | undefined
  const amenitiesDoc =
    (space?.amenities as Record<string, unknown> | undefined) ||
    (profile?.amenities as Array<Record<string, unknown>> | Record<string, unknown> | undefined)

  const amenityLabels = mapVenueAmenitySelections(amenitiesDoc)
  const spaceLocation = (space?.location || {}) as Record<string, unknown>
  const useSpaceLocation = space?.isSameAsVenueLocation === false

  return {
    ...base,
    venueName: String(draft.name || profile?.name || ''),
    venueType: String(draft.venueType || profile?.venueType || ''),
    venueCategory: categoryId,
    aboutVenue: String(draft.aboutVenue || profile?.aboutVenue || ''),
    address: String(location.address || ''),
    landmark: String(location.landmark || ''),
    city: String(location.city || ''),
    latitude: typeof location.latitude === 'number' ? location.latitude : null,
    longitude: typeof location.longitude === 'number' ? location.longitude : null,
    parkingAvailable: Boolean(draft.parkingAvailable ?? profile?.parkingAvailable ?? false),
    accessibility: Boolean(draft.accessibility ?? profile?.accessibility ?? false),
    spaceName: String(space?.name || ''),
    spaceType: mapSpaceTypeFromApi(String(space?.spaceType || '')),
    capacityType: String(space?.capacityMode || 'seated'),
    guestCount: String(space?.capacityRange || ''),
    seatingType: String(space?.seatingStyle || ''),
    areaSqFt: space?.areaSqFeet ? String(space.areaSqFeet) : '',
    seatedCapacity:
      space?.capacityMode === 'seated' && space?.capacityRange ? String(space.capacityRange) : '',
    standingCapacity:
      space?.capacityMode === 'standing' && space?.capacityRange ? String(space.capacityRange) : '',
    locationType: useSpaceLocation ? 'different' : 'same',
    spaceAddress: useSpaceLocation ? String(spaceLocation.address || '') : '',
    spaceLandmark: useSpaceLocation ? String(spaceLocation.landmark || '') : '',
    spaceCity: useSpaceLocation ? String(spaceLocation.city || '') : '',
    spacePincode: useSpaceLocation ? String(spaceLocation.pincode || '') : '',
    spaceState: useSpaceLocation ? String(spaceLocation.state || '') : '',
    spaceCountry: useSpaceLocation ? String(spaceLocation.country || '') : '',
    spaceLatitude:
      useSpaceLocation && typeof spaceLocation.latitude === 'number'
        ? spaceLocation.latitude
        : null,
    spaceLongitude:
      useSpaceLocation && typeof spaceLocation.longitude === 'number'
        ? spaceLocation.longitude
        : null,
    inHouseCatering: Boolean(space?.inHouseCatering ?? false),
    decorationAvailable: Boolean(space?.decorationAvailable ?? false),
    amenities: amenityLabels,
    serviceType: 'entire_space',
    setDays: '',
    weekdayPrice: pricing?.weekdayPrice ? String(pricing.weekdayPrice) : '',
    weekendPrice: pricing?.weekendPrice ? String(pricing.weekendPrice) : '',
    discount: pricing?.discount ? String(pricing.discount) : '',
    reservationFee: pricing?.reservationFee ? String(pricing.reservationFee) : '',
    terms: Array.isArray(terms?.terms)
      ? (terms?.terms as string[]).join('\n')
      : String(terms?.terms || ''),
    cancellationPolicy: mapHoursToCancellationPolicy(
      (terms?.cancellation as Record<string, unknown> | undefined)?.freeCancellationHours as
        number | undefined,
    ),
    refundPercentage: String(
      (terms?.cancellation as Record<string, unknown> | undefined)?.refundPercentage ?? '',
    ),
    faqs: (terms?.faqs as VenueFormData['faqs']) || base.faqs,
    contacts:
      (gallery?.contacts as VenueFormData['contacts']) ||
      (terms?.contacts as VenueFormData['contacts']) ||
      base.contacts,
    venueCoverImage: null,
    venueImage: null,
    galleryImages: [],
    venueCoverImageUrl: '',
    venueImageUrl: '',
    galleryImageUrls: [],
    weeklyAvailability: createDefaultWeeklyAvailability(),
    blockedDates: [],
  }
}

export const buildVenueGalleryPreviewsFromUrls = (urls: {
  venueCoverImageUrl?: string
  venueImageUrl?: string
  galleryImageUrls?: string[]
}) =>
  [urls.venueCoverImageUrl, urls.venueImageUrl, ...(urls.galleryImageUrls || [])].filter(
    (url): url is string => Boolean(url?.trim()),
  )

export const rebuildVenueGalleryPreviewsFromForm = (data: VenueFormData): string[] => {
  const previews: string[] = []

  if (data.venueCoverImage) {
    previews.push(URL.createObjectURL(data.venueCoverImage))
  } else if (data.venueCoverImageUrl.trim()) {
    previews.push(data.venueCoverImageUrl)
  }

  if (data.venueImage) {
    previews.push(URL.createObjectURL(data.venueImage))
  } else if (data.venueImageUrl.trim()) {
    previews.push(data.venueImageUrl)
  }

  if (data.galleryImages.length > 0) {
    previews.push(...data.galleryImages.map((file) => URL.createObjectURL(file)))
  } else {
    previews.push(...data.galleryImageUrls.filter((url) => url.trim()))
  }

  return previews
}
