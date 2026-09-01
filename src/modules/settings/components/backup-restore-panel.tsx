import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 8

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
  name: { header: 'Backup ID / Name', accessor: (row) => exportDisplayValue(row.name) },
  type: { header: 'Type', accessor: (row) => exportDisplayValue(row.type) },
  scope: { header: 'Scope', accessor: (row) => exportDisplayValue(row.scope) },
  createdBy: { header: 'Created By', accessor: (row) => exportDisplayValue(row.createdBy) },
  timestamp: { header: 'Timestamp', accessor: (row) => exportDisplayValue(row.timestamp) },
  size: { header: 'Size', accessor: (row) => exportDisplayValue(row.size) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
}

function StatusBadge({ status }: { status: BackupHistoryRow['status'] }) {
  const styles = {
    Completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    Failed: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  }

  return (
    <span
      className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', styles[status])}
    >
      {status}
    </span>
  )
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
  const runBackupMutation = useRunBackup()
  const restoreMutation = useRestoreBackup()
  const deleteMutation = useDeleteBackup()

  const rows = backupsResult?.data ?? []
  const meta = backupsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

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
    )
  }, [enhancedSearch.globalSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'backups',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<BackupHistoryRow>[]>(
    () =>
      withServerSortMeta(
        [
          {
            accessorKey: 'name',
            header: 'Backup ID / Name',
            cell: ({ row }) => (
              <span
                className="block max-w-[220px] truncate font-medium text-white"
                title={row.original.name}
              >
                {row.original.name}
              </span>
            ),
          },
          {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <span className="text-slate-400">{row.original.type}</span>,
          },
          {
            accessorKey: 'scope',
            header: 'Scope',
            cell: ({ row }) => <span className="text-slate-300">{row.original.scope}</span>,
          },
          {
            accessorKey: 'createdBy',
            header: 'Created By',
            cell: ({ row }) => <span className="text-slate-400">{row.original.createdBy}</span>,
          },
          {
            accessorKey: 'timestamp',
            header: 'Timestamp',
            cell: ({ row }) => <span className="text-slate-400">{row.original.timestamp}</span>,
          },
          {
            accessorKey: 'size',
            header: 'Size',
            cell: ({ row }) => <span className="text-slate-300">{row.original.size}</span>,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
          },
          {
            id: 'actions',
            header: () => <span className="block text-right">Actions</span>,
            cell: ({ row }) => (
              <div className="flex justify-end">
                <TableActionsDropdown
                  tone="dark"
                  label="Backup actions"
                  isOpen={menuOpenId === row.original.id}
                  onOpenChange={(open) => setMenuOpenId(open ? row.original.id : null)}
                >
                  <TableActionsItem
                    onClick={() => {
                      setMenuOpenId(null)
                      setRestoreTarget(row.original)
                    }}
                  >
                    Restore
                  </TableActionsItem>
                  <TableActionsItem
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
              </div>
            ),
          },
        ],
        BACKUP_SORT_FIELD_MAP,
      ),
    [menuOpenId, deleteMutation],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Backups & Restore</h2>
          <p className="text-sm text-slate-400">Run backups and restore from the list below</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={runBackupMutation.isPending}
            onClick={() =>
              runBackupMutation.mutate(
                { name: 'Manual Backup' },
                {
                  onSuccess: () => toast.success('Backup done'),
                  onError: () => toast.error('Backup failed'),
                },
              )
            }
          >
            {runBackupMutation.isPending ? 'Running…' : 'Run Backup'}
          </Button>
          <Button onClick={() => navigate('/settings/backup/configure')}>Configure Backup</Button>
        </div>
      </div>

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
        {metricsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-white/5" />
            ))
          : metricCards.map((metric) => (
              <StatCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
      </ResponsiveGrid>

      <div
        className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-4 sm:p-5')}
      >
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
          searchPlaceholder="Search backups"
          onAdvancedFilter={onAdvancedFilter}
          advancedFilterVariant="primary"
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
