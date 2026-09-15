export type VenueOnboardingFormData = {
  name: string
  venueType: string
  venueCategoryId: string
  venueCategoryName: string
  hostingSinceYears: string
  hostingSinceMonths: string
  pocName: string
  pocContactNumber: string
  phone: string
  email: string
  aboutVenue: string
  profileImage: File | null
  coverImage: File | null
  profileImageUrl: string
  coverImageUrl: string

  address: string
  city: string
  pincode: string
  state: string
  country: string
  landmark: string
  latitude: number | null
  longitude: number | null
  parkingAvailable: boolean
  accessibility: boolean
  venueImages: File[]
  venueImageUrls: string[]

  idType: string
  idNumber: string
  hasGST: boolean
  gstNumber: string
  kycState: string
  panNumber: string
  typeOfVenue: string
  itReturnsFiledLast2Years: boolean
  gstUndertakingEmail: string
  panCard: File | null
  gstCertificate: File | null
  tradeLicense: File | null
  fssaiLicense: File | null
  gstUndertaking: File | null
  otherCertificates: File[]

  internalNotes: string
  isVerified: boolean
  isPhoneVerified?: boolean
  isEmailVerified?: boolean
}

export const VENUE_TYPE_OPTIONS = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'banquet_hall', label: 'Banquet Hall' },
  { value: 'resort', label: 'Resort' },
  { value: 'club', label: 'Club' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'convention_center', label: 'Convention Center' },
  { value: 'party_lawn', label: 'Party Lawn' },
  { value: 'pub', label: 'Pub' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'studio', label: 'Studio' },
  { value: 'sports_arena', label: 'Sports Arena' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'heritage_property', label: 'Heritage Property' },
  { value: 'unique_venue', label: 'Unique Venue' },
] as const

export const createEmptyVenueOnboardingForm = (): VenueOnboardingFormData => ({
  name: '',
  venueType: 'Venue Partner',
  venueCategoryId: '',
  venueCategoryName: '',
  hostingSinceYears: '',
  hostingSinceMonths: '0',
  pocName: '',
  pocContactNumber: '',
  phone: '',
  email: '',
  aboutVenue: '',
  profileImage: null,
  coverImage: null,
  profileImageUrl: '',
  coverImageUrl: '',

  address: '',
  city: '',
  pincode: '',
  state: 'Karnataka',
  country: 'India',
  landmark: '',
  latitude: null,
  longitude: null,
  parkingAvailable: false,
  accessibility: false,
  venueImages: [],
  venueImageUrls: [],

  idType: '',
  idNumber: '',
  hasGST: true,
  gstNumber: '',
  kycState: 'Karnataka',
  panNumber: '',
  typeOfVenue: '',
  itReturnsFiledLast2Years: true,
  gstUndertakingEmail: '',
  panCard: null,
  gstCertificate: null,
  tradeLicense: null,
  fssaiLicense: null,
  gstUndertaking: null,
  otherCertificates: [],

  internalNotes: '',
  isVerified: false,
  isPhoneVerified: false,
  isEmailVerified: false,
})

export const buildBasicProfileFormData = (
  partnerId: string,
  form: VenueOnboardingFormData,
): FormData => {
  const formData = new FormData()
  formData.append('partnerId', partnerId)
  formData.append('name', form.name)

  const resolvedVenueType =
    form.venueType && form.venueType !== 'Venue Partner' ? form.venueType : 'hotel'
  formData.append('venueType', resolvedVenueType)

  if (form.venueCategoryId) {
    formData.append('venueCategoryId', JSON.stringify([form.venueCategoryId]))
  }

  const hostingSince = toHostingSincePayload(form)
  if (hostingSince) {
    formData.append('hostingSince', JSON.stringify(hostingSince))
  }

  if (form.pocName) formData.append('pocName', form.pocName)
  if (form.pocContactNumber) formData.append('pocContactNumber', form.pocContactNumber)
  if (form.phone) formData.append('phone', form.phone)
  if (form.email) formData.append('email', form.email)
  if (form.aboutVenue) formData.append('aboutVenue', form.aboutVenue)
  if (form.profileImage) formData.append('profileImage', form.profileImage)
  if (form.coverImage) formData.append('coverImage', form.coverImage)

  return formData
}

export const buildVenuePartnerProfileFormData = (form: VenueOnboardingFormData): FormData => {
  const formData = new FormData()

  formData.append('fullname', form.name.trim())
  formData.append('email', form.email.trim())
  formData.append('phoneNumber', form.phone.trim())
  formData.append('serviceType', 'venue')

  if (form.pocName) formData.append('bio', form.pocName.trim())
  if (form.coverImage) formData.append('coverImage', form.coverImage)
  if (form.profileImage) formData.append('profileImage', form.profileImage)

  return formData
}

export const buildLocationFormData = (form: VenueOnboardingFormData): FormData => {
  const formData = new FormData()

  const location: Record<string, string | number> = {
    address: form.address,
    city: form.city,
    pincode: form.pincode,
  }

  if (form.state) location.state = form.state
  if (form.country) location.country = form.country
  if (form.landmark) location.landmark = form.landmark
  if (form.latitude != null) location.latitude = form.latitude
  if (form.longitude != null) location.longitude = form.longitude

  formData.append('location', JSON.stringify(location))
  formData.append('parkingAvailable', form.parkingAvailable ? 'true' : 'false')
  formData.append('accessibility', form.accessibility ? 'true' : 'false')
  form.venueImages.forEach((file) => formData.append('venueImages', file))

  return formData
}

export const buildKycFormData = (form: VenueOnboardingFormData): FormData => {
  const formData = new FormData()

  formData.append('idType', form.idType)
  formData.append('idNumber', form.idNumber)
  formData.append('hasGST', form.hasGST ? 'true' : 'false')
  formData.append('panNumber', form.panNumber)
  formData.append('typeOfVenue', form.typeOfVenue)

  if (form.hasGST) {
    formData.append('gstNumber', form.gstNumber)
    formData.append('state', form.kycState)
    if (form.gstCertificate) formData.append('gstCertificate', form.gstCertificate)
    if (form.fssaiLicense) formData.append('fssaiLicense', form.fssaiLicense)
  } else {
    formData.append('itReturnsFiledLast2Years', form.itReturnsFiledLast2Years ? 'true' : 'false')
    if (form.gstUndertakingEmail) {
      formData.append('gstUndertakingEmail', form.gstUndertakingEmail)
    }
    if (form.gstUndertaking) formData.append('gstUndertaking', form.gstUndertaking)
  }

  if (form.panCard) formData.append('panCard', form.panCard)
  if (form.tradeLicense) formData.append('tradeLicense', form.tradeLicense)
  form.otherCertificates.forEach((file) => formData.append('otherCertificates', file))

  return formData
}

const parseOptionalNumber = (value?: string | number | null) => {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const parseHostingSince = (value: unknown): { years?: number; months?: number } => {
  if (value == null || value === '') return {}

  if (typeof value === 'number' && Number.isFinite(value)) {
    return { years: value }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return {}
    try {
      return parseHostingSince(JSON.parse(trimmed))
    } catch {
      const parsed = Number(trimmed)
      return Number.isFinite(parsed) ? { years: parsed } : {}
    }
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const years = parseOptionalNumber(
      (record.years ?? record.year ?? record.foundingYear) as string | number | null,
    )
    const months = parseOptionalNumber(record.months as string | number | null)
    return {
      ...(years != null ? { years } : {}),
      ...(months != null ? { months } : {}),
    }
  }

  return {}
}

export const toHostingSincePayload = (form: VenueOnboardingFormData) => {
  const years = parseOptionalNumber(form.hostingSinceYears)
  if (years == null) return null
  return {
    years,
    months: parseOptionalNumber(form.hostingSinceMonths) ?? 0,
  }
}

const isCalendarYear = (years: number) => {
  const currentYear = new Date().getFullYear()
  return years >= 1900 && years <= currentYear + 1
}

export const formatHostingSince = (years?: number, months?: number) => {
  if (years == null && (months == null || months === 0)) return '-'
  if (years != null && isCalendarYear(years)) return String(years)

  const parts: string[] = []
  if (years) parts.push(`${years} Year${years === 1 ? '' : 's'}`)
  if (months) parts.push(`${months} Month${months === 1 ? '' : 's'}`)
  return parts.length > 0 ? parts.join(', ') : '-'
}

export const resolveHostingSinceLabel = (
  hostingSince?: unknown,
  formYears?: string,
  formMonths?: string,
) => {
  const parsed = parseHostingSince(hostingSince)
  const years = parsed.years ?? parseOptionalNumber(formYears) ?? undefined
  const months = parsed.months ?? parseOptionalNumber(formMonths) ?? undefined
  return formatHostingSince(years, months)
}

export const maskSensitiveValue = (value: string, visibleStart = 2, visibleEnd = 1) => {
  if (!value || value.length <= visibleStart + visibleEnd) return value
  const maskedLength = Math.max(value.length - visibleStart - visibleEnd, 4)
  return value.slice(0, visibleStart) + '*'.repeat(maskedLength) + value.slice(-visibleEnd)
}
