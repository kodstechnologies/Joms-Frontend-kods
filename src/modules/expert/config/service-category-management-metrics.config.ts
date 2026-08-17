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
      description: 'All service categories',
      defaultActive: true,
    },
    {
      id: 'active-categories',
      label: 'Active Categories',
      type: 'Count',
      description: 'Currently active categories',
      defaultActive: true,
    },
    {
      id: 'total-sub-categories',
      label: 'Total Sub-Category',
      type: 'Count',
      description: 'Sum of sub-categories',
      defaultActive: true,
    },
    {
      id: 'top-category',
      label: 'Top Category',
      type: 'Text',
      description: 'Highest performing category',
      defaultActive: true,
    },
    {
      id: 'paused-categories',
      label: 'Paused Categories',
      type: 'Count',
      description: 'Categories currently paused',
      defaultActive: false,
    },
    {
      id: 'deleted-categories',
      label: 'Deleted Categories',
      type: 'Count',
      description: 'Soft-deleted categories',
      defaultActive: false,
    },
    {
      id: 'total-services',
      label: 'Total Services',
      type: 'Count',
      description: 'Services across categories',
      defaultActive: false,
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      type: 'Currency',
      description: 'Revenue across categories',
      defaultActive: false,
    },
  ]

export const SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS =
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.map((metric) => metric.id)

export const DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS =
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.filter((metric) => metric.defaultActive).map(
    (metric) => metric.id,
  )

export const SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS =
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.length
