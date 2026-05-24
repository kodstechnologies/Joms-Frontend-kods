export interface Service {
  _id: string
  title: string
  partnerId: string
  status: 'live' | 'in_review' | 'suspended' | 'deleted' | 'pending'
  createdAt: string
  serviceType: string
  categoryName: string
  pricing: number
  expertName: string
  partnerName?: string
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

export interface ServiceDetail {
  _id: string
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
  createdAt: string
  updatedAt: string
  approvedAt?: string
  submittedAt?: string
  expertName?: string
  partnerName?: string
}

export interface ServiceDetailResponse {
  success: boolean
  message: string
  data: ServiceDetail
  meta: null | Record<string, unknown>
}

