export const VENUE_LEADERBOARD_MODULE_KEY = 'venue-leaderboard'

export type VenueLeaderboardTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG: VenueLeaderboardTableColumnCatalogItem[] = [
  {
    id: 'rank',
    label: 'Rank',
    type: 'Count',
    description: 'Venue leaderboard rank position',
    defaultVisible: true,
  },
  {
    id: 'venue-id',
    label: 'Venue ID',
    type: 'Text',
    description: 'Unique venue identifier',
    defaultVisible: true,
  },
  {
    id: 'venue-name',
    label: 'Venue Name',
    type: 'Text',
    description: 'Venue display name',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Venue category',
    defaultVisible: true,
  },
  {
    id: 'events-count',
    label: 'No.Of Events',
    type: 'Count',
    description: 'Number of events hosted',
    defaultVisible: true,
  },
  {
    id: 'ratings',
    label: 'Ratings',
    type: 'Average',
    description: 'Average venue rating',
    defaultVisible: true,
  },
  {
    id: 'score',
    label: 'Score',
    type: 'Count',
    description: 'Performance score',
    defaultVisible: true,
  },
]

export const DEFAULT_VENUE_LEADERBOARD_VISIBLE_COLUMN_IDS =
  VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
