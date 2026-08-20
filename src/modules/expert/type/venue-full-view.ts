export interface VenueFullViewProfile {
  venueType: string | null
  clientSatisfaction: number | null
  ratings: number | null
  reviewsCount?: number | null
  totalBookings: number | null
  yearsInOperation: { years: number; months: number } | null
  totalEarnings: number | null
  primaryCity: string | null
  kycId: string | null
  kycStatus: string | null
}

export interface VenueFullViewLocation {
  latitude?: number
  longitude?: number
  address?: string
  landmark?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
}

export interface VenueFullViewInsights {
  responseTime?: string
  speed?: string
  nps?: number
  listingViews?: number
  enquiriesCount?: number
}

export interface VenueFullViewVenue {
  _id: string
  ownerId?: string
  partnerId?: string
  ownerPartnerExists?: boolean
  ownerPartnerName?: string | null
  kycId?: string
  name: string
  venueType?: string
  venueCategoryId?: Array<{ _id: string; name: string }>
  aboutVenue?: string
  location?: VenueFullViewLocation
  parkingAvailable?: boolean
  accessibility?: boolean
  inHouseCatering?: boolean
  decorationAvailable?: boolean
  status?: string
  venueStatus?: string
  isSuspend?: boolean
  currentStep?: string
  profileImageUrl?: string
  coverImageUrl?: string
  hostingSince?: { years: number; months: number }
  pocName?: string
  pocContactNumber?: string
  ratings?: number
  reviewsCount?: number
  bookingsCount?: number
  insights?: VenueFullViewInsights
  adminInternalNotes?: string | null
  adminTags?: string[]
  lastActiveAt?: string | null
  customUrl?: string | null
  customLink?: string | null
  shareUrl?: string | null
  customUsername?: string | null
  venueImages?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface VenueFullViewSpaceDetail {
  _id: string
  venueId?: string
  name: string
  spaceType?: string
  capacityMode?: string
  capacityRange?: string
  seatingStyle?: string
  areaSqFeet?: number
  guestLimit?: number
  isSameAsVenueLocation?: boolean
  location?: VenueFullViewLocation
  parkingAvailable?: boolean
  accessibility?: boolean
  inHouseCatering?: boolean
  decorationAvailable?: boolean
  status?: string
  isHidden?: boolean
  isSuspend?: boolean
  reasonFor?: string[]
  rejectionReason?: string | null
  adminNote?: string | null
}

export interface VenueFullViewGalleryImage {
  url: string
  type?: string
  _id?: string
}

export interface VenueFullViewGallery {
  _id?: string
  venueId?: string
  spaceId?: string
  venueCoverImages?: VenueFullViewGalleryImage[]
  spaceCoverImages?: VenueFullViewGalleryImage[]
  galleryImages?: VenueFullViewGalleryImage[]
  contact?: {
    contactHours?: string
    availableFor?: string
    contacts?: Array<{
      name?: string
      phone?: string
      email?: string
      _id?: string
    }>
  }
}

export interface VenueFullViewWeeklyAvailability {
  day: string
  from: string
  to: string
  _id?: string
}

export interface VenueFullViewBlockedDate {
  date: string
  from: string
  to: string
  _id?: string
}

export interface VenueFullViewAvailability {
  _id?: string
  spaceId?: string
  weeklyAvailability?: VenueFullViewWeeklyAvailability[]
  blockedDates?: VenueFullViewBlockedDate[]
}

export interface VenueFullViewTerms {
  _id?: string
  venueId?: string
  terms?: string[]
  faqs?: Array<{ question: string; answer: string; _id?: string }>
  cancellation?: {
    freeCancellationHours?: number
    refundPercentage?: number
    feeType?: 'percentage' | 'no_fee' | 'custom'
    feePercent?: number
    feeCustomAmount?: number
  }
}

export interface VenueFullViewAmenities {
  _id?: string
  venueId?: string
  spaceId?: string
  amenities?: Array<{
    categoryId: string
    category?: string | null
    subCategoryIds: string[]
    items?: Array<{
      _id: string
      name?: string | null
      image?: string | null
      icon?: string | null
      category?: string | null
    }>
    _id?: string
  }>
}

export interface VenueFullViewOverview {
  venue: VenueFullViewVenue
  space: VenueFullViewSpaceDetail | null
  gallery: VenueFullViewGallery | null
  availability: VenueFullViewAvailability | null
  terms: VenueFullViewTerms | null
  amenities: VenueFullViewAmenities | null
}

export interface VenueFullViewSpaceSummary {
  spaceId: string
  spaceName: string
  coverImage: string | null
  city: string | null
  state: string | null
  capacity: number | string | null
  weekdayPrice: number | null
  weekendPrice: number | null
  availability: VenueFullViewAvailability | null
  isHidden?: boolean
  isSuspend?: boolean
  status?: 'submitted' | 'approved' | 'rejected'
  adminNote?: string | null
  rejectionReason?: string | null
  reasonFor?: string[]
}

export interface VenueFullView {
  profile: VenueFullViewProfile
  overview: VenueFullViewOverview
  spaces: VenueFullViewSpaceSummary[]
  ownerPartnerExists?: boolean
}

export interface VenueFullViewResponse {
  success: boolean
  message: string
  data: VenueFullView
}
