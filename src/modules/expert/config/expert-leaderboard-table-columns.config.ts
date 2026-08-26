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
    description: 'Expert leaderboard rank position',
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
    description: 'Expert display name',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Expert service category',
    defaultVisible: true,
  },
  {
    id: 'events-count',
    label: 'No.Of Events',
    type: 'Count',
    description: 'Number of events completed',
    defaultVisible: true,
  },
  {
    id: 'ratings',
    label: 'Ratings',
    type: 'Average',
    description: 'Average expert rating',
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

export const DEFAULT_EXPERT_LEADERBOARD_VISIBLE_COLUMN_IDS =
  EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
