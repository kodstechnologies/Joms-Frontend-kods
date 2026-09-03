import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

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
      label: 'Total Venue Categories',
      type: 'Count',
      description: 'Count(Venue Categories)',
      defaultActive: true,
    },
    {
      id: 'active-categories',
      label: 'Active Categories',
      type: 'Count',
      description: 'Count(Status=Active)',
      defaultActive: true,
    },
    {
      id: 'paused-categories',
      label: 'Paused Categories',
      type: 'Count',
      description: 'Count(Status=Paused)',
      defaultActive: false,
    },
    {
      id: 'deleted-categories',
      label: 'Deleted Categories',
      type: 'Count',
      description: 'Count(Status=Deleted)',
      defaultActive: false,
    },
    {
      id: 'top-revenue-category',
      label: 'Top Revenue Category',
      type: 'Text',
      description: 'Highest Revenue Category',
      defaultActive: true,
    },
    {
      id: 'lowest-revenue-category',
      label: 'Lowest Revenue Category',
      type: 'Text',
      description: 'Lowest Revenue Category',
      defaultActive: false,
    },
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      type: 'Count',
      description: 'Count(Bookings)',
      defaultActive: true,
    },
    {
      id: 'completed-bookings',
      label: 'Completed Bookings',
      type: 'Count',
      description: 'Count(Completed Bookings)',
      defaultActive: false,
    },
    {
      id: 'booking-completion-rate',
      label: 'Booking Completion Rate',
      type: 'Percentage',
      description: 'Completed Bookings / Total Bookings ×100',
      defaultActive: false,
    },
  ]

const derived = deriveMetricExports(VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG)
export const VENUE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.ids
export const DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS = derived.defaultIds
export const VENUE_CATEGORY_MANAGEMENT_MAX_ACTIVE_METRICS = derived.maxActive

export const VENUE_CATEGORY_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'top-category': 'top-revenue-category',
}
