export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ConciergeRejectionReason = string

export type DocumentReviewEntry = {
  status?: ApplicationStatus
  reasonFor?: string[]
  rejectionReason?: string | null
  adminNote?: string | null
  reviewedAt?: string | null
}

export type DocumentReviewsMap = Record<string, DocumentReviewEntry>

export type DocumentStatusPayload =
  | { status: 'APPROVED'; adminNote?: string }
  | {
      status: 'REJECTED'
      reasonFor: string[]
      rejectionReason: string
      adminNote?: string
    }

export type ApplicationViewResponse = {
  success?: boolean
  message?: string
  data: ExpertApplicationViewData | null
  meta?: unknown
}

export type ExpertApplicationWorkExperience = {
  _id?: string
  jobTitle?: string
  companyName?: string
  employmentType?: string
  startDate?: string
  endDate?: string | null
  currentlyWorking?: boolean
  description?: string
}

export type ExpertApplicationExpert = {
  _id?: string
  fullname?: string
  email?: string
  phone?: string
  phoneVerified?: boolean
  emailVerified?: boolean
  servicetype?: string
  isBlocked?: boolean
  isDeactivated?: boolean
  basicProfile?: {
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
    serviceCategoryDisplay?: string[]
    offerings?: string[]
    sampleWorkLink?: string
    sampleWorkFile?: string
    phoneNumber?: string
    email?: string
  }
  identityVerification?: {
    idType?: string
    idNumber?: string
    gstAvailable?: boolean
    gstNumber?: string
    panNumber?: string
    panCardFile?: string
    certificateFile?: string
    gstCertificateFile?: string
  }
  workExperience?: ExpertApplicationWorkExperience[]
  gallery?: { images?: string[] }
  finalReview?: {
    internalNotes?: string
    isVerified?: boolean
    approvalStatus?: 'pending' | 'approved'
    escalatedToSubAdminId?: string
    escalatedToName?: string
    escalatedAt?: string
    escalationNote?: string
    escalationTarget?: 'kyc' | 'banking' | 'application'
    escalatedByName?: string
    escalationStatus?: 'assigned' | 'in_progress' | 'completed'
  }
  subCategory?: unknown[]
  createdAt?: string
  updatedAt?: string
}

export type ExpertApplicationKyc = {
  _id?: string
  userId?: string
  partnerId?: string
  legalName?: string
  hasGST?: boolean
  gstNumber?: string
  state?: string
  panNumber?: string
  sampleWorkLink?: string
  itReturnsFiled?: boolean
  status?: ApplicationStatus
  documents?: {
    panCardUrl?: string
    gstCertificateUrl?: string
    licenceOrCertificateUrl?: string
    sampleWorkFileUrl?: string
    digilockerDocumentUrl?: string
  }
  documentReviews?: DocumentReviewsMap
  reasonFor?: string[]
  rejectionReason?: string | null
  adminNote?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ExpertApplicationDigilocker = {
  id?: string
  userId?: string
  status?: string
  digilockerId?: string
  fullName?: string
  dateOfBirth?: string
  gender?: string
  eaadhaar?: string
  picture?: string
  documentUrl?: string
  fileUrl?: string
  providerResponse?: {
    user?: {
      picture?: string
      dob?: string
      name?: string
      gender?: string
      mobile?: string
      eaadhaar?: string
      [key: string]: unknown
    }
    picture?: string
    [key: string]: unknown
  }
  verifiedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ExpertApplicationBanking = {
  _id?: string
  userId?: string
  partnerId?: string
  beneficiaryName?: string
  accountType?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  providedName?: string
  nameMatchScore?: number | string
  documents?: {
    cancelledChequeUrl?: string
  }
  documentReviews?: DocumentReviewsMap
  status?: ApplicationStatus
  reasonFor?: string[]
  rejectionReason?: string | null
  adminNote?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ExpertApplicationViewData = {
  expert?: ExpertApplicationExpert
  kyc?: ExpertApplicationKyc
  banking?: ExpertApplicationBanking
  digilocker?: ExpertApplicationDigilocker
}

export type KycDecisionPayload =
  | { status: 'APPROVED' }
  | {
      status: 'REJECTED'
      reasonFor: ConciergeRejectionReason[]
      rejectionReason: string
      adminNote?: string
    }

export type BankingDecisionPayload =
  | { status: 'APPROVED' }
  | {
      status: 'REJECTED'
      reasonFor: ConciergeRejectionReason[]
      rejectionReason: string
      adminNote?: string
    }
