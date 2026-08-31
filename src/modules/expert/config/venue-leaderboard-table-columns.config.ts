export const VENUE_LEADERBOARD_MODULE_KEY = 'venue-leaderboard'

export type VenueLeaderboardTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): VenueLeaderboardTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG: VenueLeaderboardTableColumnCatalogItem[] = [
  col('rank', 'Rank', 'Count', 'Current ranking position', true),
  col('venue-id', 'Venue ID', 'Text', 'Unique venue identifier', true),
  col('venue-name', 'Venue Name', 'Text', 'Registered venue name', true),
  col('category', 'Category', 'Text', 'Marketplace category', true),
  col('membership-type', 'Membership Type', 'Text', 'Venue subscription plan'),
  col(
    'orders-completed',
    'No. Of Events',
    'Count',
    'Successfully completed venue bookings and events',
    true,
  ),
  col('average-rating', 'Ratings', 'Average', 'Overall customer rating', true),
  col('score', 'Score', 'Count', 'Calculated performance score (0–100)', true),
  col(
    'profile-health-score',
    'Profile Health Score',
    'Count',
    'Overall profile completeness and compliance score',
  ),
  col(
    'client-satisfaction-score',
    'Client Satisfaction Score',
    'Percentage',
    'Percentage of positive customer ratings',
  ),
  col('total-revenue', 'Total Revenue', 'Currency', 'Total revenue generated'),
  col('repeat-client-rate', 'Repeat Client Rate', 'Percentage', 'Percentage of returning clients'),
  col(
    'order-completion-rate',
    'Order Completion Rate',
    'Percentage',
    'Percentage of successfully completed orders',
  ),
  col('last-active', 'Last Active', 'Date', 'Most recent platform activity'),
]

export const DEFAULT_VENUE_LEADERBOARD_VISIBLE_COLUMN_IDS =
  VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const VENUE_LEADERBOARD_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'events-count': 'orders-completed',
  ratings: 'average-rating',
  eventsCompleted: 'orders-completed',
  averageRating: 'average-rating',
  membershipType: 'membership-type',
  ordersCompleted: 'orders-completed',
  profileHealth: 'profile-health-score',
  clientSatisfaction: 'client-satisfaction-score',
  totalRevenue: 'total-revenue',
  // Dropped venue-inapplicable listing columns → nearest useful metric columns
  servicesListed: 'total-revenue',
  consultationsListed: 'client-satisfaction-score',
  'services-listed': 'total-revenue',
  'consultations-listed': 'client-satisfaction-score',
  repeatClientRate: 'repeat-client-rate',
  orderCompletionRate: 'order-completion-rate',
  lastActiveAt: 'last-active',
  lastActive: 'last-active',
  venueId: 'venue-id',
  venueName: 'venue-name',
  'expert-id': 'venue-id',
  'expert-name': 'venue-name',
}
