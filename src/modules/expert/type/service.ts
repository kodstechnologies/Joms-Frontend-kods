export type ServiceRawStatus = 'active' | 'inactive'

export interface Service {
  _id: string
  serviceid?: string
  title: string
  partnerId: string
  status: 'live' | 'in_review' | 'suspended' | 'deleted' | 'pending' | 'preview' | 'rejected'
  serviceStatus?: ServiceRawStatus
  isSuspend?: boolean
  createdAt: string
  serviceType: string
  categoryName: string
  pricing: number
  expertName: string
  expertid?: string
  partnerName?: string
  reason?: string | null
  deletedAt?: string | null
}

export interface SuspendServicePayload {
  selectedReasons: string[]
  suspendIndefinitely: boolean
  startDate?: string
  endDate?: string
  reasonDetails: string
  adminNotes: string
}

export interface ServiceSuspendActivateResponse {
  success: boolean
  message: string
  data?: unknown
  meta?: unknown
}

export interface ServiceMeta {
  counts: {
    approvalsPending: number
    reportedServices: number
    suspendedServices: number
    deletedServices: number
  }
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface ServiceResponse {
  success: boolean
  message: string
  data: Service[]
  meta: ServiceMeta
}

export interface CategoryDetail {
  _id: string
  name: string
}

export interface SubCategoryDetail {
  _id: string
  name: string
}

export interface FixedPricing {
  price: number
  discountPercent: number
  timelineValue: number
  timelineUnit: string
}

export interface CustomPricing {
  durationType: string
  minPrice: number
  maxPrice: number
  timelineFrom: number
  timelineTo: number
  timelineUnit: string
}

export interface TierPricing {
  name: string
  description: string
  price: number
  timelineValue: number
  timelineUnit: string
}

export interface TieredPricing {
  tiers: TierPricing[]
}

export type ServiceRejectionReason =
  | 'Unclear Image'
  | 'Content issue'
  | 'Invalid Documents'
  | 'IndiaPAN'
  | 'InvalidGST'

export const SERVICE_REJECTION_REASON_BY_VALUE: Record<string, ServiceRejectionReason> = {
  'unclear-image': 'Unclear Image',
  'content-issue': 'Content issue',
  'invalid-documents': 'Invalid Documents',
  'invalid-pan': 'IndiaPAN',
  'invalid-gst': 'InvalidGST',
}

export type UpdateServiceStatusApprovePayload = {
  status: 'live'
  adminNote?: string
}

export type UpdateServiceStatusRejectPayload = {
  status: 'rejected'
  reasonFor: ServiceRejectionReason[]
  rejectionReason: string
  adminNote?: string
}

export type UpdateServiceStatusPayload =
  | UpdateServiceStatusApprovePayload
  | UpdateServiceStatusRejectPayload

export interface ServiceDetail {
  _id: string
  serviceid?: string
  partnerId: string
  title: string
  category: CategoryDetail
  subCategory: SubCategoryDetail[]
  description: string
  deliverables: string
  images: string[]
  pricingType: 'fixed' | 'custom' | 'tiered'
  fixedPricing?: FixedPricing
  customPricing?: CustomPricing
  tieredPricing?: TieredPricing
  status: string
  reasonFor?: ServiceRejectionReason[] | null
  rejectionReason?: string | null
  adminNote?: string | null
  createdAt: string
  updatedAt: string
  approvedAt?: string | null
  submittedAt?: string
  expertName?: string
  expertid?: string
  partnerName?: string
}

export interface ServiceDetailResponse {
  success: boolean
  message: string
  data: ServiceDetail | null
  meta: null | Record<string, unknown>
}

export interface ServiceStatusUpdateResponse {
  success: boolean
  message: string
  data: ServiceDetail | null
  meta: null
}

export interface ConsultationTopic {
  _id: string
  name: string
}

export interface TopicListResponse {
  success: boolean
  message: string
  data: ConsultationTopic[]
  meta: {
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

export interface ConsultationPricingOption {
  durationMinutes: number
  pricingType: 'free' | 'paid'
  price?: number
}

export interface ConsultationDetail {
  _id: string
  partnerId: string
  partnerName?: string
  expertid?: string
  title: string
  topics: ConsultationTopic[]
  sessionOutline: string
  whoItsFor: string
  languages: string[]
  hasPreSessionRequirement: boolean
  preSessionRequirement?: string | null
  hasPostSessionMessage: boolean
  postSessionMessage?: string | null
  hasFollowUp: boolean
  followUpDays?: number | null
  mode: string
  pricingOptions: ConsultationPricingOption[]
  status: string
  rejectionReason?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ConsultationDetailResponse {
  success: boolean
  message: string
  data?: ConsultationDetail | null
  meta: null | Record<string, unknown>
}

export type UpdateConsultationStatusApprovePayload = {
  status: 'live'
  adminNote?: string
}

export type UpdateConsultationStatusRejectPayload = {
  status: 'rejected'
  reasonFor: ServiceRejectionReason[]
  rejectionReason: string
  adminNote?: string
}

export type UpdateConsultationStatusPayload =
  | UpdateConsultationStatusApprovePayload
  | UpdateConsultationStatusRejectPayload

export interface ConsultationStatusUpdateResponse {
  success: boolean
  message: string
  data: null
  meta: null
}

export interface CreateServicePayload {
  partnerId: string
  title: string
  category: string
  subCategory?: string[]
  description?: string
  deliverables?: string
  images?: string[]
  pricingType?: 'fixed' | 'custom' | 'tiered'
}

export interface CreateServiceResponse {
  success: boolean
  message: string
  data: { _id: string }
}

export type UpdateServicePricingPayload =
  | {
      pricingType: 'fixed'
      fixedPricing: {
        price: number
        discountPercent: number
        timelineValue: number
        timelineUnit: string
      }
    }
  | {
      pricingType: 'custom'
      customPricing: {
        durationType: 'short_term' | 'long_term'
        minPrice: number
        maxPrice: number
        timelineFrom: number
        timelineTo: number
        timelineUnit: string
      }
    }
  | {
      pricingType: 'tiered'
      tieredPricing: {
        tiers: {
          name: string
          description: string
          price: number
          timelineValue: number
          timelineUnit: string
        }[]
      }
    }

export interface CreateConsultationPayload {
  partnerId: string
  title: string
  topics: ConsultationTopic[]
  sessionOutline: string
  whoItsFor: string
}

export interface CreateConsultationResponse {
  success: boolean
  message: string
  data: { _id: string }
}

export interface UpdateConsultationAdditionalInfoPayload {
  languages?: string[]
  hasPreSessionRequirement: boolean
  preSessionRequirement?: string
  hasPostSessionMessage: boolean
  postSessionMessage?: string
  hasFollowUp: boolean
  followUpDays?: number
}

export interface UpdateConsultationPricingPayload {
  mode: 'audio' | 'video' | 'chat'
  pricingOptions: {
    durationMinutes: number
    pricingType: 'free' | 'paid'
    price?: number
  }[]
}

export interface PublishResponse<T = ServiceDetail | ConsultationDetail> {
  success: boolean
  message: string
  data: T
}
