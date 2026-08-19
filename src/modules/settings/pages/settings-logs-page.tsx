import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useSettingsLogs } from '../hooks/use-settings'
import { fetchSettingsLogs } from '../api/settings-api'
import type { SettingsLog } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { DataTable } from '@/shared/components/table/data-table'
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
import { toast } from 'sonner'

const PAGE_SIZE = 10

const SETTINGS_LOG_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: SettingsLog) => string }
> = {
  createdAt: { header: 'Timestamp', accessor: (row) => exportDisplayValue(row.createdAt) },
  module: { header: 'Module', accessor: (row) => exportDisplayValue(row.module) },
  action: { header: 'Action', accessor: (row) => exportDisplayValue(row.action) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  performedBy: { header: 'Performed By', accessor: (row) => exportDisplayValue(row.performedBy) },
  ipAddress: { header: 'IP', accessor: (row) => exportDisplayValue(row.ipAddress) },
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status.toLowerCase() === 'success'
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        isSuccess
          ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
          : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {isSuccess ? 'Success' : 'Failed'}
    </span>
  )
}

function ActionBadge({ action }: { action: string }) {
  const label = action === 'reset' ? 'Reset' : 'Update'
  return (
    <span className="text-brand-text inline-flex rounded-full border border-white/10 bg-white/6 px-2.5 py-0.5 text-[11px] font-semibold">
      {label}
    </span>
  )
}

export function SettingsLogsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [selectedLog, setSelectedLog] = useState<SettingsLog | null>(null)

  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    [appliedFilters, page, search],
  )

  const { data, isLoading } = useSettingsLogs(listQueryParams)

  const rows = data?.data ?? []
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: rows.length, totalPages: 1 }

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchSettingsLogs(params)
      return { data: result.data ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      SETTINGS_LOG_EXPORT_COLUMN_MAP,
      'settings_logs_export',
      { search: search || undefined },
    )
  }, [search])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'settings-logs',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<SettingsLog>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="text-brand-text text-sm">{formatDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <span className="text-brand-text text-sm font-medium capitalize">
            {row.original.module}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <ActionBadge action={row.original.action} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'performedBy',
        header: 'Performed By',
        cell: ({ row }) => (
          <span className="text-brand-muted text-sm">{row.original.performedBy || '—'}</span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => (
          <span className="text-brand-muted text-sm">{row.original.ipAddress || '—'}</span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings Logs"
        subtitle="Audit trail for settings updates and resets"
        actions={[
          {
            label: 'Back to Settings',
            onClick: () => navigateBackOrFallback(navigate, '/settings/main'),
            variant: 'secondary',
          },
        ]}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigateBackOrFallback(navigate, '/settings/main')}
          >
            <ArrowLeft className="size-4" />
            Settings
          </Button>
        </div>
      </SectionHeader>

      <div
        className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-4 sm:p-5')}
      >
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          loadingRowCount={PAGE_SIZE}
          emptyMessage="No settings actions found."
          stickyHeader
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search by action, IP, or admin…"
          onAdvancedFilter={onAdvancedFilter}
          advancedFilterVariant="primary"
          onExport={onExport}
          pagination={{
            page: meta.page,
            pageSize: meta.limit,
            totalItems: meta.total,
            totalPages: meta.totalPages,
            onPageChange: setPage,
          }}
          toolbarContent={
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => navigate('/settings/health')}
            >
              <Eye className="size-4" />
              Platform Health
            </Button>
          }
          onRowClick={(row) => setSelectedLog(row)}
        />
      </div>

      {exportFilterModals}

      {selectedLog ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div
            className={cn(
              uiTokens.radiusCard,
              uiTokens.borderSubtle,
              'bg-brand-surface w-full max-w-2xl p-5 sm:p-6',
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-brand-text text-lg font-semibold">Action Details</h3>
                <p className="text-brand-muted mt-1 text-sm">
                  {selectedLog.module} - {selectedLog.action}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-brand-muted hover:text-brand-text rounded-md p-1 hover:bg-white/10"
                aria-label="Close details"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Timestamp" value={formatDateTime(selectedLog.createdAt)} />
              <InfoRow label="Status" value={selectedLog.status} />
              <InfoRow label="Performed By" value={selectedLog.performedBy || '—'} />
              <InfoRow label="IP Address" value={selectedLog.ipAddress || '—'} />
              <InfoRow label="Module" value={selectedLog.module} />
              <InfoRow label="Action" value={selectedLog.action} />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0F0F0F] p-3">
              <p className="text-brand-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                Metadata
              </p>
              <pre className="text-brand-text max-h-64 overflow-auto text-xs">
                {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
              </pre>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111111] p-3">
      <p className="text-brand-muted text-[11px] tracking-wide uppercase">{label}</p>
      <p className="text-brand-text mt-1 text-sm">{value}</p>
    </div>
  )
}
