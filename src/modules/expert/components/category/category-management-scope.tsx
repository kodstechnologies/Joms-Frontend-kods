/* eslint-disable react-refresh/only-export-components -- context module exports scope helpers with the provider */
import { createContext, useContext, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import type { ModuleFilterKey } from '@/shared/types/data-filter'

export type CategoryType = 'service' | 'expert'

export type CategoryManagementScope = {
  basePath: string
  metricsPath: string
  relatedListPath: string
  relatedListLabel: string
  categoryType: CategoryType
  moduleKey: ModuleFilterKey
  queryKey: string
  exportFilePrefix: string
}

export const SERVICE_CATEGORY_SCOPE: CategoryManagementScope = {
  basePath: '/categories/management',
  metricsPath: '/categories/management/metrics',
  relatedListPath: '/services/management',
  relatedListLabel: 'View Services',
  categoryType: 'service',
  moduleKey: 'service-category-management',
  queryKey: 'service-categories',
  exportFilePrefix: 'service_categories',
}

export const EXPERT_CATEGORY_SCOPE: CategoryManagementScope = {
  basePath: '/experts/categories/management',
  metricsPath: '/experts/categories/management/metrics',
  relatedListPath: '/experts/management',
  relatedListLabel: 'View Experts',
  categoryType: 'expert',
  moduleKey: 'expert-category-management',
  queryKey: 'expert-categories',
  exportFilePrefix: 'expert_categories',
}

const CategoryManagementScopeContext =
  createContext<CategoryManagementScope>(SERVICE_CATEGORY_SCOPE)

export function CategoryManagementScopeProvider({
  scope,
  children,
}: {
  scope: CategoryManagementScope
  children: ReactNode
}) {
  return (
    <CategoryManagementScopeContext.Provider value={scope}>
      {children}
    </CategoryManagementScopeContext.Provider>
  )
}

export function ExpertCategoryScopeLayout() {
  return (
    <CategoryManagementScopeProvider scope={EXPERT_CATEGORY_SCOPE}>
      <Outlet />
    </CategoryManagementScopeProvider>
  )
}

export function useCategoryManagementScope() {
  return useContext(CategoryManagementScopeContext)
}

export function categoryPath(scope: CategoryManagementScope, segment = '') {
  const normalized = segment.replace(/^\//, '')
  return normalized ? `${scope.basePath}/${normalized}` : scope.basePath
}
