import { create } from "zustand";
import { persist } from "zustand/middleware";

import { expertCategoryManagementSeed } from "../mock/expert-category-management.mock";
import type { Category } from "../components/category/category-table-columns";

interface ExpertCategoryStore {
  categories: Category[];
  createCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  pauseCategory: (id: string) => void;
  resumeCategory: (id: string) => void;
  removeCategory: (id: string) => void;
  revokeCategory: (id: string) => void;
}

export const useExpertCategoryStore = create<ExpertCategoryStore>()(
  persist(
    (set) => ({
      categories: expertCategoryManagementSeed,

      createCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        })),

      pauseCategory: (id) =>
        set((state) => ({
          categories: state.categories.map((item) =>
            item.id === id
              ? {
                  ...item,
                  previousStatus: item.status,
                  status: "Paused",
                }
              : item,
          ),
        })),

      updateCategory: (updatedCategory) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        })),

      resumeCategory: (id) =>
        set((state) => ({
          categories: state.categories.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.previousStatus ?? "Accepted",
                  previousStatus: undefined,
                }
              : item,
          ),
        })),

      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.map((item) =>
            item.id === id
              ? {
                  ...item,
                  previousStatus: item.status,
                  status: "Deleted",
                }
              : item,
          ),
        })),

      revokeCategory: (id) =>
        set((state) => ({
          categories: state.categories.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.previousStatus ?? "Accepted",
                  previousStatus: undefined,
                }
              : item,
          ),
        })),
    }),
    {
      name: "expert-category-storage-v1",
    },
  ),
);
