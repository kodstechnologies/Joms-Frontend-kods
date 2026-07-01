export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ApplicationViewResponse = {
  success?: boolean
  message?: string
  data: ExpertApplicationViewData
  meta?: unknown
}

export type ExpertApplicationViewData = {
  expert?: {
    _id?: string
    fullname?: string
    email?: string
    phone?: string
    basicProfile?: {
      fullname?: string
      location?: string
      industry?: string
      serviceType?: string
      serviceCategory?: string[]
      sampleWorkLink?: string
    }
    createdAt?: string
    updatedAt?: string
  }
  kyc?: {
    _id?: string
    partnerId?: string
    status?: ApplicationStatus
    idType?: string
    idNumber?: string
    gstAvailable?: boolean
    gstNumber?: string
    panNumber?: string
    panCardFile?: string
    certificateFile?: string
    gstCertificateFile?: string
    rejectionReason?: string
    reasonFor?: string[]
    adminNote?: string
    createdAt?: string
    updatedAt?: string
  }
  banking?: {
    _id?: string
    partnerId?: string
    status?: ApplicationStatus
    beneficiaryName?: string
    accountType?: string
    accountNumber?: string
    bankName?: string
    ifscCode?: string
    providedName?: string
    nameMatchScore?: number | string
    cancelledCheque?: string
    rejectionReason?: string
    reasonFor?: string[]
    adminNote?: string
    createdAt?: string
    updatedAt?: string
  }
}

export type KycDecisionPayload =
  | { status: 'APPROVED' }
  | {
      status: 'REJECTED'
      reasonFor: string[]
      rejectionReason: string
    }

export type BankingDecisionPayload =
  | { status: 'APPROVED' }
  | {
      status: 'REJECTED'
      reasonFor: string[]
      rejectionReason: string
      adminNote?: string
    }
