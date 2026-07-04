import { createContext, useContext, type ReactNode } from 'react'

export type CategoryManagementScope = {
  basePath: string
  metricsPath: string
  relatedListPath: string
  relatedListLabel: string
}

export const SERVICE_CATEGORY_SCOPE: CategoryManagementScope = {
  basePath: '/categories/management',
  metricsPath: '/services/dashboard/metrics',
  relatedListPath: '/services/management',
  relatedListLabel: 'View Services',
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

export function useCategoryManagementScope() {
  return useContext(CategoryManagementScopeContext)
}

export function categoryPath(scope: CategoryManagementScope, segment = '') {
  const normalized = segment.replace(/^\//, '')
  return normalized ? `${scope.basePath}/${normalized}` : scope.basePath
}
