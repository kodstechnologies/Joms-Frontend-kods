import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchSubcategories } from '../api/category-api'

export const useCategories = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => fetchCategories(params),
  })
}

export const useSubcategories = (
  categoryId: string,
  params?: { search?: string; page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: ['subcategories', categoryId, params],
    queryFn: () => fetchSubcategories(categoryId, params),
    enabled: !!categoryId,
  })
}
