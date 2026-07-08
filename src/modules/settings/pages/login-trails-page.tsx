import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLoginTrails } from '../hooks/use-security'
import type { LoginTrailRow } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { DataTable } from '@/shared/components/table/data-table'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

function StatusDot({ status }: { status: LoginTrailRow['status'] }) {
  const colors = {
    success: 'bg-emerald-400',
    failed: 'bg-rose-400',
    warning: 'bg-amber-400',
  }
  return (
    <span className="inline-flex items-center gap-2 capitalize text-slate-300">
      <span className={cn('size-2 rounded-full', colors[status])} />
      {status}
    </span>
  )
}

export function LoginTrailsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loginAlerts, setLoginAlerts] = useState(true)

  const { data: trailsResult, isLoading, refetch, isFetching } = useLoginTrails({
    page,
    limit: PAGE_SIZE,
    search,
  })

  const rows = trailsResult?.data ?? []
  const meta = trailsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const columns = useMemo<ColumnDef<LoginTrailRow>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => <span className="text-slate-300">{row.original.date}</span>,
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => <span className="text-slate-400">{row.original.time}</span>,
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => <span className="text-slate-300">{row.original.ipAddress}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <span className="text-slate-300">{row.original.action}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusDot status={row.original.status} />,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => <span className="text-slate-400">{row.original.location}</span>,
      },
      {
        accessorKey: 'device',
        header: 'Device',
        cell: ({ row }) => <span className="text-slate-400">{row.original.device}</span>,
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/settings/main', { state: { settingsTab: 'security' } })}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Settings / Security & Access / Admin Login Trails
      </button>

      <SectionHeader
        title="Admin Login Trails"
        subtitle="Monitor all admin login activities and security events"
      />

      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-4 sm:p-5')}>
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search by date or IP address"
          onExport={() => toast.success('Export started')}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setPage,
          }}
          resourceLabel="events"
          toolbarContent={
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-white">
                <button
                  type="button"
                  role="switch"
                  aria-checked={loginAlerts}
                  onClick={() => setLoginAlerts((current) => !current)}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    loginAlerts ? 'bg-emerald-500' : 'bg-white/15',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform',
                      loginAlerts && 'translate-x-4',
                    )}
                  />
                </button>
                Login Alerts
              </label>
              <Button
                variant="secondary"
                className="h-8 text-xs"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                {isFetching ? 'Refreshing…' : 'Refresh'}
              </Button>
              <Button variant="secondary" className="h-8 text-xs" onClick={() => toast.message('Filters applied')}>
                Apply Filter
              </Button>
            </div>
          }
        />
      </div>
    </div>
  )
}
