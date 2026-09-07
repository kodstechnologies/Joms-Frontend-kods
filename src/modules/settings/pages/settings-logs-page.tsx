import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, RotateCcw, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useRestoreSettingsLog,
  useSettingsLog,
  useSettingsLogMetrics,
  useSettingsLogs,
} from '../hooks/use-settings'
import { fetchSettingsLogs } from '../api/settings-api'
import type { SettingsLog, SettingsModule } from '../types/settings'
import { SettingsLogActionDetailsModal } from '../components/settings-log-action-details-modal'
import { VersionHistoryPanel } from '../components/version-history-panel'
import {
  DEFAULT_SETTINGS_LOGS_METRIC_IDS,
  SETTINGS_LOGS_METRIC_IDS,
  SETTINGS_LOGS_METRIC_ID_SET,
  SETTINGS_LOGS_MODULE_KEY,
} from '../config/settings-logs-metrics.config'
import {
  DEFAULT_SETTINGS_LOGS_VISIBLE_COLUMN_IDS,
  SETTINGS_LOGS_LEGACY_COLUMN_ID_MAP,
} from '../config/settings-logs-table-columns.config'
import { buildSettingsLogsMetricCards } from '../utils/settings-logs-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { selectPreferredColumns } from '@/modules/expert/utils/select-preferred-columns'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { LogStatusBadge } from '@/shared/components/ui/log-status-badge'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { uiTokens } from '@/shared/lib/design-tokens'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { createPrefixedListExportHandler } from '@/shared/utils/export-filter-utils'
import { formatDateTimeEnInLogs as formatDateTime } from '@/shared/lib/format-datetime'

const PAGE_SIZE = 10

/** Setting Logs module tabs (filter keys accepted by logs API). */
const MODULE_TABS: Array<{ key: string; label: string }> = [
  { key: 'platform', label: 'Platform Controls' },
  { key: 'security', label: 'Security & Access' },
  { key: 'user', label: 'User Application' },
  { key: 'expert', label: 'Expert Application' },
  { key: 'event', label: 'Event Management' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
]

const SETTINGS_LOG_SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'createdAt',
  'module',
  'status',
  'performedBy',
  'role',
])

const SETTINGS_LOG_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: SettingsLog) => string }
> = {
  performedBy: { header: 'User ID', accessor: (row) => exportDisplayValue(row.performedBy) },
  role: { header: 'Roles', accessor: (row) => exportDisplayValue(row.role) },
  module: {
    header: 'Module',
    accessor: (row) => exportDisplayValue(row.moduleLabel || row.module),
  },
  changedSettings: {
    header: 'Changed Settings',
    accessor: (row) => exportDisplayValue((row.changedSettings || []).join(', ')),
  },
  oldValues: {
    header: 'Old Values',
    accessor: (row) =>
      exportDisplayValue((row.changes || []).map((item) => item.oldValue).join(', ')),
  },
  newValues: {
    header: 'New Values',
    accessor: (row) =>
      exportDisplayValue((row.changes || []).map((item) => item.newValue).join(', ')),
  },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  createdAt: { header: 'Timestamp', accessor: (row) => exportDisplayValue(row.createdAt) },
}

function summarizeChanges(log: SettingsLog) {
  const changes = log.changes || []
  if (!changes.length) {
    return {
      settings: log.changedSettings?.join(', ') || '—',
      oldValue: '—',
      newValue: '—',
    }
  }

  if (changes.length === 1) {
    return {
      settings: changes[0].setting,
      oldValue:
        changes[0].oldValue == null || changes[0].oldValue === ''
          ? '—'
          : String(changes[0].oldValue),
      newValue:
        changes[0].newValue == null || changes[0].newValue === ''
          ? '—'
          : String(changes[0].newValue),
    }
  }

  return {
    settings: changes.map((item) => item.setting).join(', '),
    oldValue: `${changes.length} changes`,
    newValue: `${changes.length} changes`,
  }
}

function ModulePill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[180px] truncate rounded-[10px] border border-white/10 bg-[#0A0A0A] px-2.5 py-1 text-xs font-medium text-white">
      {label}
    </span>
  )
}

function UserIdCell({ name }: { name: string }) {
  const label = name?.trim() || '—'
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/70"
        aria-hidden="true"
      >
        <UserRound className="size-4" />
      </span>
      <span className="text-brand-text truncate text-sm font-medium">{label}</span>
    </div>
  )
}

export function SettingsLogsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [activeModuleTab, setActiveModuleTab] = useState<string>('service')
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [versionHistoryModule, setVersionHistoryModule] = useState<SettingsModule | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [noteLog, setNoteLog] = useState<SettingsLog | null>(null)

  const serverSort = useServerTableSort({
    sortFieldMap: SETTINGS_LOG_SORT_FIELD_MAP,
    defaultSortBy: 'createdAt',
    onPageReset: () => setPage(1),
  })
  const [isExporting, setIsExporting] = useState(false)

  const metricsModule = activeModuleTab
  const { data: metricsData, isLoading: metricsLoading } = useSettingsLogMetrics({
    module: metricsModule,
  })
  const tableColumnPreferencesQuery = useTableColumnPreferences(SETTINGS_LOGS_MODULE_KEY)

  const activeMetricIds = useActiveMetricIds(SETTINGS_LOGS_MODULE_KEY, [
    ...DEFAULT_SETTINGS_LOGS_METRIC_IDS,
  ])
  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => SETTINGS_LOGS_METRIC_ID_SET.has(id)),
        SETTINGS_LOGS_METRIC_IDS,
      ),
    [activeMetricIds],
  )
  const visibleMetrics = useMemo(() => {
    const allMetrics = buildSettingsLogsMetricCards(metricsData)
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, metricsData])

  const listQueryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      module: activeModuleTab,
      ...serverSort.sortParams,
    }),
    [activeModuleTab, page, serverSort.sortParams],
  )

  const { data, isLoading, refetch } = useSettingsLogs(listQueryParams)
  const { data: selectedLogDetail } = useSettingsLog(selectedLogId || undefined)
  const restoreMutation = useRestoreSettingsLog()

  const rows = data?.data ?? []
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: rows.length, totalPages: 1 }
  const selectedLog = selectedLogDetail || rows.find((row) => row.id === selectedLogId) || null

  const exportHandler = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchSettingsLogs(params)
      return { data: result.data ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      SETTINGS_LOG_EXPORT_COLUMN_MAP,
      'settings_logs_export',
      {
        module: activeModuleTab,
      },
    )
  }, [activeModuleTab])

  const handleHeaderExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportHandler({}, 'csv')
      toast.success('Settings logs exported')
    } catch {
      toast.error('Failed to export settings logs')
    } finally {
      setIsExporting(false)
    }
  }, [exportHandler])

  const handleRestore = useCallback(
    async (log: SettingsLog) => {
      try {
        await restoreMutation.mutateAsync(log.id)
        toast.success('Previous settings version restored')
        setSelectedLogId(null)
        void refetch()
      } catch {
        toast.error('Failed to restore previous version')
      }
    },
    [refetch, restoreMutation],
  )

  const columns = useMemo<ColumnDef<SettingsLog>[]>(() => {
    const allColumns: ColumnDef<SettingsLog>[] = [
      {
        id: 'performed-by',
        accessorKey: 'performedBy',
        header: 'User ID',
        cell: ({ row }) => <UserIdCell name={row.original.performedBy || '—'} />,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: 'Roles',
        cell: ({ row }) => (
          <span className="text-brand-text text-sm">{row.original.role || 'Admin'}</span>
        ),
      },
      {
        id: 'module',
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => <ModulePill label={row.original.moduleLabel || row.original.module} />,
      },
      {
        id: 'changed-settings',
        header: 'Changed Settings',
        enableSorting: false,
        cell: ({ row }) => {
          const summary = summarizeChanges(row.original)
          return <span className="text-brand-text text-sm">{summary.settings}</span>
        },
      },
      {
        id: 'old-values',
        header: 'Old Values',
        enableSorting: false,
        cell: ({ row }) => {
          const summary = summarizeChanges(row.original)
          return <span className="text-brand-text text-sm">{summary.oldValue}</span>
        },
      },
      {
        id: 'new-values',
        header: 'New Values',
        enableSorting: false,
        cell: ({ row }) => {
          const summary = summarizeChanges(row.original)
          return <span className="text-brand-text text-sm">{summary.newValue}</span>
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <LogStatusBadge status={row.original.status} variant="solid" />,
      },
      {
        id: 'created-at',
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="text-brand-text text-sm">{formatDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original
          const isOpen = activeMenuId === log.id

          return (
            <TableActionsDropdown
              label="Open log actions"
              isOpen={isOpen}
              onOpenChange={(open) => setActiveMenuId(open ? log.id : null)}
              menuWidth={220}
            >
              <TableActionsItem
                icon={<UserRound className="size-4" />}
                onClick={() => {
                  setActiveMenuId(null)
                  setNoteLog(log)
                }}
              >
                View Notes
              </TableActionsItem>
              <TableActionsItem
                icon={<RotateCcw className="size-4" />}
                onClick={() => {
                  setActiveMenuId(null)
                  void handleRestore(log)
                }}
              >
                Restore Previous Version
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ]

    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_SETTINGS_LOGS_VISIBLE_COLUMN_IDS

    return withServerSortMeta(
      selectPreferredColumns(
        allColumns,
        rawVisibleIds,
        DEFAULT_SETTINGS_LOGS_VISIBLE_COLUMN_IDS,
        SETTINGS_LOGS_LEGACY_COLUMN_ID_MAP,
      ),
      SETTINGS_LOG_SORT_FIELD_MAP,
    )
  }, [activeMenuId, handleRestore, tableColumnPreferencesQuery.data?.visibleColumnIds])

  const goBack = () => navigateBackOrFallback(navigate, '/settings/main')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="login-trails-title-row">
          <button type="button" onClick={goBack} className="login-trails-back" aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-h1 text-brand-text font-semibold tracking-tight">Setting Logs</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleHeaderExport()}
            disabled={isExporting}
            className="ui-export-data ui-cta ui-cta-primary inline-flex items-center gap-2 px-4 disabled:opacity-60"
          >
            <ExportDataIcon className="size-5 shrink-0" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/settings-logs?returnTo=/settings/logs&section=all')}
            className="ui-manage-metrics ui-cta ui-cta-primary inline-flex items-center gap-2 px-4"
          >
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricsLoading
          ? Array.from({ length: filteredActiveMetricIds.length || 4 }).map((_, index) => (
              <div
                key={`settings-log-metric-skel-${index}`}
                className={cn(
                  uiTokens.radiusCard,
                  uiTokens.borderSubtle,
                  'bg-brand-surface h-[130px] animate-pulse',
                )}
              />
            ))
          : visibleMetrics.map((metric) => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                hint={metric.hint}
              />
            ))}
      </div>

      <nav className="settings-tabs" aria-label="Settings log modules">
        <div className="settings-tabs-inner">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveModuleTab(tab.key)
                setPage(1)
              }}
              className={cn('settings-tab', activeModuleTab === tab.key && 'is-active')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface overflow-hidden',
        )}
      >
        <div className="border-b border-white/10 px-4 py-5 sm:px-5">
          <h2 className="text-brand-text text-lg font-semibold">Action Logs</h2>
          <p className="text-brand-muted mt-1 text-sm">
            Complete history of actions performed by this admin.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          {...serverSort.dataTableSortProps}
          isLoading={isLoading}
          loadingRowCount={PAGE_SIZE}
          emptyMessage="No settings actions found."
          stickyHeader
          searchValue=""
          onSearchChange={() => {}}
          showSearch={false}
          showRecordCount={false}
          showAdvancedFilter={false}
          showExport={false}
          className="!rounded-none !border-0 !bg-transparent"
          pagination={{
            page: meta.page,
            pageSize: meta.limit,
            totalItems: meta.total,
            totalPages: meta.totalPages,
            onPageChange: setPage,
          }}
          onRowClick={(row) => setSelectedLogId(row.id)}
        />
      </div>

      <SettingsLogActionDetailsModal
        open={Boolean(selectedLogId)}
        log={selectedLog}
        isRestoring={restoreMutation.isPending}
        onClose={() => setSelectedLogId(null)}
        onViewVersionHistory={() => {
          if (!selectedLog) return
          setVersionHistoryModule(selectedLog.module)
        }}
        onRestore={() => {
          if (!selectedLog) return
          void handleRestore(selectedLog)
        }}
      />

      <VersionHistoryPanel
        open={Boolean(versionHistoryModule)}
        module={versionHistoryModule}
        onClose={() => setVersionHistoryModule(null)}
      />

      {noteLog ? (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setNoteLog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              uiTokens.radiusCard,
              uiTokens.borderSubtle,
              'bg-brand-surface w-full max-w-lg p-5 sm:p-6',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-brand-text mb-3 text-lg font-semibold">Admin Note</h3>
            <p className="text-brand-text text-sm leading-relaxed">
              {noteLog.adminNote?.trim() || 'No admin note provided.'}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="ui-cta ui-cta-secondary px-4"
                onClick={() => setNoteLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
