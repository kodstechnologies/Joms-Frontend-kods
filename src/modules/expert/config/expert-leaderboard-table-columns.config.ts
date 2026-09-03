export const EXPERT_LEADERBOARD_MODULE_KEY = 'expert-leaderboard'

export type ExpertLeaderboardTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG: ExpertLeaderboardTableColumnCatalogItem[] = [
  {
    id: 'rank',
    label: 'Rank',
    type: 'Count',
    description: 'Current ranking position',
    defaultVisible: true,
  },
  {
    id: 'expert-id',
    label: 'Expert ID',
    type: 'Text',
    description: 'Unique expert identifier',
    defaultVisible: true,
  },
  {
    id: 'expert-name',
    label: 'Expert Name',
    type: 'Text',
    description: 'Registered expert name',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Marketplace category',
    defaultVisible: true,
  },
  {
    id: 'membership-type',
    label: 'Membership Type',
    type: 'Text',
    description: 'Expert subscription plan',
    defaultVisible: false,
  },
  {
    id: 'orders-completed',
    label: 'No. Of Events',
    type: 'Count',
    description: 'Successfully completed service orders and consultations',
    defaultVisible: true,
  },
  {
    id: 'average-rating',
    label: 'Ratings',
    type: 'Average',
    description: 'Overall customer rating',
    defaultVisible: true,
  },
  {
    id: 'score',
    label: 'Score',
    type: 'Count',
    description: 'Calculated performance score (0–100)',
    defaultVisible: true,
  },
  {
    id: 'profile-health-score',
    label: 'Profile Health Score',
    type: 'Count',
    description: 'Overall profile completeness and compliance score',
    defaultVisible: false,
  },
  {
    id: 'client-satisfaction-score',
    label: 'Client Satisfaction Score',
    type: 'Percentage',
    description: 'Percentage of positive customer ratings',
    defaultVisible: false,
  },
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    type: 'Currency',
    description: 'Total revenue generated',
    defaultVisible: false,
  },
  {
    id: 'services-listed',
    label: 'Services Listed',
    type: 'Count',
    description: 'Total services published',
    defaultVisible: false,
  },
  {
    id: 'consultations-listed',
    label: 'Consultations Listed',
    type: 'Count',
    description: 'Total consultation listings',
    defaultVisible: false,
  },
  {
    id: 'repeat-client-rate',
    label: 'Repeat Client Rate',
    type: 'Percentage',
    description: 'Percentage of returning clients',
    defaultVisible: false,
  },
  {
    id: 'order-completion-rate',
    label: 'Order Completion Rate',
    type: 'Percentage',
    description: 'Percentage of successfully completed orders',
    defaultVisible: false,
  },
  {
    id: 'last-active',
    label: 'Last Active',
    type: 'Date',
    description: 'Most recent platform activity',
    defaultVisible: false,
  },
]

export const DEFAULT_EXPERT_LEADERBOARD_VISIBLE_COLUMN_IDS =
  EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

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
