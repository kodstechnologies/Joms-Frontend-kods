import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

export const SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY = 'service-category-management'

export type ServiceCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG: ServiceCategoryManagementMetricCatalogItem[] =
  [
    {
      id: 'total-categories',
      label: 'Total Categories',
      type: 'Count',
      description: 'Count(Service Categories where IsDeleted = False)',
      defaultActive: true,
    },
    {
      id: 'active-categories',
      label: 'Active Categories',
      type: 'Count',
      description: 'Count(Category Status = Active)',
      defaultActive: true,
    },
    {
      id: 'paused-categories',
      label: 'Paused Categories',
      type: 'Count',
      description: 'Count(Category Status = Paused)',
      defaultActive: false,
    },
    {
      id: 'deleted-categories',
      label: 'Deleted Categories',
      type: 'Count',
      description: 'Count(IsDeleted = True)',
      defaultActive: false,
    },
    {
      id: 'top-revenue-category',
      label: 'Top Revenue Category',
      type: 'Text',
      description: 'Category with Highest Revenue',
      defaultActive: true,
    },
    {
      id: 'lowest-revenue-category',
      label: 'Lowest Revenue Category',
      type: 'Text',
      description: 'Category with Lowest Revenue (>0 Revenue)',
      defaultActive: false,
    },
    {
      id: 'highest-order-category',
      label: 'Highest Order Category',
      type: 'Text',
      description: 'Category with Highest Completed Orders',
      defaultActive: false,
    },
    {
      id: 'lowest-order-category',
      label: 'Lowest Order Category',
      type: 'Text',
      description: 'Category with Lowest Completed Orders',
      defaultActive: false,
    },
    {
      id: 'total-orders',
      label: 'Total Orders',
      type: 'Count',
      description: 'Count(All Orders)',
      defaultActive: false,
    },
    {
      id: 'completed-orders',
      label: 'Completed Orders',
      type: 'Count',
      description: 'Count(Status=Completed)',
      defaultActive: false,
    },
    {
      id: 'order-completion-rate',
      label: 'Order Completion Rate',
      type: 'Percentage',
      description: 'Completed Orders / Total Orders ×100',
      defaultActive: false,
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      type: 'Currency',
      description: 'Sum(Category Revenue)',
      defaultActive: true,
    },
  ]

const derived = deriveMetricExports(SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG)
export const SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.ids
export const DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.defaultIds
export const SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS = derived.maxActive

export const SERVICE_CATEGORY_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'top-category': 'top-revenue-category',
}
