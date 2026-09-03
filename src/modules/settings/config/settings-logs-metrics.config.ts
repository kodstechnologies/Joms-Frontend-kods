import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

export const SETTINGS_LOGS_MODULE_KEY = 'settings-logs'

export type SettingsLogsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const SETTINGS_LOGS_METRICS_CATALOG: SettingsLogsMetricCatalogItem[] = [
  {
    id: 'total-actions',
    label: 'Total Actions Performed',
    type: 'Count',
    description: 'Total settings actions logged',
    defaultActive: true,
  },
  {
    id: 'successful-actions',
    label: 'Successful Actions',
    type: 'Count',
    description: 'Successfully completed settings actions',
    defaultActive: true,
  },
  {
    id: 'failed-actions',
    label: 'Failed Actions',
    type: 'Count',
    description: 'Failed settings actions',
    defaultActive: true,
  },
  {
    id: 'pending-actions',
    label: 'Pending Actions',
    type: 'Count',
    description: 'Pending settings actions',
    defaultActive: true,
  },
]

const derived = deriveMetricExports(SETTINGS_LOGS_METRICS_CATALOG)
export const SETTINGS_LOGS_MAX_ACTIVE_METRICS = derived.maxActive
export const SETTINGS_LOGS_METRIC_IDS = derived.ids
export const SETTINGS_LOGS_METRIC_ID_SET = derived.idSet
export const DEFAULT_SETTINGS_LOGS_METRIC_IDS = derived.defaultIds
