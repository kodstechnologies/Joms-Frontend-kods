import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const BACKUP_MODULE_KEY = 'backup-configuration'

export type BackupMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const BACKUP_METRIC_DEFS: MetricRowTuple[] = [
  ['total-backups', 'Total Backups', 'Count', 'Total backup jobs created', true],
  ['last-backup', 'Last Backup', 'Count', 'Hours since the most recent backup', true],
  ['storage-used', 'Storage Used', 'Count', 'Estimated storage used by backups', true],
  ['failed-backup', 'Failed Backup', 'Count', 'Failed or pending backup jobs', true],
]

export const BACKUP_METRICS_CATALOG = catalogFromMetricRows(
  BACKUP_METRIC_DEFS,
) as BackupMetricCatalogItem[]

const derived = deriveMetricExports(BACKUP_METRICS_CATALOG)
export const BACKUP_METRIC_IDS = derived.ids
export const BACKUP_METRIC_ID_SET = derived.idSet
export const DEFAULT_BACKUP_METRIC_IDS = derived.defaultIds
export const BACKUP_MAX_ACTIVE_METRICS = derived.maxActive

type BackupColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = true,
): BackupColumnCatalogItem => ({ id, label, type, description, defaultVisible })

export const BACKUP_HISTORY_COLUMNS_CATALOG: BackupColumnCatalogItem[] = [
  col('backup-id', 'Backup ID', 'Text', 'Backup name or identifier'),
  col('type', 'Type', 'Text', 'Automatic or Manual'),
  col('scope', 'Scope', 'Text', 'Full System or Partial'),
  col('created-by', 'Created By', 'Text', 'Who created the backup'),
  col('timestamps', 'Timestamps', 'Date', 'When the backup was created'),
  col('size', 'Size', 'Text', 'Backup file size'),
  col('status', 'Status', 'Status', 'Backup job status'),
]
