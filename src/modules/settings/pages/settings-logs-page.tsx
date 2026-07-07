import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useSettingsLogs } from '../hooks/use-settings'
import type { SettingsLog } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { DataTable } from '@/shared/components/table/data-table'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

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
    <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-2.5 py-0.5 text-[11px] font-semibold text-brand-text">
      {label}
    </span>
  )
}

export function SettingsLogsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useSettingsLogs({ page, limit: PAGE_SIZE, search })

  const rows = data?.data ?? []
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: rows.length, totalPages: 1 }

  const columns = useMemo<ColumnDef<SettingsLog>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => <span className="text-sm text-brand-text">{formatDateTime(row.original.createdAt)}</span>,
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <span className="text-sm font-medium capitalize text-brand-text">{row.original.module}</span>
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
          <span className="text-sm text-brand-muted">{row.original.performedBy || '—'}</span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => <span className="text-sm text-brand-muted">{row.original.ipAddress || '—'}</span>,
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
            onClick: () => navigate('/settings/main'),
            variant: 'secondary',
          },
        ]}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="gap-2" onClick={() => navigate('/settings/main')}>
            <ArrowLeft className="size-4" />
            Settings
          </Button>
        </div>
      </SectionHeader>

      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-4 sm:p-5')}>
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
        />
      </div>
    </div>
  )
}

