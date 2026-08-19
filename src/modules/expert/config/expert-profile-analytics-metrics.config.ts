export const EXPERT_PROFILE_ANALYTICS_MODULE_KEY = 'expert-profile-analytics'

export type ExpertProfileAnalyticsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Exactly 8 Service Analytics metrics — matches the Expert Profile Service Analytics tab. */
export const EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG: ExpertProfileAnalyticsMetricCatalogItem[] = [
  {
    id: 'events-hosted',
    label: 'Events Hosted',
    type: 'Count',
    description: 'Total events hosted by the expert',
    defaultActive: true,
  },
  {
    id: 'total-attendees',
    label: 'Total Attendees',
    type: 'Count',
    description: 'Total attendees across hosted events',
    defaultActive: true,
  },
  {
    id: 'repeat-attendees',
    label: 'Repeat Attendees',
    type: 'Count',
    description: 'Attendees who returned to multiple events',
    defaultActive: true,
  },
  {
    id: 'upcoming-events',
    label: 'Upcoming Events',
    type: 'Count',
    description: 'Scheduled upcoming events',
    defaultActive: true,
  },
  {
    id: 'event-completion-rate',
    label: 'Event Completion Rate',
    type: 'Percentage',
    description: 'Percentage of events completed successfully',
    defaultActive: true,
  },
  {
    id: 'avg-response-time',
    label: 'Avg. Response Time',
    type: 'Duration',
    description: 'Average response time to client inquiries',
    defaultActive: true,
  },
  {
    id: 'events-rejected',
    label: 'No. Of Events Rejected',
    type: 'Count',
    description: 'Events rejected by the expert or platform',
    defaultActive: true,
  },
  {
    id: 'events-suspended',
    label: 'No. of event Suspended',
    type: 'Count',
    description: 'Events suspended by the expert or platform',
    defaultActive: true,
  },
]

export const EXPERT_PROFILE_ANALYTICS_METRIC_IDS = EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET = new Set(EXPERT_PROFILE_ANALYTICS_METRIC_IDS)

export const DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS =
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.filter((metric) => metric.defaultActive).map(
    (metric) => metric.id,
  )

export const EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS =
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.length
