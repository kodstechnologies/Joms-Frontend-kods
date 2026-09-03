export const VENUE_CATEGORY_MANAGEMENT_MODULE_KEY = 'venue-category-management'

export type VenueCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['total-categories', 'Total Venue Categories', 'Count', 'Count(Venue Categories)', true],
  ['active-categories', 'Active Categories', 'Count', 'Count(Status=Active)', true],
  ['paused-categories', 'Paused Categories', 'Count', 'Count(Status=Paused)'],
  ['deleted-categories', 'Deleted Categories', 'Count', 'Count(Status=Deleted)'],
  ['top-revenue-category', 'Top Revenue Category', 'Text', 'Highest Revenue Category', true],
  ['lowest-revenue-category', 'Lowest Revenue Category', 'Text', 'Lowest Revenue Category'],
  ['total-bookings', 'Total Bookings', 'Count', 'Count(Bookings)', true],
  ['completed-bookings', 'Completed Bookings', 'Count', 'Count(Completed Bookings)'],
  [
    'booking-completion-rate',
    'Booking Completion Rate',
    'Percentage',
    'Completed Bookings / Total Bookings ×100',
  ],
]

export const VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG: VenueCategoryManagementMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

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
