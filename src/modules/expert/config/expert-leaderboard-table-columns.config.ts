/**
 * Expert Leaderboard — table column catalog.
 * Source: JOMS_KODS_Web_Admin_Panel_full_data → Experts Leaderboard.
 * Keep ids kebab-case to match Manage Metrics / ui-preferences.
 */

export const EXPERT_LEADERBOARD_MODULE_KEY = 'expert-leaderboard'

export type ExpertLeaderboardTableColumnCatalogItem = {
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
): ExpertLeaderboardTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG: ExpertLeaderboardTableColumnCatalogItem[] = [
  col('rank', 'Rank', 'Count', 'Current ranking position', true),
  col('expert-id', 'Expert ID', 'Text', 'Unique expert identifier', true),
  col('expert-name', 'Expert Name', 'Text', 'Registered expert name', true),
  col('category', 'Category', 'Text', 'Marketplace category', true),
  col('membership-type', 'Membership Type', 'Text', 'Expert subscription plan'),
  col(
    'orders-completed',
    'No. Of Events',
    'Count',
    'Successfully completed service orders and consultations',
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
  col('services-listed', 'Services Listed', 'Count', 'Total services published'),
  col('consultations-listed', 'Consultations Listed', 'Count', 'Total consultation listings'),
  col('repeat-client-rate', 'Repeat Client Rate', 'Percentage', 'Percentage of returning clients'),
  col(
    'order-completion-rate',
    'Order Completion Rate',
    'Percentage',
    'Percentage of successfully completed orders',
  ),
  col('last-active', 'Last Active', 'Date', 'Most recent platform activity'),
]

export const DEFAULT_EXPERT_LEADERBOARD_VISIBLE_COLUMN_IDS =
  EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

/** Maps legacy preference ids → current catalog ids. */
export const EXPERT_LEADERBOARD_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'events-count': 'orders-completed',
  ratings: 'average-rating',
  eventsCompleted: 'orders-completed',
  averageRating: 'average-rating',
  membershipType: 'membership-type',
  ordersCompleted: 'orders-completed',
  profileHealth: 'profile-health-score',
  clientSatisfaction: 'client-satisfaction-score',
  totalRevenue: 'total-revenue',
  servicesListed: 'services-listed',
  consultationsListed: 'consultations-listed',
  repeatClientRate: 'repeat-client-rate',
  orderCompletionRate: 'order-completion-rate',
  lastActiveAt: 'last-active',
  lastActive: 'last-active',
  expertId: 'expert-id',
  expertName: 'expert-name',
}
