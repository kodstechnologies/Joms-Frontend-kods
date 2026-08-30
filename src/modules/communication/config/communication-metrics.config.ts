export const COMMUNICATION_MODULE_KEY = 'communication'

export type CommunicationMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const COMMUNICATION_METRICS_CATALOG: CommunicationMetricCatalogItem[] = [
  {
    id: 'total-messages-sent',
    label: 'Total messages sent',
    type: 'Count',
    description: 'Messages with status Sent or Delivered',
    defaultActive: true,
  },
  {
    id: 'active-campaigns',
    label: 'Active campaigns',
    type: 'Count',
    description: 'Campaigns currently active or processing',
    defaultActive: true,
  },
  {
    id: 'channels-used',
    label: 'Channels used',
    type: 'Count',
    description: 'Distinct delivery channels used (email, in-app, push)',
    defaultActive: true,
  },
  {
    id: 'scheduled-messages',
    label: 'Scheduled messages',
    type: 'Count',
    description: 'Messages waiting to send',
    defaultActive: true,
  },
  {
    id: 'failed-undelivered',
    label: 'Failed/Undelivered',
    type: 'Count',
    description: 'Messages with status Failed',
    defaultActive: true,
  },
  {
    id: 'draft-messages',
    label: 'Draft messages',
    type: 'Count',
    description: 'Messages saved as draft',
    defaultActive: false,
  },
  {
    id: 'withdrawn-communications',
    label: 'Withdrawn communications',
    type: 'Count',
    description: 'Messages cancelled before delivery',
    defaultActive: false,
  },
  {
    id: 'total-clicks',
    label: 'Total clicks',
    type: 'Count',
    description: 'Clicks across all channels',
    defaultActive: false,
  },
  {
    id: 'click-through-rate',
    label: 'Click through rate',
    type: 'Percentage',
    description: 'Total clicks / delivered messages',
    defaultActive: false,
  },
  {
    id: 'open-rate',
    label: 'Open rate',
    type: 'Percentage',
    description: 'Opened messages / delivered messages',
    defaultActive: false,
  },
  {
    id: 'delivery-rate',
    label: 'Delivery rate',
    type: 'Percentage',
    description: 'Delivered messages / total messages sent',
    defaultActive: false,
  },
  {
    id: 'bounce-rate',
    label: 'Bounce rate',
    type: 'Percentage',
    description: 'Failed deliveries / total messages sent',
    defaultActive: false,
  },
  {
    id: 'most-used-channel',
    label: 'Most used channel',
    type: 'Text',
    description: 'Channel with the highest send count',
    defaultActive: false,
  },
  {
    id: 'most-engaged-audience',
    label: 'Most engaged audience',
    type: 'Text',
    description: 'Audience with the highest click-through rate',
    defaultActive: false,
  },
  {
    id: 'top-performing-campaign',
    label: 'Top performing campaign',
    type: 'Text',
    description: 'Campaign with the highest click-through rate',
    defaultActive: false,
  },
]

export const COMMUNICATION_METRIC_IDS = COMMUNICATION_METRICS_CATALOG.map((metric) => metric.id)

export const COMMUNICATION_METRIC_ID_SET = new Set(COMMUNICATION_METRIC_IDS)

export const DEFAULT_COMMUNICATION_METRIC_IDS = COMMUNICATION_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const COMMUNICATION_MAX_ACTIVE_METRICS = COMMUNICATION_METRICS_CATALOG.length
