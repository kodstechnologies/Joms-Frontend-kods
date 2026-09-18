import {
  normalizeGovernmentIdNumber,
  normalizePanNumber,
  validateGovernmentIdNumber,
  validateGovernmentIdType,
  validateGstNumber,
  validatePanNumber,
} from '@/shared/lib/partner-field-validation'
import { validateMobileNumber } from '@/shared/lib/phone'

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
  kycDocuments: Record<string, File | null>
  kycDocumentUrls: Record<string, string>
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

export const VENUE_KYC_DOCUMENT_KEYS = [
  'panCard',
  'gstCertificate',
  'businessRegistration',
  'tradeLicense',
  'propertyLeaseAgreement',
  'authorizedSignatoryId',
  'occupancyCertificate',
  'fireNoc',
  'wifiCompliance',
  'structuralStabilityCert',
  'culturalPermission',
  'publicAssemblyLicense',
  'seatingCapacityCert',
  'sportsSafetyCert',
  'publicLiabilityInsurance',
  'fssaiLicense',
  'gstUndertakingDocument',
  'gstUndertaking',
] as const

export type VenueKycDocumentRule = {
  key: string
  label: string
  required?: boolean
  requiredIfGstEnabled?: boolean
}

export type VenueDocumentRules = {
  categoryName?: string
  mandatoryDocuments?: VenueKycDocumentRule[]
  conditionalDocuments?: VenueKycDocumentRule[]
}

const GST_DOCUMENT_KEYS = new Set(['gstCertificate', 'gstUndertakingDocument', 'gstUndertaking'])

const isGstKycDocument = (doc: VenueKycDocumentRule) =>
  GST_DOCUMENT_KEYS.has(doc.key) || Boolean(doc.requiredIfGstEnabled)

export const isVenueKycDocumentRequired = (doc: VenueKycDocumentRule, hasGST: boolean) => {
  if (isGstKycDocument(doc)) {
    return hasGST === true
  }
  return doc.required !== false
}

export const getVenueKycUploadSections = (rules?: VenueDocumentRules | null, hasGST = true) => {
  const keepVisible = (docs: VenueKycDocumentRule[]) =>
    hasGST ? docs : docs.filter((doc) => !isGstKycDocument(doc))

  return {
    mandatory: keepVisible([...(rules?.mandatoryDocuments || [])]),
    conditional: keepVisible([...(rules?.conditionalDocuments || [])]),
    categoryName: rules?.categoryName || '',
  }
}

export const hasVenueKycDocument = (
  form: Pick<VenueOnboardingFormData, 'kycDocuments' | 'kycDocumentUrls'>,
  key: string,
) => {
  if (form.kycDocuments[key]) return true
  if (form.kycDocumentUrls[key]) return true
  if (key === 'gstUndertakingDocument') {
    return Boolean(form.kycDocuments.gstUndertaking || form.kycDocumentUrls.gstUndertaking)
  }
  if (key === 'gstUndertaking') {
    return Boolean(
      form.kycDocuments.gstUndertakingDocument || form.kycDocumentUrls.gstUndertakingDocument,
    )
  }
  return false
}

export const missingRequiredVenueKycDocument = (
  form: VenueOnboardingFormData,
  rules?: VenueDocumentRules | null,
) => {
  const { mandatory } = getVenueKycUploadSections(rules, form.hasGST)
  const requiredDocs = [...mandatory]
  if (!requiredDocs.some((doc) => doc.key === 'panCard')) {
    requiredDocs.unshift({ key: 'panCard', label: 'PAN Card', required: true })
  }
  return (
    requiredDocs.find(
      (doc) => isVenueKycDocumentRequired(doc, form.hasGST) && !hasVenueKycDocument(form, doc.key),
    ) || null
  )
}

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
  kycDocuments: {},
  kycDocumentUrls: {},
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

export const buildVenuePartnerProfileFormData = (
  form: VenueOnboardingFormData,
  creator?: { name?: string | null; kind?: 'superadmin' | 'subadmin' | null } | null,
): FormData => {
  const formData = new FormData()

  formData.append('fullname', form.name.trim())
  formData.append('email', form.email.trim())
  formData.append('phoneNumber', form.phone.trim())
  formData.append('serviceType', 'venue')
  formData.append('createdBy', 'Admin')
  if (creator?.name?.trim()) {
    formData.append('createdByName', creator.name.trim())
  }
  if (creator?.kind) {
    formData.append('createdByKind', creator.kind)
  }

  const serviceCategory = [form.venueCategoryId, form.venueCategoryName].filter(Boolean)
  if (serviceCategory.length > 0) {
    formData.append('serviceCategory', JSON.stringify(serviceCategory))
  }

  if (form.pocName) formData.append('bio', form.pocName.trim())
  if (form.coverImage) formData.append('coverImage', form.coverImage)
  if (form.profileImage) formData.append('profileImage', form.profileImage)

  return formData
}

const urlToVenueImageFile = async (url: string, index: number): Promise<File> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load venue image ${index + 1}`)
  }
  const blob = await response.blob()
  const extensionFromType = blob.type?.split('/')[1]?.split(';')[0]
  const extensionFromUrl = url.split('?')[0]?.split('.').pop()?.toLowerCase()
  const extension = extensionFromType || extensionFromUrl || 'jpg'
  return new File([blob], `venue-image-${index + 1}.${extension}`, {
    type: blob.type || 'image/jpeg',
  })
}

export const buildLocationFormData = async (form: VenueOnboardingFormData): Promise<FormData> => {
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

  // Re-upload whatever is currently shown: saved URLs + newly picked files.
  const existingFiles = await Promise.all(
    form.venueImageUrls.filter(Boolean).map((url, index) => urlToVenueImageFile(url, index)),
  )
  const allImages = [...existingFiles, ...form.venueImages].slice(0, 3)
  allImages.forEach((file) => formData.append('venueImages', file))

  return formData
}

export const buildKycFormData = (form: VenueOnboardingFormData): FormData => {
  const formData = new FormData()

  formData.append('idType', form.idType)
  formData.append('idNumber', normalizeGovernmentIdNumber(form.idType, form.idNumber))
  formData.append('hasGST', form.hasGST ? 'true' : 'false')
  formData.append(
    'panNumber',
    normalizePanNumber(
      form.idType.toLowerCase() === 'pan' ? form.idNumber || form.panNumber : form.panNumber,
    ),
  )
  formData.append('typeOfVenue', form.typeOfVenue)

  if (form.hasGST) {
    formData.append('gstNumber', form.gstNumber)
    formData.append('state', form.kycState)
  } else {
    formData.append('itReturnsFiledLast2Years', form.itReturnsFiledLast2Years ? 'true' : 'false')
    if (form.gstUndertakingEmail) {
      formData.append('gstUndertakingEmail', form.gstUndertakingEmail)
    }
  }

  Object.entries(form.kycDocuments).forEach(([key, file]) => {
    if (!file) return
    if (!form.hasGST && GST_DOCUMENT_KEYS.has(key)) return
    formData.append(key, file)
  })
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

export const extractKycDocumentUrls = (businessKyc?: Record<string, unknown> | null) => {
  const urls: Record<string, string> = {}
  if (!businessKyc) return urls

  for (const key of VENUE_KYC_DOCUMENT_KEYS) {
    const value = businessKyc[key]
    if (typeof value === 'string' && value.trim()) {
      urls[key] = value
    }
  }

  if (urls.gstUndertakingDocument && !urls.gstUndertaking) {
    urls.gstUndertaking = urls.gstUndertakingDocument
  }
  if (urls.gstUndertaking && !urls.gstUndertakingDocument) {
    urls.gstUndertakingDocument = urls.gstUndertaking
  }

  return urls
}

export type VenueOnboardingFieldErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const getVenueOnboardingStepErrors = (
  step: number,
  form: VenueOnboardingFormData,
  documentRules?: VenueDocumentRules | null,
): VenueOnboardingFieldErrors => {
  const errors: VenueOnboardingFieldErrors = {}

  if (step === 1) {
    if (!form.name.trim()) errors.name = 'Venue name is required.'
    if (!form.venueCategoryId) errors.venueCategoryId = 'Category is required.'

    const phoneError = validateMobileNumber(form.phone)
    if (phoneError) errors.phone = phoneError
    else if (!form.isPhoneVerified) errors.phone = 'Please verify the phone number.'

    if (!form.email.trim()) {
      errors.email = 'Email ID is required.'
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.'
    } else if (!form.isEmailVerified) {
      errors.email = 'Please verify the email ID.'
    }
  }

  if (step === 2) {
    if (!form.address.trim()) errors.address = 'Address is required.'
    if (!form.city.trim()) errors.city = 'City is required.'
    if (!form.pincode.trim()) errors.pincode = 'Pin code is required.'

    const imageCount = form.venueImages.length + form.venueImageUrls.length
    if (imageCount === 0) errors.venueImages = 'At least one venue image is required.'
    else if (imageCount > 3) errors.venueImages = 'A maximum of 3 venue images are allowed.'
  }

  if (step === 3) {
    const idTypeError = validateGovernmentIdType(form.idType)
    if (idTypeError) errors.idType = idTypeError
    const idNumberError = validateGovernmentIdNumber(form.idType, form.idNumber)
    if (idNumberError) errors.idNumber = idNumberError

    const panSource =
      form.idType.trim().toLowerCase() === 'pan' ? form.idNumber || form.panNumber : form.panNumber
    const panError = validatePanNumber(panSource)
    if (panError) errors.panNumber = panError
    if (!form.typeOfVenue) errors.typeOfVenue = 'Type of venue is required.'

    if (form.hasGST) {
      const gstError = validateGstNumber(form.gstNumber)
      if (gstError) errors.gstNumber = gstError
      if (!form.kycState.trim()) errors.kycState = 'State is required when GST is available.'
    }

    if (form.typeOfVenue) {
      if (!documentRules) {
        errors.kycDocuments =
          'Unable to load document requirements for this venue type. Please try again.'
      } else {
        const { mandatory } = getVenueKycUploadSections(documentRules, form.hasGST)
        const requiredDocs = [...mandatory]
        if (!requiredDocs.some((doc) => doc.key === 'panCard')) {
          requiredDocs.unshift({ key: 'panCard', label: 'PAN Card', required: true })
        }
        for (const doc of requiredDocs) {
          if (isVenueKycDocumentRequired(doc, form.hasGST) && !hasVenueKycDocument(form, doc.key)) {
            errors[`kyc:${doc.key}`] = `${doc.label} is required.`
          }
        }
      }
    }
  }

  if (step === 4 && !form.isVerified) {
    errors.isVerified = 'Please confirm verification before creating the account.'
  }

  return errors
}

export const getVenueOnboardingStepError = (
  step: number,
  form: VenueOnboardingFormData,
  documentRules?: VenueDocumentRules | null,
) => Object.values(getVenueOnboardingStepErrors(step, form, documentRules))[0] ?? null
