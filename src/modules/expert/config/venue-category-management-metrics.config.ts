import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const VENUE_CATEGORY_MANAGEMENT_MODULE_KEY = 'venue-category-management'

export type VenueCategoryManagementMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const VENUE_CATEGORY_METRIC_DEFS: MetricRowTuple[] = [
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

export const VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG = catalogFromMetricRows(
  VENUE_CATEGORY_METRIC_DEFS,
) as VenueCategoryManagementMetricCatalogItem[]

const derived = deriveMetricExports(VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG)
export const VENUE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.ids
export const DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.defaultIds
export const VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS = derived.maxActive

export const VENUE_CATEGORY_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'top-category': 'top-revenue-category',
}
