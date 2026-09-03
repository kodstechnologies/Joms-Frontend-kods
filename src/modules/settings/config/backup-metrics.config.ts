export const BACKUP_MODULE_KEY = 'backup-configuration'

export type BackupMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const BACKUP_METRICS_CATALOG: BackupMetricCatalogItem[] = [
  {
    id: 'total-backups',
    label: 'Total Backups',
    type: 'Count',
    description: 'Total backup jobs created',
    defaultActive: true,
  },
  {
    id: 'last-backup',
    label: 'Last Backup',
    type: 'Count',
    description: 'Hours since the most recent backup',
    defaultActive: true,
  },
  {
    id: 'storage-used',
    label: 'Storage Used',
    type: 'Count',
    description: 'Estimated storage used by backups',
    defaultActive: true,
  },
  {
    id: 'failed-backup',
    label: 'Failed Backup',
    type: 'Count',
    description: 'Failed or pending backup jobs',
    defaultActive: true,
  },
]

export const BACKUP_METRIC_IDS = BACKUP_METRICS_CATALOG.map((metric) => metric.id)

export const BACKUP_METRIC_ID_SET = new Set(BACKUP_METRIC_IDS)

export const DEFAULT_BACKUP_METRIC_IDS = BACKUP_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const BACKUP_MAX_ACTIVE_METRICS = BACKUP_METRICS_CATALOG.length

export const BACKUP_HISTORY_COLUMNS_CATALOG = [
  {
    id: 'backup-id',
    label: 'Backup ID',
    type: 'Text',
    description: 'Backup name or identifier',
    defaultVisible: true,
  },
  {
    id: 'type',
    label: 'Type',
    type: 'Text',
    description: 'Automatic or Manual',
    defaultVisible: true,
  },
  {
    id: 'scope',
    label: 'Scope',
    type: 'Text',
    description: 'Full System or Partial',
    defaultVisible: true,
  },
  {
    id: 'created-by',
    label: 'Created By',
    type: 'Text',
    description: 'Who created the backup',
    defaultVisible: true,
  },
  {
    id: 'timestamps',
    label: 'Timestamps',
    type: 'Date',
    description: 'When the backup was created',
    defaultVisible: true,
  },
  {
    id: 'size',
    label: 'Size',
    type: 'Text',
    description: 'Backup file size',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Backup job status',
    defaultVisible: true,
  },
]
