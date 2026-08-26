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
    description: 'Recipient emails successfully sent',
    defaultActive: true,
  },
  {
    id: 'active-campaigns',
    label: 'Active campaigns',
    type: 'Count',
    description: 'Scheduled and active campaigns',
    defaultActive: true,
  },
  {
    id: 'channels-used',
    label: 'Channels used',
    type: 'Count',
    description: 'Distinct delivery channels used',
    defaultActive: true,
  },
  {
    id: 'scheduled-messages',
    label: 'Scheduled messages',
    type: 'Count',
    description: 'Campaigns waiting to send',
    defaultActive: true,
  },
  {
    id: 'failed-undelivered',
    label: 'Failed/Undelivered',
    type: 'Count',
    description: 'Failed campaigns and recipients',
    defaultActive: true,
  },
]

export const COMMUNICATION_METRIC_IDS = COMMUNICATION_METRICS_CATALOG.map((metric) => metric.id)

export const COMMUNICATION_METRIC_ID_SET = new Set(COMMUNICATION_METRIC_IDS)

export const DEFAULT_COMMUNICATION_METRIC_IDS = COMMUNICATION_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const COMMUNICATION_MAX_ACTIVE_METRICS = COMMUNICATION_METRICS_CATALOG.length
