import { createContext, useContext, type ReactNode } from "react";

import type { Category } from "./category-table-columns";
import { useCategoryStore } from "../../store/category-store";
import { useExpertCategoryStore } from "../../store/expert-category-store";

export interface CategoryStoreState {
  categories: Category[];
  createCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  pauseCategory: (id: string) => void;
  resumeCategory: (id: string) => void;
  removeCategory: (id: string) => void;
  revokeCategory: (id: string) => void;
}

export type CategoryStoreHook = {
  <T>(selector: (state: CategoryStoreState) => T): T;
};

export type CategoryManagementScope = {
  basePath: string;
  metricsPath: string;
  relatedListPath: string;
  relatedListLabel: string;
  useStore: CategoryStoreHook;
};

export const SERVICE_CATEGORY_SCOPE: CategoryManagementScope = {
  basePath: "/categories/management",
  metricsPath: "/services/dashboard/metrics",
  relatedListPath: "/services/management",
  relatedListLabel: "View Services",
  useStore: useCategoryStore,
};

export const EXPERT_CATEGORY_SCOPE: CategoryManagementScope = {
  basePath: "/experts/categories/management",
  metricsPath: "/experts/dashboard/metrics",
  relatedListPath: "/experts/management",
  relatedListLabel: "View Experts",
  useStore: useExpertCategoryStore,
};

const CategoryManagementScopeContext =
  createContext<CategoryManagementScope>(SERVICE_CATEGORY_SCOPE);

export function CategoryManagementScopeProvider({
  scope,
  children,
}: {
  scope: CategoryManagementScope;
  children: ReactNode;
}) {
  return (
    <CategoryManagementScopeContext.Provider value={scope}>
      {children}
    </CategoryManagementScopeContext.Provider>
  );
}

export function useCategoryManagementScope() {
  return useContext(CategoryManagementScopeContext);
}

export function categoryPath(scope: CategoryManagementScope, segment = "") {
  const normalized = segment.replace(/^\//, "");
  return normalized ? `${scope.basePath}/${normalized}` : scope.basePath;
}
