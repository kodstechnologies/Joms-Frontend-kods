export type ExpertWorkExperience = {
  _id?: string
  jobTitle?: string
  companyName?: string
  employmentType?: string
  startDate?: string
  endDate?: string | null
  currentlyWorking?: boolean
  description?: string
}

export type ExpertBasicProfile = {
  coverImage?: string
  profileImage?: string
  fullname?: string
  location?: string
  bio?: string
  industry?: string
  experienceYears?: number
  experienceMonths?: number
  serviceType?: string
  serviceCategory?: string[]
  offerings?: string[]
  sampleWorkLink?: string
  sampleWorkFile?: string
  phoneNumber?: string
  email?: string
}

export type ExpertProfileDetail = {
  _id: string
  fullname?: string
  phone?: string
  email?: string
  phoneVerified?: boolean
  emailVerified?: boolean
  servicetype?: string
  isBlocked?: boolean
  isDeactivated?: boolean
  basicProfile?: ExpertBasicProfile
  identityVerification?: Record<string, unknown>
  workExperience?: ExpertWorkExperience[]
  gallery?: { images?: string[] }
  finalReview?: { internalNotes?: string; isVerified?: boolean }
  subCategory?: unknown[]
  createdAt?: string
  updatedAt?: string
}

export type ExpertProfileResponse = {
  success?: boolean
  message?: string
  data: ExpertProfileDetail
  meta?: unknown
}

export type ExpertConsultationTopic = {
  _id: string
  name: string
}

export type ExpertConsultationPricing = {
  durationMinutes: number
  pricingType: string
  price: number
}

export type ExpertConsultation = {
  _id: string
  partnerId?: string
  title?: string
  topics?: ExpertConsultationTopic[]
  sessionOutline?: string
  whoItsFor?: string
  languages?: string[]
  mode?: string
  hasPreSessionRequirement?: boolean
  preSessionRequirement?: string
  hasPostSessionMessage?: boolean
  postSessionMessage?: string
  hasFollowUp?: boolean
  followUpDays?: number
  pricingOptions?: ExpertConsultationPricing[]
  status?: string
  serviceStatus?: string
  isSuspend?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ExpertConsultationsResponse = {
  success?: boolean
  data: ExpertConsultation[]
}

export type ExpertServiceCategory = {
  _id: string
  name: string
}

export type ExpertServiceSubCategory = {
  _id: string
  name: string
}

export type ExpertService = {
  _id: string
  title?: string
  category?: ExpertServiceCategory
  subCategory?: ExpertServiceSubCategory[]
  pricingType?: string
  status?: string
  submittedAt?: string
  priceStarts?: number
}

export type ExpertServicesResponse = {
  success?: boolean
  data: ExpertService[]
}
