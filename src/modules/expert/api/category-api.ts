import { expertApiClient } from '@/shared/lib/axios'
import type { CategoryListResponse, SubCategoryListResponse } from '../type/category'
import type { CreateCategoryRequest } from "../type/category";

export const createCategory = async (
  payload: CreateCategoryRequest
) => {
  const response = await expertApiClient.post(
    "/categories",
    payload
  );

  return response.data;
};
export const fetchCategories = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "PAUSED" | "DELETED";
}) => {
  const response = await expertApiClient.get<CategoryListResponse>(
    "/categories",
    {
      params,
    }
  );

  return response.data;
};

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

export const fetchCategoryById = async (id: string) => {
  const response = await expertApiClient.get(`/categories/${id}`);
  return response.data;
};