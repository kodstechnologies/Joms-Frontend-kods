export type VenueStatus =
  | 'live'
  | 'in_review'
  | 'suspended'
  | 'deleted'
  | 'pending'
  | 'rejected'

export type VenueRawStatus = 'active' | 'inactive'

export interface Venue {
  _id: string
  venueId?: string
  venueid?: string
  venueName: string
  venueCategory?: string
  spaceId?: string | null
  spaceid?: string | null
  spaceName?: string
  expertName?: string
  partnerName?: string
  ownerId?: string
  partnerId?: string
  eventType?: string
  status: VenueStatus
  venueStatus?: VenueRawStatus
  isSuspend?: boolean
  createdAt?: string
  updatedAt?: string
  city?: string
  weekdayPrice?: number
  reason?: string | null
  deletedAt?: string | null
}

export interface VenueMeta {
  counts: {
    approvalsPending: number
    reportedVenues: number
    suspendedVenues: number
    rejectedVenues: number
    deletedVenues: number
  }
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface VenueResponse {
  success: boolean
  message: string
  data: Venue[]
  meta: VenueMeta
}

export interface VenueCategory {
  _id: string
  name: string
}

export interface VenueCategoryResponse {
  success: boolean
  message: string
  data: VenueCategory[]
}

export interface VenueDraft {
  _id: string
  name: string
  venueType: string
  aboutVenue?: string
  currentStep?: string
  spaceId?: string | null
  status?: string
  location?: {
    address?: string
    landmark?: string
    city?: string
    latitude?: number
    longitude?: number
  }
  venueCategoryId?: Array<{ _id: string; name: string } | string>
  parkingAvailable?: boolean
  accessibility?: boolean
}

export interface VenueDraftResponse {
  success: boolean
  message: string
  data: VenueDraft
}

export interface VenueProfileSpace {
  _id: string
  name: string
  spaceType?: string
  capacityMode?: string
  capacityRange?: string
  seatingStyle?: string
  areaSqFeet?: number
  guestLimit?: number
  isSameAsVenueLocation?: boolean
  inHouseCatering?: boolean
  decorationAvailable?: boolean
  pricing?: Array<{
    weekdayPrice?: number
    weekendPrice?: number
    discount?: number
    reservationFee?: number
  }>
  galleryContact?: {
    contacts?: Array<{ name: string; phone: string; email: string }>
  }
}

export interface VenueProfile {
  _id: string
  name: string
  venueType: string
  aboutVenue?: string
  currentStep?: string
  status?: string
  location?: VenueDraft['location']
  parkingAvailable?: boolean
  accessibility?: boolean
  categories?: VenueCategory[]
  spaces?: VenueProfileSpace[]
  terms?: {
    terms?: string[] | string
    faqs?: Array<{ question: string; answer: string }>
    cancellation?: {
      freeCancellationHours?: number
      refundPercentage?: number
    }
  }
  amenities?: Array<{
    amenities?: Array<{ categoryId: string; subCategoryIds: string[] }>
  }>
  gallery?: Array<{
    venueCoverImages?: Array<{ url: string }>
    spaceCoverImages?: Array<{ url: string }>
    galleryImages?: Array<{ url: string; type?: string }>
  }>
  profileImageUrl?: string
  coverImageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface VenueProfileResponse {
  success: boolean
  message: string
  data: VenueProfile
}

export interface VenueDetail {
  _id: string
  name?: string
  venueName?: string
  venueType: string
  venueCategory?: string
  venueCategoryId?: VenueCategory[]
  categories?: VenueCategory[]
  aboutVenue: string
  address?: string
  landmark?: string
  city?: string
  location?: VenueDraft['location']
  parkingAvailable: boolean
  accessibility: boolean
  spaces?: VenueProfileSpace[]
  spaceName?: string
  spaceType?: string
  seatedCapacity?: number
  standingCapacity?: number
  areaSqFt?: number
  amenities?: unknown
  pricing?: Array<{
    weekdayPrice?: number
    weekendPrice?: number
    discount?: number
  }>
  terms?: VenueProfile['terms']
  gallery?: VenueProfile['gallery']
  images?: string[]
  status: string
  currentStep?: string
  createdAt: string
  updatedAt: string
  expertName?: string
  partnerName?: string
  ownerId?: string
  profileImageUrl?: string
  coverImageUrl?: string
}

export interface VenueDetailResponse {
  success: boolean
  message: string
  data: VenueDetail
  meta: null | Record<string, unknown>
}
