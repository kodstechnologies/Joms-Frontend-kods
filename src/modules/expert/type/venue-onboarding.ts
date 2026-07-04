import type { VenueCategory } from './venue'

export type HostingSince = {
  years: number
  months: number
}

export type VenueOnboardingLocation = {
  address: string
  city: string
  pincode: string
  latitude?: number
  longitude?: number
  landmark?: string
  state?: string
  country?: string
}

export type VenueOnboardingBasicProfile = {
  _id: string
  ownerId: string
  name: string
  venueType: string
  venueCategoryId: string[]
  aboutVenue?: string
  hostingSince?: HostingSince
  pocName?: string
  pocContactNumber?: string
  profileImageUrl?: string
  coverImageUrl?: string
  status: string
  venueStatus?: string
  currentStep?: string
  location?: VenueOnboardingLocation
  venueImages?: string[]
}

export type VenueOnboardingKyc = {
  _id: string
  governmentId?: {
    idType: string
    idNumber: string
  }
  businessKyc?: {
    hasGST?: boolean
    gstNumber?: string
    state?: string
    panNumber?: string
    typeOfVenue?: string
    itReturnsFiledLast2Years?: boolean
    gstUndertakingEmail?: string
    panCard?: string
    gstCertificate?: string
    tradeLicense?: string
    fssaiLicense?: string
    otherCertificates?: string[]
    gstUndertaking?: string
    gstUndertakingDocument?: string
  }
  status?: string
  currentStep?: string
}

export type VenueOnboardingReviewVenue = {
  _id: string
  ownerId?: string
  name: string
  venueType: string
  venueCategoryId?: Array<VenueCategory | string>
  hostingSince?: HostingSince
  pocName?: string
  pocContactNumber?: string
  phone?: string
  email?: string
  profileImageUrl?: string
  coverImageUrl?: string
  location?: VenueOnboardingLocation
  venueImages?: string[]
  kycId?: string
  status?: string
  currentStep?: string
  adminInternalNotes?: string | null
}

export type VenueOnboardingReviewResponse = {
  success: boolean
  message: string
  data: {
    venue: VenueOnboardingReviewVenue
    kyc: VenueOnboardingKyc | null
  }
}

export type VenueOnboardingBasicProfileResponse = {
  success: boolean
  message: string
  data: VenueOnboardingBasicProfile
}

export type VenueOnboardingLocationResponse = {
  success: boolean
  message: string
  data: VenueOnboardingBasicProfile
}

export type VenueOnboardingKycResponse = {
  success: boolean
  message: string
  data: {
    venue: {
      _id: string
      name: string
      venueType: string
      kycId?: string
      status: string
    }
    kyc: VenueOnboardingKyc
  }
}

export type VenueOnboardingCreateAccountResponse = {
  success: boolean
  message: string
  data: {
    venue: {
      _id: string
      name: string
      status: string
      venueStatus?: string
      currentStep?: string
      kycId?: string
      adminInternalNotes?: string
    }
    kyc: {
      _id: string
      status: string
      approvedAt?: string
      adminNote?: string
      currentStep?: string
    }
  }
}
