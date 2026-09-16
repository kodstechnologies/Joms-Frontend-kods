import {
  isValidHttpUrl,
  validateGstNumber,
  validatePanNumber,
} from '@/shared/lib/partner-field-validation'
import { validateMobileNumber } from '@/shared/lib/phone'

export type ExpertWorkExperienceEntry = {
  jobTitle: string
  companyName: string
  employmentType: string
  startDate: string
  endDate: string
  currentlyWorking: boolean
  description: string
}

export type ExpertOnboardingFormData = {
  fullname: string
  location: string
  bio: string
  sampleWorkLink: string
  industry: string
  experienceYears: string
  experienceMonths: string
  serviceType: string
  serviceCategory: string[]
  offerings: string[]
  phoneNumber: string
  email: string
  coverImage: File | null
  profileImage: File | null
  sampleWorkFile: File | null
  coverImageUrl: string
  profileImageUrl: string
  sampleWorkFileName: string
  sampleWorkFileUrl: string

  idType: string
  idNumber: string
  gstAvailable: boolean
  gstNumber: string
  panNumber: string
  panCardFile: File | null
  certificateFile: File | null
  gstCertificateFile: File | null
  panCardFileName: string
  certificateFileName: string
  gstCertificateFileName: string
  panCardFileUrl: string
  certificateFileUrl: string
  gstCertificateFileUrl: string

  workExperience: ExpertWorkExperienceEntry[]

  galleryImages: File[]
  galleryPreviews: string[]

  internalNotes: string
  isVerified: boolean
  isPhoneVerified?: boolean
  isEmailVerified?: boolean
}

export const createEmptyWorkExperienceEntry = (): ExpertWorkExperienceEntry => ({
  jobTitle: '',
  companyName: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
})

export const createEmptyExpertOnboardingForm = (): ExpertOnboardingFormData => ({
  fullname: '',
  location: '',
  bio: '',
  sampleWorkLink: '',
  industry: '',
  experienceYears: '',
  experienceMonths: '',
  serviceType: '',
  serviceCategory: [],
  offerings: [],
  phoneNumber: '',
  email: '',
  coverImage: null,
  profileImage: null,
  sampleWorkFile: null,
  coverImageUrl: '',
  profileImageUrl: '',
  sampleWorkFileName: '',
  sampleWorkFileUrl: '',

  idType: '',
  idNumber: '',
  gstAvailable: true,
  gstNumber: '',
  panNumber: '',
  panCardFile: null,
  certificateFile: null,
  gstCertificateFile: null,
  panCardFileName: '',
  certificateFileName: '',
  gstCertificateFileName: '',
  panCardFileUrl: '',
  certificateFileUrl: '',
  gstCertificateFileUrl: '',

  workExperience: [createEmptyWorkExperienceEntry()],

  galleryImages: [],
  galleryPreviews: [],

  internalNotes: '',
  isVerified: false,
  isPhoneVerified: false,
  isEmailVerified: false,
})

export const buildBasicProfileFormData = (form: ExpertOnboardingFormData): FormData => {
  const formData = new FormData()

  formData.append('fullname', form.fullname.trim())
  formData.append('email', form.email.trim())
  formData.append('phoneNumber', form.phoneNumber.trim())
  formData.append('location', form.location.trim())
  formData.append('bio', form.bio.trim())
  formData.append('phoneVerified', form.isPhoneVerified ? 'true' : 'false')
  formData.append('emailVerified', form.isEmailVerified ? 'true' : 'false')

  if (form.industry) formData.append('industry', form.industry.trim())

  if (form.experienceYears !== '') {
    formData.append('experienceYears', String(Number(form.experienceYears) || 0))
  }
  if (form.experienceMonths !== '') {
    formData.append('experienceMonths', String(Number(form.experienceMonths) || 0))
  }

  formData.append('serviceType', form.serviceType)
  formData.append('serviceCategory', JSON.stringify(form.serviceCategory))

  if (form.offerings.length > 0) {
    formData.append('offerings', JSON.stringify(form.offerings))
  }

  const rawLink = form.sampleWorkLink.trim()
  const link =
    rawLink && !rawLink.startsWith('http://') && !rawLink.startsWith('https://')
      ? `https://${rawLink}`
      : rawLink
  formData.append('sampleWorkLink', link)

  if (form.coverImage) formData.append('coverImage', form.coverImage)
  if (form.profileImage) formData.append('profileImage', form.profileImage)
  if (form.sampleWorkFile) {
    formData.append('sampleWorkFile', form.sampleWorkFile)
  } else if (form.sampleWorkFileUrl) {
    formData.append('sampleWorkFile', form.sampleWorkFileUrl)
  }

  return formData
}

export const buildIdentityVerificationFormData = (form: ExpertOnboardingFormData): FormData => {
  const formData = new FormData()

  formData.append('idType', form.idType)
  formData.append('idNumber', form.idNumber.trim())
  formData.append('gstAvailable', form.gstAvailable ? 'true' : 'false')
  formData.append('panNumber', form.panNumber.trim())

  if (form.gstAvailable) {
    if (form.gstNumber) formData.append('gstNumber', form.gstNumber.trim())
    if (form.gstCertificateFile) {
      formData.append('gstCertificateFile', form.gstCertificateFile)
    }
  }

  if (form.panCardFile) formData.append('panCardFile', form.panCardFile)
  if (form.certificateFile) formData.append('certificateFile', form.certificateFile)

  return formData
}

export const buildWorkExperiencePayload = (form: ExpertOnboardingFormData) => ({
  workExperience: form.workExperience
    .filter((entry) => entry.jobTitle.trim() || entry.companyName.trim())
    .map((entry) => ({
      jobTitle: entry.jobTitle.trim(),
      companyName: entry.companyName.trim(),
      employmentType: entry.employmentType.trim(),
      startDate: entry.startDate || null,
      endDate: entry.currentlyWorking ? null : entry.endDate || null,
      currentlyWorking: entry.currentlyWorking,
      description: entry.description.trim(),
    })),
})

export const buildGalleryFormData = (form: ExpertOnboardingFormData): FormData => {
  const formData = new FormData()
  form.galleryImages.forEach((file) => formData.append('galleryImages', file))

  const existingImages = form.galleryPreviews.filter(
    (preview) =>
      typeof preview === 'string' && preview.trim().length > 0 && !preview.startsWith('blob:'),
  )
  formData.append('existingGalleryImages', JSON.stringify(existingImages))

  return formData
}

export const buildSubmitPayload = (form: ExpertOnboardingFormData) => ({
  internalNotes: form.internalNotes.trim(),
  isVerified: form.isVerified,
})

const fileNameFromUrl = (url?: string | null) => {
  if (!url) return ''
  try {
    const pathname = new URL(url).pathname
    return decodeURIComponent(pathname.split('/').pop() || '') || 'Uploaded file'
  } catch {
    return url.split('/').pop() || 'Uploaded file'
  }
}

export const mapExpertProfileToOnboardingForm = (profile: {
  fullname?: string
  phone?: string
  email?: string
  phoneVerified?: boolean
  emailVerified?: boolean
  servicetype?: string
  expertType?: string
  location?: string
  bio?: string
  experience?: string | number
  subCategory?: unknown[]
  basicProfile?: {
    coverImage?: string
    profileImage?: string
    fullname?: string
    location?: string
    bio?: string
    industry?: string
    experienceYears?: number | string
    experienceMonths?: number | string
    serviceType?: string
    serviceCategory?: unknown[]
    serviceCategoryDisplay?: string[]
    offerings?: unknown[]
    sampleWorkLink?: string
    sampleWorkFile?: string
    phoneNumber?: string
    email?: string
  }
  identityVerification?: Record<string, unknown> | null
  workExperience?: Array<{
    jobTitle?: string
    title?: string
    companyName?: string
    company?: string
    employmentType?: string
    type?: string
    startDate?: string
    endDate?: string | null
    currentlyWorking?: boolean
    isCurrent?: boolean
    description?: string
  }>
  gallery?: { images?: string[] }
  finalReview?: {
    internalNotes?: string
    isVerified?: boolean
  }
  adminNotes?: string
  isVerified?: boolean
}): ExpertOnboardingFormData => {
  const basic = profile.basicProfile || {}
  const identity = (profile.identityVerification || {}) as Record<string, unknown>

  const toCategoryValue = (item: unknown) => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      return String(obj.name || obj.title || obj._id || obj.id || '')
    }
    return ''
  }

  const rawCategories = [
    ...(Array.isArray(basic.serviceCategoryDisplay) ? basic.serviceCategoryDisplay : []),
    ...(Array.isArray(basic.serviceCategory) ? basic.serviceCategory : []),
    ...(Array.isArray(profile.subCategory) ? profile.subCategory : []),
  ]

  const serviceCategory = [...new Set(rawCategories.map(toCategoryValue).filter(Boolean))]

  const rawOfferings = Array.isArray(basic.offerings) ? basic.offerings : []
  const offerings = rawOfferings
    .map((item: unknown) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        return String(obj.name || obj.title || '')
      }
      return ''
    })
    .filter(Boolean)

  const galleryImages =
    profile.gallery?.images?.filter(Boolean) ||
    (profile as unknown as { galleryImages?: string[] }).galleryImages?.filter(Boolean) ||
    []

  const rawWork =
    profile.workExperience && profile.workExperience.length > 0
      ? profile.workExperience
      : (profile as unknown as { concierge?: { workExperience?: typeof profile.workExperience } })
          .concierge?.workExperience || []

  const workExperience =
    rawWork.length > 0
      ? rawWork.map((entry) => ({
          jobTitle: entry.jobTitle || entry.title || '',
          companyName: entry.companyName || entry.company || '',
          employmentType: entry.employmentType || entry.type || '',
          startDate: entry.startDate ? String(entry.startDate).slice(0, 10) : '',
          endDate: entry.endDate ? String(entry.endDate).slice(0, 10) : '',
          currentlyWorking: Boolean(entry.currentlyWorking ?? entry.isCurrent),
          description: entry.description || '',
        }))
      : [createEmptyWorkExperienceEntry()]

  const panCardFileUrl =
    typeof identity.panCardFile === 'string'
      ? identity.panCardFile
      : typeof identity.panCard === 'string'
        ? identity.panCard
        : typeof identity.panCardUrl === 'string'
          ? identity.panCardUrl
          : ''

  const certificateFileUrl =
    typeof identity.certificateFile === 'string'
      ? identity.certificateFile
      : typeof identity.certificate === 'string'
        ? identity.certificate
        : typeof identity.certificateUrl === 'string'
          ? identity.certificateUrl
          : ''

  const gstCertificateFileUrl =
    typeof identity.gstCertificateFile === 'string'
      ? identity.gstCertificateFile
      : typeof identity.gstCertificate === 'string'
        ? identity.gstCertificate
        : typeof identity.gstCertificateUrl === 'string'
          ? identity.gstCertificateUrl
          : ''

  return {
    ...createEmptyExpertOnboardingForm(),
    fullname: basic.fullname || profile.fullname || '',
    location: basic.location || profile.location || '',
    bio: basic.bio || profile.bio || '',
    sampleWorkLink: basic.sampleWorkLink || '',
    industry: basic.industry || '',
    experienceYears:
      basic.experienceYears != null && basic.experienceYears !== ''
        ? String(basic.experienceYears)
        : profile.experience != null && profile.experience !== ''
          ? String(profile.experience)
          : '',
    experienceMonths:
      basic.experienceMonths != null && basic.experienceMonths !== ''
        ? String(basic.experienceMonths)
        : '',
    serviceType: basic.serviceType || profile.servicetype || profile.expertType || 'concierge',
    serviceCategory,
    offerings,
    phoneNumber: basic.phoneNumber || profile.phone || '',
    email: basic.email || profile.email || '',
    coverImageUrl: basic.coverImage || '',
    profileImageUrl: basic.profileImage || '',
    sampleWorkFileName: fileNameFromUrl(basic.sampleWorkFile),
    sampleWorkFileUrl: basic.sampleWorkFile || '',

    idType: String(identity.idType || identity.id_type || ''),
    idNumber: String(identity.idNumber || identity.id_number || ''),
    gstAvailable:
      identity.gstAvailable !== false &&
      identity.hasGST !== false &&
      (Boolean(identity.gstNumber) ||
        identity.gstAvailable === true ||
        identity.hasGST === true ||
        !identity.idNumber),
    gstNumber: String(identity.gstNumber || identity.gst || ''),
    panNumber: String(identity.panNumber || identity.pan || ''),
    panCardFileUrl,
    certificateFileUrl,
    gstCertificateFileUrl,
    panCardFileName: fileNameFromUrl(panCardFileUrl),
    certificateFileName: fileNameFromUrl(certificateFileUrl),
    gstCertificateFileName: fileNameFromUrl(gstCertificateFileUrl),

    workExperience,
    galleryImages: [],
    galleryPreviews: galleryImages,

    internalNotes: profile.finalReview?.internalNotes || profile.adminNotes || '',
    isVerified: Boolean(profile.finalReview?.isVerified ?? profile.isVerified),
    isPhoneVerified: Boolean(profile.phoneVerified),
    isEmailVerified: Boolean(profile.emailVerified),
  }
}

export const formatExperience = (years?: number | string, months?: number | string) => {
  const y = Number(years) || 0
  const m = Number(months) || 0
  if (!y && !m) return 'N/A'
  const parts: string[] = []
  if (y) parts.push(`${y} Year${y === 1 ? '' : 's'}`)
  if (m) parts.push(`${m} Month${m === 1 ? '' : 's'}`)
  return parts.join(' ')
}

export type ExpertOnboardingFieldErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const getExpertOnboardingStepErrors = (
  step: number,
  form: ExpertOnboardingFormData,
  isEdit: boolean,
): ExpertOnboardingFieldErrors => {
  const errors: ExpertOnboardingFieldErrors = {}

  if (step === 1) {
    if (!form.fullname.trim()) errors.fullname = 'Full name is required.'
    else if (form.fullname.trim().length < 3) {
      errors.fullname = 'Full name must be at least 3 characters.'
    }
    if (!form.location.trim()) errors.location = 'Location is required.'
    if (!form.bio.trim()) errors.bio = 'Profile bio is required.'
    if (!form.sampleWorkLink.trim()) errors.sampleWorkLink = 'Sample work link is required.'
    else if (!isValidHttpUrl(form.sampleWorkLink)) {
      errors.sampleWorkLink = 'Sample work link must be a valid URL.'
    }
    if (!isEdit && !form.sampleWorkFile && !form.sampleWorkFileName) {
      errors.sampleWorkFile = 'Sample work file is required.'
    }

    const phoneError = validateMobileNumber(form.phoneNumber)
    if (phoneError) errors.phoneNumber = phoneError
    else if (!form.isPhoneVerified) errors.phoneNumber = 'Please verify the phone number.'

    if (!form.email.trim()) errors.email = 'Email ID is required.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.'
    } else if (!form.isEmailVerified) {
      errors.email = 'Please verify the email ID.'
    }

    if (!form.serviceType) errors.serviceType = 'Service type is required.'
    if (form.serviceCategory.length === 0) {
      errors.serviceCategory = 'At least one expert category is required.'
    }
  }

  if (step === 2) {
    if (!form.idType) errors.idType = 'ID type is required.'
    if (!form.idNumber.trim()) errors.idNumber = 'ID number is required.'
    const panError = validatePanNumber(form.panNumber)
    if (panError) errors.panNumber = panError
    if (form.gstAvailable) {
      const gstError = validateGstNumber(form.gstNumber)
      if (gstError) errors.gstNumber = gstError
    }
    if (!form.panCardFile && !form.panCardFileName) {
      errors.panCardFile = 'PAN card document is required.'
    }
    if (!form.certificateFile && !form.certificateFileName) {
      errors.certificateFile = 'Certificate / license document is required.'
    }
    if (form.gstAvailable && !form.gstCertificateFile && !form.gstCertificateFileName) {
      errors.gstCertificateFile = 'GST certificate is required.'
    }
  }

  if (step === 3) {
    const validEntries = form.workExperience.filter(
      (entry) => entry.jobTitle.trim() || entry.companyName.trim(),
    )
    if (validEntries.length === 0) {
      errors.workExperience = 'At least one work experience entry is required.'
      errors['workExperience.0.jobTitle'] = 'Job title is required.'
      errors['workExperience.0.companyName'] = 'Company name is required.'
    } else {
      form.workExperience.forEach((entry, index) => {
        const hasAny = entry.jobTitle.trim() || entry.companyName.trim()
        if (!hasAny) return
        if (!entry.jobTitle.trim()) {
          errors[`workExperience.${index}.jobTitle`] = 'Job title is required.'
        }
        if (!entry.companyName.trim()) {
          errors[`workExperience.${index}.companyName`] = 'Company name is required.'
        }
      })
    }
  }

  if (step === 4 && form.galleryPreviews.length > 5) {
    errors.galleryImages = 'A maximum of 5 images are allowed.'
  }

  if (step === 5 && !form.isVerified) {
    errors.isVerified = 'Please verify the profile before submission.'
  }

  return errors
}

export const getExpertOnboardingStepError = (
  step: number,
  form: ExpertOnboardingFormData,
  isEdit: boolean,
) => Object.values(getExpertOnboardingStepErrors(step, form, isEdit))[0] ?? null
