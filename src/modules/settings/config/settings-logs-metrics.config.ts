export const SETTINGS_LOGS_MODULE_KEY = 'settings-logs'

export type SettingsLogsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
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

export const SETTINGS_LOGS_METRICS_CATALOG: SettingsLogsMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const SETTINGS_LOGS_MAX_ACTIVE_METRICS = SETTINGS_LOGS_METRICS_CATALOG.length

export const SETTINGS_LOGS_METRIC_IDS = SETTINGS_LOGS_METRICS_CATALOG.map((metric) => metric.id)

export const SETTINGS_LOGS_METRIC_ID_SET = new Set(SETTINGS_LOGS_METRIC_IDS)

export const DEFAULT_SETTINGS_LOGS_METRIC_IDS = SETTINGS_LOGS_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)
