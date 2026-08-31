export const SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY = 'service-category-management'

export type ServiceCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultActive = false,
): ServiceCategoryManagementMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG: ServiceCategoryManagementMetricCatalogItem[] =
  [
    metric(
      'total-categories',
      'Total Categories',
      'Count',
      'Count(Service Categories where IsDeleted = False)',
      true,
    ),
    metric(
      'active-categories',
      'Active Categories',
      'Count',
      'Count(Category Status = Active)',
      true,
    ),
    metric('paused-categories', 'Paused Categories', 'Count', 'Count(Category Status = Paused)'),
    metric('deleted-categories', 'Deleted Categories', 'Count', 'Count(IsDeleted = True)'),
    metric(
      'top-revenue-category',
      'Top Revenue Category',
      'Text',
      'Category with Highest Revenue',
      true,
    ),
    metric(
      'lowest-revenue-category',
      'Lowest Revenue Category',
      'Text',
      'Category with Lowest Revenue (>0 Revenue)',
    ),
    metric(
      'highest-order-category',
      'Highest Order Category',
      'Text',
      'Category with Highest Completed Orders',
    ),
    metric(
      'lowest-order-category',
      'Lowest Order Category',
      'Text',
      'Category with Lowest Completed Orders',
    ),
    metric('total-orders', 'Total Orders', 'Count', 'Count(All Orders)'),
    metric('completed-orders', 'Completed Orders', 'Count', 'Count(Status=Completed)'),
    metric(
      'order-completion-rate',
      'Order Completion Rate',
      'Percentage',
      'Completed Orders / Total Orders ×100',
    ),
    metric('total-revenue', 'Total Revenue', 'Currency', 'Sum(Category Revenue)', true),
  ]

export const SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS =
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.map((item) => item.id)

export const DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS =
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.filter((item) => item.defaultActive).map(
    (item) => item.id,
  )

export const SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS =
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG.length

export const SERVICE_CATEGORY_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'top-category': 'top-revenue-category',
}
