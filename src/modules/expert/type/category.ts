export type CategoryApiStatus = 'ACTIVE' | 'PAUSED' | 'DELETED'

export const getCategoryApiId = (doc: { _id?: string; id?: string }): string =>
  doc._id ?? doc.id ?? ''

export interface CategoryApiSubCategory {
  _id?: string
  id?: string
  name: string
  description?: string
  vectorIcon?: string | null
  status?: CategoryApiStatus
  isDeleted?: boolean
  isPaused?: boolean
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  createdByName?: string | null
  activeListings?: number
  totalListings?: number
  experts?: number
  services?: number
  totalOrders?: number
  completedOrders?: number
  inProgressOrders?: number
  cancelledOrders?: number
  revenue?: number
  revenueLabel?: string
  repeatBookingPct?: number
  totalVenues?: number
  activeVenues?: number
  venues?: number
}

export interface ServiceCategoryApi {
  _id?: string
  id?: string
  categoryId?: string
  name: string
  description?: string
  icon3D?: string | null
  image?: string | null
  status: CategoryApiStatus
  deletedAt?: string | null
  subCategories: CategoryApiSubCategory[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  createdByName?: string | null
  subCategoryCount?: number
  activeListings?: number
  totalListings?: number
  experts?: number
  services?: number
  totalOrders?: number
  completedOrders?: number
  inProgressOrders?: number
  cancelledOrders?: number
  revenue?: number
  revenueLabel?: string
  repeatBookingPct?: number
}

export interface VenueCategoryApi {
  _id?: string
  id?: string
  categoryId?: string
  name: string
  description?: string
  icon?: string | null
  image?: string | null
  isDeleted?: boolean
  isPaused?: boolean
  deletedAt?: string | null
  subCategories: CategoryApiSubCategory[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  createdByName?: string | null
  subCategoryCount?: number
  totalVenues?: number
  activeVenues?: number
  venues?: number
  totalSpaces?: number
  activeSpaces?: number
  spaces?: number
  totalBookings?: number
  completedBookings?: number
  bookings?: number
  revenue?: number
  revenueLabel?: string
}

export interface VenueCategoryMetricsResponse {
  success: boolean
  message: string
  data: {
    totalCategories: number
    activeCategories: number
    pausedCategories: number
    deletedCategories: number
    totalSubCategories: number
    totalVenues: number
    totalBookings: number
    completedBookings: number
    bookingCompletionRate: number
    totalRevenue: number
    totalRevenueLabel: string
    topCategory: {
      id: string
      name: string
      revenue: number
      revenueLabel: string
      label: string
    } | null
    lowestRevenueCategory: {
      id: string
      name: string
      revenue: number
      revenueLabel: string
      label?: string
    } | null
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages?: number
  totalPages?: number
}

export interface ApiSuccessResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta | { pagination: PaginationMeta }
}

export interface CategoryMetricsResponse {
  success: boolean
  message: string
  data: {
    totalCategories: number
    activeCategories: number
    pausedCategories: number
    deletedCategories: number
    totalSubCategories: number
    totalServices: number
    totalOrders: number
    completedOrders: number
    orderCompletionRate: number
    totalRevenue: number
    totalRevenueLabel: string
    topCategory: {
      id: string
      name: string
      revenue: number
      revenueLabel: string
      label: string
    } | null
    lowestRevenueCategory: {
      id: string
      name: string
      revenue: number
      revenueLabel: string
    } | null
    highestOrderCategory: {
      id: string
      name: string
      completedOrders: number
    } | null
    lowestOrderCategory: {
      id: string
      name: string
      completedOrders: number
    } | null
  }
}

export interface CategoryListResponse {
  success: boolean
  message: string
  data: ServiceCategoryApi[]
  meta?: {
    pagination: PaginationMeta
  }
}

export interface SubCategoryListResponse {
  success: boolean
  message: string
  data: CategoryApiSubCategory[]
  meta?: {
    pagination: PaginationMeta
  }
}

export interface VenueCategoryListResponse {
  success: boolean
  message: string
  data: VenueCategoryApi[]
  meta?: PaginationMeta
}

/** @deprecated Use ServiceCategoryApi — kept for existing category-api consumers */
export interface SubCategory {
  _id: string
  name: string
  isActive?: boolean
}

/** @deprecated Use ServiceCategoryApi */
export interface Category {
  _id: string
  name: string
  isActive: boolean
  subCategories: SubCategory[]
  createdAt: string
  updatedAt: string
}
