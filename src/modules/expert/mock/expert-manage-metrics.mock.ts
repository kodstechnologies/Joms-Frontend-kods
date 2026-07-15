import type {
  ManageMetricsAvailableItem,
  ManageMetricsListItem,
} from '@/shared/components/manage-metrics'

export const EXPERT_ACTIVE_METRICS: ManageMetricsListItem[] = [
  { id: 'total-experts', label: 'Total Experts', type: 'Count' },
  { id: 'active-experts', label: 'Active Experts', type: 'Count' },
  { id: 'total-revenue', label: 'Total Revenue', type: 'Count' },
  { id: 'avg-ratings', label: 'Avg. Ratings/Expert', type: 'Average' },
  { id: 'new-experts-mtd', label: 'New Experts (MTD)', type: 'Count' },
]

export const EXPERT_AVAILABLE_METRICS: ManageMetricsAvailableItem[] = [
  {
    id: 'inactive-experts',
    title: 'Inactive Experts',
    description: 'Experts currently marked inactive',
  },
  {
    id: 'avg-listings',
    title: 'Avg. Listings/Expert',
    description: 'Average service listings per expert',
  },
  {
    id: 'avg-response-time',
    title: 'Avg. Response Time',
    description: 'Average expert response time',
  },
  {
    id: 'category-coverage',
    title: 'Category Coverage %',
    description: 'Share of categories covered by experts',
  },
  {
    id: 'orders-completed',
    title: 'Total Orders Completed',
    description: 'Lifetime completed orders across experts',
  },
]

export const EXPERT_VISIBLE_COLUMNS: ManageMetricsListItem[] = [
  { id: 'expert-id', label: 'Expert ID', type: 'Text' },
  { id: 'name', label: 'Name', type: 'Text' },
  { id: 'email', label: 'Email ID', type: 'Text' },
  { id: 'profession', label: 'Profession', type: 'Text' },
  { id: 'status', label: 'Status', type: 'Status' },
  { id: 'service-type', label: 'Service Type', type: 'Text' },
  { id: 'created-at', label: 'Created At', type: 'Date' },
  { id: 'last-active', label: 'Last Active', type: 'Date' },
]

export const EXPERT_HIDDEN_COLUMNS: ManageMetricsAvailableItem[] = [
  {
    id: 'reason',
    title: 'Reason',
    description: 'Suspension or deletion reason',
    type: 'Text',
  },
  {
    id: 'reported-at',
    title: 'Reported At',
    description: 'When the expert was reported',
    type: 'Date',
  },
  {
    id: 'deleted-at',
    title: 'Deleted At',
    description: 'When the expert was deactivated',
    type: 'Date',
  },
]
