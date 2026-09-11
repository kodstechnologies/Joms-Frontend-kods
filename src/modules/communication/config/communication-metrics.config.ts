import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const COMMUNICATION_MODULE_KEY = 'communication'

export type CommunicationMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const COMMUNICATION_METRIC_DEFS: MetricRowTuple[] = [
  [
    'total-messages-sent',
    'Total messages sent',
    'Count',
    'Messages with status Sent or Delivered',
    true,
  ],
  [
    'active-campaigns',
    'Active campaigns',
    'Count',
    'Campaigns currently active or processing',
    true,
  ],
  [
    'channels-used',
    'Channels used',
    'Count',
    'Distinct delivery channels used (email, in-app, push)',
    true,
  ],
  ['scheduled-messages', 'Scheduled messages', 'Count', 'Messages waiting to send', true],
  ['failed-undelivered', 'Failed/Undelivered', 'Count', 'Messages with status Failed', true],
  ['draft-messages', 'Draft messages', 'Count', 'Messages saved as draft'],
  [
    'withdrawn-communications',
    'Withdrawn communications',
    'Count',
    'Messages cancelled before delivery',
  ],
  ['total-clicks', 'Total clicks', 'Count', 'Clicks across all channels'],
  ['click-through-rate', 'Click through rate', 'Percentage', 'Total clicks / delivered messages'],
  ['open-rate', 'Open rate', 'Percentage', 'Opened messages / delivered messages'],
  ['delivery-rate', 'Delivery rate', 'Percentage', 'Delivered messages / total messages sent'],
  ['bounce-rate', 'Bounce rate', 'Percentage', 'Failed deliveries / total messages sent'],
  ['most-used-channel', 'Most used channel', 'Text', 'Channel with the highest send count'],
  [
    'most-engaged-audience',
    'Most engaged audience',
    'Text',
    'Audience with the highest click-through rate',
  ],
  [
    'top-performing-campaign',
    'Top performing campaign',
    'Text',
    'Campaign with the highest click-through rate',
  ],
]

export const COMMUNICATION_METRICS_CATALOG = catalogFromMetricRows(
  COMMUNICATION_METRIC_DEFS,
) as CommunicationMetricCatalogItem[]

const derived = deriveMetricExports(COMMUNICATION_METRICS_CATALOG)
export const COMMUNICATION_METRIC_IDS = derived.ids
export const COMMUNICATION_METRIC_ID_SET = derived.idSet
export const DEFAULT_COMMUNICATION_METRIC_IDS = derived.defaultIds
export const COMMUNICATION_MAX_ACTIVE_METRICS = derived.maxActive
