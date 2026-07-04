export type CategoryApiStatus = 'ACTIVE' | 'PAUSED' | 'DELETED'

export interface CategoryApiSubCategory {
  _id: string
  name: string
  description?: string
  vectorIcon?: string | null
  status?: CategoryApiStatus
  isDeleted?: boolean
  isPaused?: boolean
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ServiceCategoryApi {
  _id: string
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
}

export interface VenueCategoryApi {
  _id: string
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
  data: Array<{ _id: string; name: string }>
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
