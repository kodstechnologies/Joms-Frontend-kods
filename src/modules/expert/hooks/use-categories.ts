import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchSubcategories } from '../api/category-api'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory,fetchCategoryById, } from "../api/category-api";


export const useCategories = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "PAUSED" | "DELETED";
}) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => fetchCategories(params),
  });
};

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

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
};