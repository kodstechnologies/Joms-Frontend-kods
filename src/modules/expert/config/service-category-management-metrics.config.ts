import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY = 'service-category-management'

export type ServiceCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const SERVICE_CATEGORY_METRIC_DEFS: MetricRowTuple[] = [
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

export const SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG = catalogFromMetricRows(
  SERVICE_CATEGORY_METRIC_DEFS,
) as ServiceCategoryManagementMetricCatalogItem[]

const derived = deriveMetricExports(SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG)
export const SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.ids
export const DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.defaultIds
export const SERVICE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS = derived.maxActive

export const SERVICE_CATEGORY_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'top-category': 'top-revenue-category',
}
