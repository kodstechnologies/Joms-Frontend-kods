export const VENUE_CATEGORY_MANAGEMENT_MODULE_KEY = 'venue-category-management'

export type VenueCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG: VenueCategoryManagementMetricCatalogItem[] =
  [
    {
      id: 'total-categories',
      label: 'Total Categories',
      type: 'Count',
      description: 'All venue categories',
      defaultActive: true,
    },
    {
      id: 'active-categories',
      label: 'Active Categories',
      type: 'Count',
      description: 'Currently active venue categories',
      defaultActive: true,
    },
    {
      id: 'total-sub-categories',
      label: 'Total Sub-Category',
      type: 'Count',
      description: 'Sum of venue sub-categories',
      defaultActive: true,
    },
    {
      id: 'top-category',
      label: 'Top Category',
      type: 'Text',
      description: 'Highest performing venue category',
      defaultActive: true,
    },
    {
      id: 'paused-categories',
      label: 'Paused Categories',
      type: 'Count',
      description: 'Venue categories currently paused',
      defaultActive: false,
    },
    {
      id: 'deleted-categories',
      label: 'Deleted Categories',
      type: 'Count',
      description: 'Soft-deleted venue categories',
      defaultActive: false,
    },
    {
      id: 'total-venues',
      label: 'Total Venues',
      type: 'Count',
      description: 'Venues across categories',
      defaultActive: false,
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      type: 'Currency',
      description: 'Revenue across venue categories',
      defaultActive: false,
    },
  ]

export const VENUE_CATEGORY_MANAGEMENT_METRIC_IDS = VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS =
  VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.filter((metric) => metric.defaultActive).map(
    (metric) => metric.id,
  )

export const VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS =
  VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.length
