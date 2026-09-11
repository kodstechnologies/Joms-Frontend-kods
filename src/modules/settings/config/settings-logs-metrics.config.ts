import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const SETTINGS_LOGS_MODULE_KEY = 'settings-logs'

export type SettingsLogsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const SETTINGS_LOGS_METRIC_DEFS: MetricRowTuple[] = [
  ['total-actions', 'Total Actions Performed', 'Count', 'Total settings actions logged', true],
  [
    'successful-actions',
    'Successful Actions',
    'Count',
    'Successfully completed settings actions',
    true,
  ],
  ['failed-actions', 'Failed Actions', 'Count', 'Failed settings actions', true],
  ['pending-actions', 'Pending Actions', 'Count', 'Pending settings actions', true],
]

export const SETTINGS_LOGS_METRICS_CATALOG = catalogFromMetricRows(
  SETTINGS_LOGS_METRIC_DEFS,
) as SettingsLogsMetricCatalogItem[]

const derived = deriveMetricExports(SETTINGS_LOGS_METRICS_CATALOG)
export const SETTINGS_LOGS_MAX_ACTIVE_METRICS = derived.maxActive
export const SETTINGS_LOGS_METRIC_IDS = derived.ids
export const SETTINGS_LOGS_METRIC_ID_SET = derived.idSet
export const DEFAULT_SETTINGS_LOGS_METRIC_IDS = derived.defaultIds
