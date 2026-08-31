export const VENUE_CATEGORY_MANAGEMENT_MODULE_KEY = 'venue-category-management'

export type VenueCategoryManagementMetricCatalogItem = {
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
): VenueCategoryManagementMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG: VenueCategoryManagementMetricCatalogItem[] =
  [
    metric('total-categories', 'Total Venue Categories', 'Count', 'Count(Venue Categories)', true),
    metric('active-categories', 'Active Categories', 'Count', 'Count(Status=Active)', true),
    metric('paused-categories', 'Paused Categories', 'Count', 'Count(Status=Paused)'),
    metric('deleted-categories', 'Deleted Categories', 'Count', 'Count(Status=Deleted)'),
    metric(
      'top-revenue-category',
      'Top Revenue Category',
      'Text',
      'Highest Revenue Category',
      true,
    ),
    metric('lowest-revenue-category', 'Lowest Revenue Category', 'Text', 'Lowest Revenue Category'),
    metric('total-bookings', 'Total Bookings', 'Count', 'Count(Bookings)', true),
    metric('completed-bookings', 'Completed Bookings', 'Count', 'Count(Completed Bookings)'),
    metric(
      'booking-completion-rate',
      'Booking Completion Rate',
      'Percentage',
      'Completed Bookings / Total Bookings ×100',
    ),
  ]

export const VENUE_CATEGORY_MANAGEMENT_METRIC_IDS = VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.map(
  (item) => item.id,
)

export const DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS =
  VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.filter((item) => item.defaultActive).map(
    (item) => item.id,
  )

export const VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS =
  VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG.length

export const VENUE_CATEGORY_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'top-category': 'top-revenue-category',
}
