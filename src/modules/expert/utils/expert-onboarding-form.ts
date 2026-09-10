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

  if (form.location) formData.append('location', form.location.trim())
  if (form.bio) formData.append('bio', form.bio.trim())
  if (form.industry) formData.append('industry', form.industry.trim())

  if (form.experienceYears !== '') {
    formData.append('experienceYears', String(Number(form.experienceYears) || 0))
  }
  if (form.experienceMonths !== '') {
    formData.append('experienceMonths', String(Number(form.experienceMonths) || 0))
  }

  if (form.serviceType) formData.append('serviceType', form.serviceType)

  if (form.serviceCategory.length > 0) {
    formData.append('serviceCategory', JSON.stringify(form.serviceCategory))
  }
  if (form.offerings.length > 0) {
    formData.append('offerings', JSON.stringify(form.offerings))
  }

  if (form.sampleWorkLink) {
    const rawLink = form.sampleWorkLink.trim()
    const link =
      rawLink && !rawLink.startsWith('http://') && !rawLink.startsWith('https://')
        ? `https://${rawLink}`
        : rawLink
    formData.append('sampleWorkLink', link)
  }

  if (form.coverImage) formData.append('coverImage', form.coverImage)
  if (form.profileImage) formData.append('profileImage', form.profileImage)
  if (form.sampleWorkFile) formData.append('sampleWorkFile', form.sampleWorkFile)

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

  // Robust category extraction: handles strings, objects { name, _id }, and display arrays
  const rawCategories =
    Array.isArray(basic.serviceCategoryDisplay) && basic.serviceCategoryDisplay.length > 0
      ? basic.serviceCategoryDisplay
      : Array.isArray(basic.serviceCategory) && basic.serviceCategory.length > 0
        ? basic.serviceCategory
        : Array.isArray(profile.subCategory)
          ? profile.subCategory
          : []

  const serviceCategory = rawCategories
    .map((item: unknown) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        return String(obj.name || obj.title || obj._id || '')
      }
      return ''
    })
    .filter(Boolean)

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
    isPhoneVerified: Boolean(profile.phoneVerified ?? true),
    isEmailVerified: Boolean(profile.emailVerified ?? true),
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
