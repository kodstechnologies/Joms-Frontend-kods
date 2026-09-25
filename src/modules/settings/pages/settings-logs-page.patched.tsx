import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  ArrowLeft,
  History,
  MessageSquare,
  RotateCcw,
  Shield,
  UserRound,
  Waypoints,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useRestoreSettingsLog,
  useSettingsLog,
  useSettingsLogMetrics,
  useSettingsLogs,
} from '../hooks/use-settings'
import { useDefaultExportFormat } from '../hooks/use-default-export-format'
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
  SETTINGS_LOGS_TABLE_COLUMNS_CATALOG,
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
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
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
import {
  createPrefixedListExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import { formatDateTimeEnInLogs as formatDateTime } from '@/shared/lib/format-datetime'
import { fetchRoles } from '@/modules/rbac/api/rbac-api'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalateSettingsLogApplication } from '@/modules/my-tasks/api/escalation-api'

const PAGE_SIZE = 10

const MODULE_TABS: Array<{ key: string; label: string }> = [
  { key: 'platform', label: 'Platform Controls' },
  { key: 'security', label: 'Security & Access' },
  { key: 'expert', label: 'Expert Application' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
  { key: 'backup', label: 'Backup' },
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
  'performed-by': { header: 'User ID', accessor: (row) => exportDisplayValue(row.performedBy) },
  role: { header: 'Roles', accessor: (row) => exportDisplayValue(row.role) },
  module: {
    header: 'Module',
    accessor: (row) => exportDisplayValue(row.moduleLabel || row.module),
  },
  'changed-settings': {
    header: 'Changed Settings',
    accessor: (row) => exportDisplayValue((row.changedSettings || []).join(', ')),
  },
  'old-values': {
    header: 'Old Values',
    accessor: (row) =>
      exportDisplayValue((row.changes || []).map((item) => item.oldValue).join(', ')),
  },
  'new-values': {
    header: 'New Values',
    accessor: (row) =>
      exportDisplayValue((row.changes || []).map((item) => item.newValue).join(', ')),
  },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  'created-at': { header: 'Timestamp', accessor: (row) => exportDisplayValue(row.createdAt) },
}

const SETTINGS_LOG_EXPORT_COLUMN_IDS = SETTINGS_LOGS_TABLE_COLUMNS_CATALOG.map(
  (column) => column.id,
).filter((id) => id !== 'actions')

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
  const { fileFormat, option: exportFormat } = useDefaultExportFormat()
  const location = useLocation()
  const initialModule =
    typeof (location.state as { module?: string } | null)?.module === 'string' &&
    MODULE_TABS.some((tab) => tab.key === (location.state as { module?: string }).module)
      ? (location.state as { module: string }).module
      : 'service'
  const [page, setPage] = useState(1)
  const [activeModuleTab, setActiveModuleTab] = useState<string>(initialModule)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [versionHistoryModule, setVersionHistoryModule] = useState<SettingsModule | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [noteLog, setNoteLog] = useState<SettingsLog | null>(null)
  const [escalateTarget, setEscalateTarget] = useState<SettingsLog | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const { data: assigneesData } = useEscalationAssignees('settings.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

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
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_SETTINGS_LOGS_VISIBLE_COLUMN_IDS.filter((id) => id !== 'actions'),
    catalogColumnIds: SETTINGS_LOG_EXPORT_COLUMN_IDS,
    legacyColumnIdMap: SETTINGS_LOGS_LEGACY_COLUMN_ID_MAP,
    allowedColumnIds: SETTINGS_LOG_EXPORT_COLUMN_IDS,
  })

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
      { module: activeModuleTab },
      { columnIds: exportColumnIds, catalogOrder: SETTINGS_LOG_EXPORT_COLUMN_IDS },
    )
  }, [activeModuleTab, exportColumnIds])

  const handleHeaderExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportHandler({}, fileFormat)
      toast.success(`Settings logs exported as ${exportFormat}`)
    } catch {
      toast.error('Failed to export settings logs')
    } finally {
      setIsExporting(false)
    }
  }, [exportFormat, exportHandler, fileFormat])

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

  const handleExportLogRow = useCallback(
    async (log: SettingsLog) => {
      try {
        await exportMappedItemsToFile(
          SETTINGS_LOG_EXPORT_COLUMN_MAP,
          [log],
          fileFormat,
          `settings_log_${log.id}`,
          { columnIds: exportColumnIds, catalogOrder: SETTINGS_LOG_EXPORT_COLUMN_IDS },
        )
        toast.success('Log exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export log'))
      }
    },
    [exportColumnIds, fileFormat],
  )

  const openViewUserProfile = useCallback(
    (log: SettingsLog) => {
      const adminId = String(log.adminId || '').trim()
      if (!adminId) {
        toast.error('Admin user ID is missing for this log.')
        return
      }
      navigate(`/settings/access/users/${adminId}`)
    },
    [navigate],
  )

  const openCommunicate = useCallback(
    (log: SettingsLog) => {
      // Sub-admins do not support push; open email compose for admins audience.
      const params = new URLSearchParams({
        channel: 'email',
        audience: 'admins',
      })
      const performedBy = String(log.performedBy || '').trim()
      if (performedBy) {
        params.set('hint', `Settings log by ${performedBy}`)
      }
      navigate(`/communication/create?${params.toString()}`)
    },
    [navigate],
  )

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleEscalateSubmit = useCallback(async () => {
    if (!escalateTarget) return
    if (!selectedEscalationOption) {
      toast.error('Please select a sub-admin to assign.')
      return
    }
    if (!escalateAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const selectedAssignee = (assigneesData?.data ?? []).find(
      (item) => item.id === selectedEscalationOption,
    )
    const applicationUrl = `/settings/logs?logId=${encodeURIComponent(escalateTarget.id)}`

    setIsEscalating(true)
    try {
      await escalateSettingsLogApplication(escalateTarget.id, {
        assigneeSubAdminId: selectedEscalationOption,
        assigneeName: selectedAssignee?.fullname || '',
        adminNote: escalateAdminNotes.trim(),
        entityTitle: `${escalateTarget.moduleLabel || escalateTarget.module} — ${escalateTarget.performedBy || 'Settings log'}`,
        applicationUrl,
        escalationTarget: 'application',
        metadata: {
          source: 'settings_logs',
          logId: escalateTarget.id,
          adminId: escalateTarget.adminId,
          module: escalateTarget.module,
          orderUrl: applicationUrl,
        },
      })
      toast.success('Settings log escalated')
      closeEscalateModal()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to escalate settings log.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    escalateTarget,
    selectedEscalationOption,
  ])

  const openViewUserLogs = useCallback(
    (log: SettingsLog) => {
      const adminId = String(log.adminId || '').trim()
      if (!adminId) {
        toast.error('Admin user ID is missing for this log.')
        return
      }
      // Settings logs store auth Admin ids; RBAC user-logs API now resolves authAdminId /
      // SubAdmin._id / super-admin auth id.
      navigate(`/settings/access/users/${encodeURIComponent(adminId)}/logs`)
    },
    [navigate],
  )

  const openViewRole = useCallback(
    async (log: SettingsLog) => {
      const roleName = String(log.role || '').trim()
      if (!roleName) {
        toast.error('Role is missing for this log.')
        return
      }
      try {
        const result = await fetchRoles({ search: roleName, limit: 50, page: 1 })
        const roles = result.data ?? []
        const match =
          roles.find((role) => role.name?.toLowerCase() === roleName.toLowerCase()) ||
          roles.find((role) => role.name?.toLowerCase().includes(roleName.toLowerCase()))
        if (!match?.id) {
          toast.error(`Role "${roleName}" was not found in RBAC.`)
          return
        }
        navigate(`/settings/access/roles/${match.id}/logs`)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to open role.'))
      }
    },
    [navigate],
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
          <button
            type="button"
            className="text-brand-text text-sm underline-offset-2 hover:underline"
            onClick={() => {
              void openViewRole(row.original)
            }}
          >
            {row.original.role || 'Admin'}
          </button>
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
              menuWidth={240}
              maxVisibleItems={8}
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
              <TableActionsItem
                icon={<ExportDataIcon className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  void handleExportLogRow(log)
                }}
              >
                Export Log
              </TableActionsItem>
              <TableActionsItem
                icon={<AlertTriangle className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  setEscalateTarget(log)
                }}
              >
                Escalate
              </TableActionsItem>
              <TableActionsItem
                icon={<UserRound className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  openViewUserProfile(log)
                }}
              >
                View User Profile
              </TableActionsItem>
              <TableActionsItem
                icon={<UserRound className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  openViewUserProfile(log)
                }}
              >
                View User
              </TableActionsItem>
              <TableActionsItem
                icon={<MessageSquare className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  openCommunicate(log)
                }}
              >
                Communicate
              </TableActionsItem>
              <TableActionsItem
                icon={<History className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  navigate('/settings/security/login-trails')
                }}
              >
                View Login History
              </TableActionsItem>
              <TableActionsItem
                icon={<Shield className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  void openViewRole(log)
                }}
              >
                View Role
              </TableActionsItem>
              <TableActionsItem
                icon={<Waypoints className="size-3.5" />}
                onClick={() => {
                  setActiveMenuId(null)
                  openViewUserLogs(log)
                }}
              >
                View User Logs
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
  }, [
    activeMenuId,
    handleExportLogRow,
    handleRestore,
    navigate,
    openCommunicate,
    openViewRole,
    openViewUserLogs,
    openViewUserProfile,
    tableColumnPreferencesQuery.data?.visibleColumnIds,
  ])

  const goBack = () => navigateBackOrFallback(navigate, '/settings/main')

  return (
    <div className="space-y-6">
      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate"
        description="Are you sure you want to escalate this settings log? It will be reviewed by the selected sub-admin."
        submitLabel="Escalate"
        escalationOptions={escalationOptions}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        adminNotes={escalateAdminNotes}
        onAdminNotesChange={setEscalateAdminNotes}
        onClose={closeEscalateModal}
        onSubmit={() => {
          void handleEscalateSubmit()
        }}
        isSubmitting={isEscalating}
      />

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
