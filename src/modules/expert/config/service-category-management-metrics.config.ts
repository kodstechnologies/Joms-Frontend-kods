export const SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY = 'service-category-management'

export type ServiceCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  [
    'total-categories',
    'Total Categories',
    'Count',
    'Count(Service Categories where IsDeleted = False)',
    true,
  ],
  ['active-categories', 'Active Categories', 'Count', 'Count(Category Status = Active)', true],
  ['paused-categories', 'Paused Categories', 'Count', 'Count(Category Status = Paused)'],
  ['deleted-categories', 'Deleted Categories', 'Count', 'Count(IsDeleted = True)'],
  ['top-revenue-category', 'Top Revenue Category', 'Text', 'Category with Highest Revenue', true],
  [
    'lowest-revenue-category',
    'Lowest Revenue Category',
    'Text',
    'Category with Lowest Revenue (>0 Revenue)',
  ],
  [
    'highest-order-category',
    'Highest Order Category',
    'Text',
    'Category with Highest Completed Orders',
  ],
  [
    'lowest-order-category',
    'Lowest Order Category',
    'Text',
    'Category with Lowest Completed Orders',
  ],
  ['total-orders', 'Total Orders', 'Count', 'Count(All Orders)'],
  ['completed-orders', 'Completed Orders', 'Count', 'Count(Status=Completed)'],
  [
    'order-completion-rate',
    'Order Completion Rate',
    'Percentage',
    'Completed Orders / Total Orders ×100',
  ],
  ['total-revenue', 'Total Revenue', 'Currency', 'Sum(Category Revenue)', true],
]

export const SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG: ServiceCategoryManagementMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

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
