import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { HardDriveDownload, RotateCcw, Settings2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { RestoreBackupModal } from './restore-backup-modal'
import {
  useBackupMetrics,
  useBackups,
  useDeleteBackup,
  useRestoreBackup,
  useRunBackup,
} from '../hooks/use-backups'
import { fetchBackups } from '../api/backups-api'
import type { BackupHistoryRow, SettingsMetric } from '../types/settings'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { SETTINGS_BACKUPS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  BACKUP_HISTORY_COLUMNS_CATALOG,
  BACKUP_MODULE_KEY,
  DEFAULT_BACKUP_HISTORY_VISIBLE_COLUMN_IDS,
  DEFAULT_BACKUP_METRIC_IDS,
} from '../config/backup-metrics.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { buildFinancePreferenceColumns } from '@/modules/payments/utils/finance-table-column-utils'

const PAGE_SIZE = 10

const BACKUP_SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'name',
  'type',
  'scope',
  'createdBy',
  'timestamp',
  'size',
  'status',
])

const BACKUP_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: BackupHistoryRow) => string }
> = {
  'backup-id': { header: 'Backup ID', accessor: (row) => exportDisplayValue(row.name) },
  type: { header: 'Type', accessor: (row) => exportDisplayValue(row.type) },
  scope: { header: 'Scope', accessor: (row) => exportDisplayValue(row.scope) },
  'created-by': { header: 'Created By', accessor: (row) => exportDisplayValue(row.createdBy) },
  timestamps: { header: 'Timestamps', accessor: (row) => exportDisplayValue(row.timestamp) },
  size: { header: 'Size', accessor: (row) => exportDisplayValue(row.size) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
}

function splitTimestamp(value: string) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return { date: '—', time: '' }

  // "26/02/2026 02:30 PM" or "26th Feb 02:30 PM"
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 3 && /(AM|PM)/i.test(parts[parts.length - 1])) {
    return {
      date: parts.slice(0, -2).join(' '),
      time: `${parts[parts.length - 2]} ${parts[parts.length - 1]}`,
    }
  }
  if (parts.length >= 2) {
    return { date: parts[0], time: parts.slice(1).join(' ') }
  }
  return { date: trimmed, time: '' }
}

function ScopeCell({ scope }: { scope: string }) {
  const match = scope.match(/^(Partial)\s*\((.+)\)$/i)
  if (match) {
    return (
      <div className="backup-scope">
        <span className="backup-cell-primary">{match[1]}</span>
        <span className="backup-scope-sub">{match[2]}</span>
      </div>
    )
  }
  return <span className="backup-cell-primary">{scope}</span>
}

function StatusBadge({ status }: { status: BackupHistoryRow['status'] | string }) {
  const tone =
    status === 'Completed' || status === 'Restored'
      ? 'is-success'
      : status === 'Failed'
        ? 'is-danger'
        : 'is-pending'

  return <span className={cn('backup-status-pill', tone)}>{status}</span>
}

export function BackupRestorePanel() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: BACKUP_SORT_FIELD_MAP,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<BackupHistoryRow | null>(null)

  const { data: metrics = [], isLoading: metricsLoading } = useBackupMetrics()
  const metricCards: SettingsMetric[] = metricsLoading ? [] : metrics
  const activeMetricIds = useActiveMetricIds(BACKUP_MODULE_KEY, DEFAULT_BACKUP_METRIC_IDS)
  const visibleMetricCards = useMemo(() => {
    const withIds = metricCards.filter((metric): metric is SettingsMetric & { id: string } =>
      Boolean(metric.id),
    )
    if (!withIds.length) return metricCards
    const ordered = orderByActiveMetricIds(withIds, activeMetricIds)
    return ordered.length ? ordered : metricCards
  }, [activeMetricIds, metricCards])

  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )

  const { data: backupsResult, isLoading } = useBackups(listQueryParams)
  const restoreMutation = useRestoreBackup()
  const deleteMutation = useDeleteBackup()
  const runMutation = useRunBackup()
  const warnedRef = useRef<string | null>(null)
  const tableColumnPreferencesQuery = useTableColumnPreferences(BACKUP_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => BACKUP_HISTORY_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_BACKUP_HISTORY_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const rows = backupsResult?.data ?? []
  const meta = backupsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  useEffect(() => {
    const warning = meta?.warning
    if (!warning || warnedRef.current === warning) return
    warnedRef.current = warning
    toast.warning(warning)
  }, [meta?.warning])

  const handleRunBackup = () => {
    runMutation.mutate(
      { name: 'Manual Backup' },
      {
        onSuccess: (result) => {
          if (result && typeof result === 'object' && 'rdsError' in result && result.rdsError) {
            toast.success('Local backup created (cloud unavailable)')
            toast.warning(String(result.rdsError))
            return
          }
          const status = result && typeof result === 'object' ? String(result.status || '') : ''
          if (status === 'Completed') {
            toast.success('Backup completed')
            return
          }
          toast.success('Backup started')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Backup failed')),
      },
    )
  }

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchBackups(params)
      return { data: result.data ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      BACKUP_EXPORT_COLUMN_MAP,
      'backups_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'backups',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<BackupHistoryRow>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<BackupHistoryRow>> = {
      'backup-id': {
        id: 'backup-id',
        accessorKey: 'name',
        header: 'Backup ID',
        cell: ({ row }) => (
          <span className="backup-cell-primary" title={row.original.name}>
            {row.original.name}
          </span>
        ),
      },
      type: {
        id: 'type',
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <span className="backup-cell-primary">{row.original.type}</span>,
      },
      scope: {
        id: 'scope',
        accessorKey: 'scope',
        header: 'Scope',
        cell: ({ row }) => <ScopeCell scope={row.original.scope} />,
      },
      'created-by': {
        id: 'created-by',
        accessorKey: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => <span className="backup-cell-primary">{row.original.createdBy}</span>,
      },
      timestamps: {
        id: 'timestamps',
        accessorKey: 'timestamp',
        header: 'Timestamps',
        cell: ({ row }) => {
          const { date, time } = splitTimestamp(row.original.timestamp)
          return (
            <div className="backup-timestamp">
              <span className="backup-cell-primary">{date}</span>
              {time ? <span className="backup-timestamp-time">{time}</span> : null}
            </div>
          )
        },
      },
      size: {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => <span className="backup-cell-primary">{row.original.size}</span>,
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    }

    const preferenceColumns = buildFinancePreferenceColumns(
      dataColumnsById,
      catalogColumnIds,
      tableColumnPreferencesQuery.data?.visibleColumnIds,
      DEFAULT_BACKUP_HISTORY_VISIBLE_COLUMN_IDS,
    )

    const actionsColumn: ColumnDef<BackupHistoryRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => (
        <TableActionsDropdown
          label="Backup actions"
          isOpen={menuOpenId === row.original.id}
          onOpenChange={(open) => setMenuOpenId(open ? row.original.id : null)}
          menuWidth={140}
          menuClassName="ui-table-actions-menu-access"
        >
          <TableActionsItem
            icon={<RotateCcw className="size-3.5" />}
            onClick={() => {
              setMenuOpenId(null)
              setRestoreTarget(row.original)
            }}
          >
            Restore
          </TableActionsItem>
          <TableActionsItem
            className="ui-table-actions-item-danger"
            icon={<Trash2 className="size-3.5" />}
            onClick={() => {
              setMenuOpenId(null)
              deleteMutation.mutate(row.original.id, {
                onSuccess: () => toast.success('Backup deleted'),
                onError: () => toast.error('Delete failed'),
              })
            }}
          >
            Delete
          </TableActionsItem>
        </TableActionsDropdown>
      ),
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], BACKUP_SORT_FIELD_MAP)
  }, [
    catalogColumnIds,
    deleteMutation,
    menuOpenId,
    tableColumnPreferencesQuery.data?.visibleColumnIds,
  ])

  return (
    <div className="backup-page">
      <div className="backup-header">
        <div>
          <h2 className="referral-page-title">Backups &amp; Restore</h2>
          <p className="referral-page-subtitle mt-1">View, download, and restore system backups</p>
        </div>
        <div className="backup-actions">
          <Button
            variant="secondary"
            className="ui-manage-metrics inline-flex items-center gap-2"
            onClick={() => navigate('/metrics/backup-configuration')}
          >
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
          </Button>
          <Button
            variant="secondary"
            className="inline-flex items-center gap-2"
            onClick={handleRunBackup}
            disabled={runMutation.isPending}
          >
            <HardDriveDownload className="size-4 shrink-0" />
            {runMutation.isPending ? 'Running…' : 'Run Backup'}
          </Button>
          <Button
            className="backup-configure-btn inline-flex items-center gap-2"
            onClick={() =>
              navigate('/settings/backup/configure', { state: { settingsTab: 'backup' } })
            }
          >
            <Settings2 className="size-4 shrink-0" />
            Configure Backup
          </Button>
        </div>
      </div>

      <div className="backup-stats-grid">
        {metricsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="backup-stats-skeleton" />
            ))
          : visibleMetricCards.map((metric) => (
              <StatCard
                key={metric.id ?? metric.title}
                className="backup-stat-card"
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
      </div>

      <div className="backup-table-card">
        <div className="backup-history-heading">
          <h3 className="backup-history-title">Backup History</h3>
          <p className="backup-history-subtitle">View, download, and restore system backups</p>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          {...serverSort.dataTableSortProps}
          isLoading={isLoading}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={SETTINGS_BACKUPS_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession"
          showSearch={false}
          showAdvancedFilter={false}
          showExport={false}
          showRecordCount={false}
          onAdvancedFilter={onAdvancedFilter}
          onExport={onExport}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setPage,
          }}
          resourceLabel="backups"
        />
      </div>

      {exportFilterModals}

      <RestoreBackupModal
        open={Boolean(restoreTarget)}
        backup={restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onSubmit={(mode) => {
          if (!restoreTarget) return
          restoreMutation.mutate(
            { id: restoreTarget.id, mode },
            {
              onSuccess: () => {
                setRestoreTarget(null)
                toast.success('Restore started')
              },
              onError: () => toast.error('Restore failed'),
            },
          )
        }}
      />
    </div>
  )
}
