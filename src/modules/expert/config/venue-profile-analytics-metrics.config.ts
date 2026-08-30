export const VENUE_PROFILE_ANALYTICS_MODULE_KEY = 'venue-profile-analytics'

export type VenueProfileAnalyticsMetricCatalogItem = {
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
): VenueProfileAnalyticsMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const VENUE_PROFILE_ANALYTICS_METRICS_CATALOG: VenueProfileAnalyticsMetricCatalogItem[] = [
  metric('account-status', 'Account Status', 'Status', 'Current account status', true),
  metric('last-active', 'Last Active', 'Date', 'Last login/activity timestamp', true),
  metric(
    'venue-partner-rating',
    'Venue Partner Rating',
    'Average',
    'Overall rating across all spaces',
    true,
  ),
  metric('venue-category', 'Venue Category', 'Text', 'Primary venue category', true),
  metric('profile-views', 'Profile Views', 'Count', 'Total partner profile views', true),
  metric(
    'conversion-rate',
    'Conversion Rate',
    'Percentage',
    'Space Listing View >> Booking Request conversion',
  ),
  metric('total-spaces-listed', 'Total Spaces Listed', 'Count', 'Total spaces owned', true),
  metric('active-spaces', 'Active Spaces', 'Count', 'Active spaces'),
  metric(
    'inactive-paused-spaces',
    'Inactive / Paused Spaces',
    'Count',
    'Temporarily unavailable spaces',
  ),
  metric('most-viewed-space', 'Most Viewed Space', 'Text', 'Space with highest page views'),
  metric(
    'total-booking-requests',
    'Total Booking Requests',
    'Count',
    'Total booking requests received',
  ),
  metric('total-bookings-confirmed', 'Total Bookings Confirmed', 'Count', 'Confirmed bookings'),
  metric(
    'total-bookings-completed',
    'Total Bookings Completed',
    'Count',
    'Completed bookings',
    true,
  ),
  metric('scheduled-bookings', 'Scheduled Bookings', 'Count', 'Upcoming bookings'),
  metric('cancelled-bookings', 'Cancelled Bookings', 'Count', 'Cancelled bookings'),
  metric('ongoing-bookings', 'Ongoing Bookings', 'Count', 'Active bookings'),
  metric(
    'total-event-bookings-confirmed',
    'Total Event Bookings Confirmed',
    'Count',
    'Confirmed event bookings',
  ),
  metric(
    'total-event-bookings-completed',
    'Total Event Bookings Completed',
    'Count',
    'Completed event bookings',
  ),
  metric(
    'scheduled-event-bookings',
    'Scheduled Event Bookings',
    'Count',
    'Upcoming event bookings',
  ),
  metric(
    'cancelled-event-bookings',
    'Cancelled Event Bookings',
    'Count',
    'Cancelled event bookings',
  ),
  metric('ongoing-event-bookings', 'Ongoing Event Bookings', 'Count', 'Active event bookings'),
  metric(
    'total-meetup-bookings-confirmed',
    'Total Meetup Bookings Confirmed',
    'Count',
    'Confirmed meetup bookings',
  ),
  metric(
    'total-meetup-bookings-completed',
    'Total Meetup Bookings Completed',
    'Count',
    'Completed meetup bookings',
  ),
  metric(
    'scheduled-meetup-bookings',
    'Scheduled Meetup Bookings',
    'Count',
    'Upcoming meetup bookings',
  ),
  metric(
    'cancelled-meetup-bookings',
    'Cancelled Meetup Bookings',
    'Count',
    'Cancelled meetup bookings',
  ),
  metric('ongoing-meetup-bookings', 'Ongoing Meetup Bookings', 'Count', 'Active meetup bookings'),
  metric('one-on-one-meetups-held', '1-on-1 Meetups Held', 'Count', 'Completed one-on-one meetups'),
  metric('group-meetups-held', 'Group Meetups Held', 'Count', 'Completed group meetups'),
  metric(
    'most-frequent-event-host',
    'Most Frequent Event Host',
    'Text',
    'Client/organization with highest event bookings',
  ),
  metric(
    'most-frequent-meetup-host',
    'Most Frequent Meetup Host',
    'Text',
    'Client with highest meetup bookings',
  ),
  metric(
    'booking-completion-rate',
    'Booking Completion Rate',
    'Percentage',
    'Successful booking percentage',
  ),
  metric('total-revenue', 'Total Revenue', 'Currency', 'Revenue from completed bookings', true),
  metric('revenue-growth-rate', 'Revenue Growth Rate', 'Percentage', 'Growth over selected period'),
  metric(
    'average-revenue-per-event-booking',
    'Average Revenue per Event Booking',
    'Currency',
    'Average event booking value',
  ),
  metric(
    'average-revenue-per-meetup-booking',
    'Average Revenue per Meetup Booking',
    'Currency',
    'Average meetup booking value',
  ),
  metric(
    'average-revenue-per-space',
    'Average Revenue per Space',
    'Currency',
    'Revenue generated per space',
  ),
  metric(
    'average-booking-value',
    'Average Booking Value',
    'Currency',
    'Revenue per completed booking',
  ),
  metric(
    'highest-revenue-generating-space',
    'Highest Revenue Generating Space',
    'Text',
    'Top-performing space',
  ),
  metric(
    'space-utilization-rate',
    'Space Utilization Rate',
    'Percentage',
    'Utilization across all spaces',
  ),
  metric('peak-booking-time', 'Peak Booking Time', 'Text', 'Highest booking demand time'),
  metric(
    'last-booking-request-received-at',
    'Last Booking Request Received At',
    'Date',
    'Latest booking request timestamp',
  ),
  metric('cancellation-rate', 'Cancellation Rate', 'Percentage', 'Host cancellation percentage'),
  metric(
    'customer-satisfaction-score',
    'Customer Satisfaction Score',
    'Percentage',
    'Positive customer feedback',
  ),
  metric(
    'repeat-customer-rate',
    'Repeat Customer Rate',
    'Percentage',
    'Returning customer percentage',
  ),
]

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
