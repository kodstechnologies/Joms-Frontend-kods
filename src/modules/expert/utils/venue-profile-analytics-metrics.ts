import { VENUE_PROFILE_ANALYTICS_METRICS_CATALOG } from '@/modules/expert/config/venue-profile-analytics-metrics.config'
import type {
  MetricItem,
  VenueProfileAnalyticsResponse,
} from '@/modules/expert/type/venue-analytics.types'

export type VenueProfileAnalyticsMetricCard = {
  id: string
  label: string
  value: string
}

const DASH = '—'

const findByLabel = (groups: Array<MetricItem[] | undefined>, labels: string[]) => {
  const normalized = labels.map((label) => label.toLowerCase())
  for (const group of groups) {
    if (!group?.length) continue
    const found = group.find((item) => normalized.includes(String(item.label || '').toLowerCase()))
    if (found?.value != null && found.value !== '') return String(found.value)
  }
  return null
}

const fromVenueBag = (venueAnalytics?: Record<string, unknown> | null, key?: string) => {
  if (!venueAnalytics || !key) return null
  const value = venueAnalytics[key]
  if (value == null || value === '') return null
  return String(value)
}

export function buildVenueProfileAnalyticsMetricCards(
  analytics?: VenueProfileAnalyticsResponse | null,
  venueAnalytics?: Record<string, unknown> | null,
): VenueProfileAnalyticsMetricCard[] {
  const overview = analytics?.overview
  const spaces = analytics?.spaces?.spaceAnalysis
  const eventMetrics = analytics?.bookings?.eventMetrics
  const meetupMetrics = analytics?.bookings?.meetupMetrics
  const revenueKpis = analytics?.revenue?.revenueKpis
  const cardsFromApi = analytics?.profileCards

  const groups = [
    overview?.basicInfo,
    overview?.visibilityMetrics,
    overview?.bookingSnapshot,
    overview?.revenueSnapshot,
    spaces,
    eventMetrics,
    meetupMetrics,
    revenueKpis,
  ]

  const resolve = (labels: string[], fallbackKeys: string[] = []) => {
    const fromLabels = findByLabel(groups, labels)
    if (fromLabels) return fromLabels
    for (const key of fallbackKeys) {
      const fromBag = fromVenueBag(venueAnalytics, key)
      if (fromBag) return fromBag
    }
    return DASH
  }

  const valueById: Record<string, string> = {
    'account-status': resolve(['Account Status'], ['accountStatus']),
    'last-active': resolve(['Last Active'], ['lastActive']),
    'venue-partner-rating': resolve(['Venue Partner Rating', 'Venue Rating'], ['venueRating']),
    'venue-category': resolve(['Venue Category'], ['venueCategory']),
    'profile-views': resolve(['Profile Views'], ['profileViews']),
    'conversion-rate': resolve(['Conversion Rate'], ['conversionRate']),
    'total-spaces-listed': resolve(['Total Spaces Listed'], ['totalSpacesListed']),
    'active-spaces': resolve(['Active Spaces'], ['activeSpaces']),
    'inactive-paused-spaces': resolve(
      ['Inactive / Paused Spaces', 'Inactive Spaces'],
      ['inactiveSpaces'],
    ),
    'most-viewed-space': resolve(['Most Viewed Space'], ['mostViewedSpace']),
    'total-booking-requests': resolve(['Total Booking Requests'], ['totalBookingRequests']),
    'total-bookings-confirmed': resolve(['Total Bookings Confirmed'], ['totalBookingsConfirmed']),
    'total-bookings-completed': resolve(['Total Bookings Completed'], ['totalBookingsCompleted']),
    'scheduled-bookings': resolve(
      ['Scheduled Bookings', 'Upcoming Bookings'],
      ['upcomingBookings'],
    ),
    'cancelled-bookings': resolve(
      ['Cancelled Bookings', 'Canceled Bookings'],
      ['canceledBookings'],
    ),
    'ongoing-bookings': resolve(['Ongoing Bookings'], ['ongoingBookings']),
    'total-event-bookings-confirmed':
      cardsFromApi?.eventsHosted ||
      resolve(['Total Event Bookings Confirmed', 'Event Bookings Confirmed']),
    'total-event-bookings-completed': resolve([
      'Total Event Bookings Completed',
      'Event Bookings Completed',
    ]),
    'scheduled-event-bookings': resolve(['Scheduled Event Bookings']),
    'cancelled-event-bookings': resolve(['Cancelled Event Bookings']),
    'ongoing-event-bookings': resolve(['Ongoing Event Bookings']),
    'total-meetup-bookings-confirmed': resolve(['Total Meetup Bookings Confirmed']),
    'total-meetup-bookings-completed': resolve(['Total Meetup Bookings Completed']),
    'scheduled-meetup-bookings': resolve(['Scheduled Meetup Bookings']),
    'cancelled-meetup-bookings': resolve(['Cancelled Meetup Bookings']),
    'ongoing-meetup-bookings': resolve(['Ongoing Meetup Bookings']),
    'one-on-one-meetups-held': resolve(['1-on-1 Meetups Held']),
    'group-meetups-held': resolve(['Group Meetups Held']),
    'most-frequent-event-host': resolve(['Most Frequent Event Host']),
    'most-frequent-meetup-host': resolve(['Most Frequent Meetup Host']),
    'booking-completion-rate':
      cardsFromApi?.eventCompletionRate ||
      resolve(['Booking Completion Rate'], ['bookingCompletionRate']),
    'total-revenue': resolve(['Total Revenue'], ['totalRevenue']),
    'revenue-growth-rate': resolve(['Revenue Growth Rate'], ['revenueGrowthRate']),
    'average-revenue-per-event-booking': resolve(['Average Revenue per Event Booking']),
    'average-revenue-per-meetup-booking': resolve(['Average Revenue per Meetup Booking']),
    'average-revenue-per-space': resolve(
      ['Average Revenue per Space', 'Avg Revenue per Space'],
      ['avgRevenuePerSpace'],
    ),
    'average-booking-value': resolve(
      ['Average Booking Value', 'Avg Revenue per Booking'],
      ['avgRevenuePerBooking'],
    ),
    'highest-revenue-generating-space': resolve(
      ['Highest Revenue Generating Space', 'Highest Revenue Space'],
      ['highestRevenueSpace'],
    ),
    'space-utilization-rate': resolve(['Space Utilization Rate'], ['spaceUtilizationRate']),
    'peak-booking-time': resolve(['Peak Booking Time'], ['peakBookingTime']),
    'last-booking-request-received-at': resolve(
      ['Last Booking Request Received At', 'Last Booking Request'],
      ['lastBookingRequest'],
    ),
    'cancellation-rate': resolve(['Cancellation Rate'], ['cancellationRate']),
    'customer-satisfaction-score': resolve(
      ['Customer Satisfaction Score'],
      ['customerSatisfactionScore'],
    ),
    'repeat-customer-rate': cardsFromApi?.repeatAttendees
      ? `${cardsFromApi.repeatAttendees}`
      : resolve(['Repeat Customer Rate'], ['repeatCustomerRate']),
  }

  return VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: valueById[metric.id] ?? DASH,
  }))
}
