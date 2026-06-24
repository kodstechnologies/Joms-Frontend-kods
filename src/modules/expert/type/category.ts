export interface SubCategory {
  _id: string
  name: string
  isActive?: boolean
}

export interface Category {
  _id: string
  name: string
  isActive: boolean
  subCategories: SubCategory[]
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface CategoryListResponse {
  success: boolean
  message: string
  data: Category[]
  meta: {
    pagination: PaginationMeta
  }
}

export interface SubCategoryListResponse {
  success: boolean
  message: string
  data: SubCategory[]
  meta: {
    pagination: PaginationMeta
  }
}
