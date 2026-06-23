import { expertApiClient } from '@/shared/lib/axios'
import type { CategoryListResponse, SubCategoryListResponse } from '../type/category'

export const fetchCategories = async (params?: {
  search?: string
  page?: number
  limit?: number
}) => {
  const response = await expertApiClient.get<CategoryListResponse>('/categories', { params })
  return response.data
}

export const fetchSubcategories = async (
  categoryId: string,
  params?: { search?: string; page?: number; limit?: number },
) => {
  const response = await expertApiClient.get<SubCategoryListResponse>(
    `/categories/${categoryId}/subcategories`,
    { params },
  )
  return response.data
}
