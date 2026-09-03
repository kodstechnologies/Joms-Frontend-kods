export const VENUE_PROFILE_ANALYTICS_MODULE_KEY = 'venue-profile-analytics'

export type VenueProfileAnalyticsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['account-status', 'Account Status', 'Status', 'Account status', true],
  ['last-active', 'Last Active', 'Date', 'Last activity', true],
  ['venue-partner-rating', 'Venue Partner Rating', 'Average', 'Overall rating', true],
  ['venue-category', 'Venue Category', 'Text', 'Primary category', true],
  ['profile-views', 'Profile Views', 'Count', 'Profile views', true],
  ['conversion-rate', 'Conversion Rate', 'Percentage', 'View → request'],
  ['total-spaces-listed', 'Total Spaces Listed', 'Count', 'Spaces owned', true],
  ['active-spaces', 'Active Spaces', 'Count', 'Active'],
  ['inactive-paused-spaces', 'Inactive / Paused Spaces', 'Count', 'Unavailable'],
  ['most-viewed-space', 'Most Viewed Space', 'Text', 'Top views'],
  ['total-booking-requests', 'Total Booking Requests', 'Count', 'Requests'],
  ['total-bookings-confirmed', 'Total Bookings Confirmed', 'Count', 'Confirmed'],
  ['total-bookings-completed', 'Total Bookings Completed', 'Count', 'Completed', true],
  ['scheduled-bookings', 'Scheduled Bookings', 'Count', 'Upcoming'],
  ['cancelled-bookings', 'Cancelled Bookings', 'Count', 'Cancelled'],
  ['ongoing-bookings', 'Ongoing Bookings', 'Count', 'Active'],
  ['total-event-bookings-confirmed', 'Total Event Bookings Confirmed', 'Count', 'Event confirmed'],
  ['total-event-bookings-completed', 'Total Event Bookings Completed', 'Count', 'Event completed'],
  ['scheduled-event-bookings', 'Scheduled Event Bookings', 'Count', 'Event upcoming'],
  ['cancelled-event-bookings', 'Cancelled Event Bookings', 'Count', 'Event cancelled'],
  ['ongoing-event-bookings', 'Ongoing Event Bookings', 'Count', 'Event active'],
  [
    'total-meetup-bookings-confirmed',
    'Total Meetup Bookings Confirmed',
    'Count',
    'Meetup confirmed',
  ],
  [
    'total-meetup-bookings-completed',
    'Total Meetup Bookings Completed',
    'Count',
    'Meetup completed',
  ],
  ['scheduled-meetup-bookings', 'Scheduled Meetup Bookings', 'Count', 'Meetup upcoming'],
  ['cancelled-meetup-bookings', 'Cancelled Meetup Bookings', 'Count', 'Meetup cancelled'],
  ['ongoing-meetup-bookings', 'Ongoing Meetup Bookings', 'Count', 'Meetup active'],
  ['one-on-one-meetups-held', '1-on-1 Meetups Held', 'Count', '1:1 completed'],
  ['group-meetups-held', 'Group Meetups Held', 'Count', 'Group completed'],
  ['most-frequent-event-host', 'Most Frequent Event Host', 'Text', 'Top event host'],
  ['most-frequent-meetup-host', 'Most Frequent Meetup Host', 'Text', 'Top meetup host'],
  ['booking-completion-rate', 'Booking Completion Rate', 'Percentage', 'Completion %'],
  ['total-revenue', 'Total Revenue', 'Currency', 'Completed revenue', true],
  ['revenue-growth-rate', 'Revenue Growth Rate', 'Percentage', 'Period growth'],
  [
    'average-revenue-per-event-booking',
    'Average Revenue per Event Booking',
    'Currency',
    'Avg event value',
  ],
  [
    'average-revenue-per-meetup-booking',
    'Average Revenue per Meetup Booking',
    'Currency',
    'Avg meetup value',
  ],
  ['average-revenue-per-space', 'Average Revenue per Space', 'Currency', 'Per space'],
  ['average-booking-value', 'Average Booking Value', 'Currency', 'Per booking'],
  ['highest-revenue-generating-space', 'Highest Revenue Generating Space', 'Text', 'Top space'],
  ['space-utilization-rate', 'Space Utilization Rate', 'Percentage', 'Utilization'],
  ['peak-booking-time', 'Peak Booking Time', 'Text', 'Peak demand'],
  [
    'last-booking-request-received-at',
    'Last Booking Request Received At',
    'Date',
    'Latest request',
  ],
  ['cancellation-rate', 'Cancellation Rate', 'Percentage', 'Host cancel %'],
  ['customer-satisfaction-score', 'Customer Satisfaction Score', 'Percentage', 'Positive feedback'],
  ['repeat-customer-rate', 'Repeat Customer Rate', 'Percentage', 'Returning customers'],
]

export const VENUE_PROFILE_ANALYTICS_METRICS_CATALOG: VenueProfileAnalyticsMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

export const VENUE_PROFILE_ANALYTICS_METRIC_IDS = VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.map(
  (item) => item.id,
)

export const VENUE_PROFILE_ANALYTICS_METRIC_ID_SET = new Set(VENUE_PROFILE_ANALYTICS_METRIC_IDS)

export const DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS =
  VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.filter((item) => item.defaultActive).map(
    (item) => item.id,
  )

export const VENUE_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS =
  VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.length

export const VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'events-hosted': 'total-event-bookings-confirmed',
  'total-attendees': 'profile-views',
  'repeat-attendees': 'repeat-customer-rate',
  'upcoming-events': 'scheduled-bookings',
  'event-completion-rate': 'booking-completion-rate',
  'avg-response-time': 'peak-booking-time',
  'events-rejected': 'cancelled-bookings',
  'events-suspended': 'inactive-paused-spaces',
}
