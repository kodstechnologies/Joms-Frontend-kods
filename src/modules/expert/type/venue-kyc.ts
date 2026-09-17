export type VenueKycStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ApplicationHeader {
  applicationId: string
  partnerId: string | null
  applicantName: string | null
  appliedAt: string | null
  submittedAt: string | null
  lastUpdatedAt: string | null
  kycStatus: VenueKycStatus
  kycStatusLabel: string
  bankingStatus: VenueKycStatus
  bankingStatusLabel: string
}

export interface ApplicationApplicant {
  fullName: string | null
  email: string | null
  phone: string | null
  emailVerified: boolean | null
  phoneVerified: boolean | null
  serviceType: string | null
  currentRole?: string | null
  serviceCategory?: string | null
}

export interface ApplicationVenue {
  venueName: string | null
  venueType: string | null
  address: string | null
  city: string | null
  pincode: string | null
  location: { lat: number; lng: number } | null
}

export interface ApplicationOverview {
  applicant: ApplicationApplicant
  venue: ApplicationVenue
  venueImages: string[]
  applicationNotes: string | null
}

export interface ApplicationKycCompliance {
  itReturnsFiledLast2Years: boolean | null
  undertakingSigned: boolean | null
  gstUndertakingEmail: string | null
  gstUndertakingDocument: string | null
}

export interface ApplicationKycDocuments {
  panCard: string | null
  gstCertificate: string | null
  businessRegistration?: string | null
  tradeLicense?: string | null
  propertyLeaseAgreement?: string | null
  authorizedSignatoryId?: string | null
  occupancyCertificate?: string | null
  fireNoc?: string | null
  wifiCompliance?: string | null
  structuralStabilityCert?: string | null
  culturalPermission?: string | null
  publicAssemblyLicense?: string | null
  seatingCapacityCert?: string | null
  sportsSafetyCert?: string | null
  publicLiabilityInsurance?: string | null
  fssaiLicense?: string | null
  gstUndertakingDocument?: string | null
  otherCertificates?: string[]
  otherDocuments?: string[]
  [key: string]: unknown
}

export type VenueDocumentReviewEntry = {
  status?: VenueKycStatus
  reasonFor?: string[]
  rejectionReason?: string | null
  adminNote?: string | null
  reviewedAt?: string | null
}

export type VenueDocumentReviewsMap = Record<string, VenueDocumentReviewEntry>

export interface ApplicationKycDetails {
  individualOrOrgName: string | null
  address: string | null
  state: string | null
  panNumber: string | null
  venueType: string | null
  governmentId: { idType: string | null; idNumber: string | null } | null
  hasGST: boolean | null
  gstNumber: string | null
  compliance: ApplicationKycCompliance
  documents: ApplicationKycDocuments
  documentReviews?: VenueDocumentReviewsMap
  status: VenueKycStatus
  reasonFor: string[]
  rejectionReason: string | null
  adminNote: string | null
  approvedAt: string | null
  rejectedAt: string | null
}

export interface ApplicationBankingAccount {
  beneficiaryName: string | null
  accountType: string | null
  bankName: string | null
  accountNumber: string | null
  ifscCode: string | null
  nameMatchScore?: number | string | null
  providedName?: string | null
}

export interface ApplicationBankingDetails {
  account: ApplicationBankingAccount
  cancelledCheque: string | null
  documentReviews?: VenueDocumentReviewsMap
  status: VenueKycStatus
  reasonFor: string[]
  rejectionReason: string | null
  adminNote: string | null
  approvedAt: string | null
  rejectedAt: string | null
}

export interface ApplicationDetails {
  header: ApplicationHeader
  overview: ApplicationOverview
  kycDetails: ApplicationKycDetails
  bankingDetails: ApplicationBankingDetails
  meta: Record<string, unknown> | null
}

export interface ApplicationDetailsResponse {
  success: boolean
  message: string
  data: ApplicationDetails
}

export interface VenueKycStatusPayload {
  status: 'APPROVED' | 'REJECTED'
  reasonFor?: string[]
  rejectionReason?: string
  adminNote?: string
}
