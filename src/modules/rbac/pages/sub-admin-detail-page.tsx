import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useNavigate, useParams } from 'react-router-dom'

import { useSubAdmin, useSubAdminLogs } from '../hooks/use-rbac'
import type { AuditLog } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

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

export function SubAdminDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const { data: subAdminData, isLoading } = useSubAdmin(id)
  const { data: logsData, isLoading: logsLoading } = useSubAdminLogs(id, { page: 1, limit: 20 })

  const subAdmin = subAdminData?.data
  const logs = logsData?.data.logs ?? []

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      { accessorKey: 'action', header: 'Action' },
      { accessorKey: 'username', header: 'Username' },
      { accessorKey: 'module', header: 'Module' },
      {
        accessorKey: 'createdAt',
        header: 'Date & Time',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
              row.original.status === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300',
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      { accessorKey: 'ipAddress', header: 'IP Address' },
      { accessorKey: 'adminNote', header: 'Admin Note' },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings/access')}
          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{subAdmin?.fullname ?? 'Admin User'}</h1>
          <p className="text-sm text-slate-400">Role Based Access / {subAdmin?.fullname ?? 'User'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
        <h2 className="text-lg font-semibold text-white">Admin Info</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Role</p>
              <p className="text-white">{subAdmin?.roles.map((r) => r.name).join(', ') || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <span
                className={cn(
                  'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                  subAdmin?.status === 'active'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                )}
              >
                {subAdmin?.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Created At</p>
              <p className="text-white">{formatDateTime(subAdmin?.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Last Action</p>
              <p className="text-white">{formatDateTime(subAdmin?.lastActionAt)}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Action Logs</h2>
        <DataTable
          columns={columns}
          data={logs}
          getRowId={(row) => row._id}
          isLoading={logsLoading}
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder=""
          pagination={{
            page: 1,
            pageSize: 20,
            totalItems: logs.length,
            totalPages: 1,
            onPageChange: () => {},
          }}
          resourceLabel="logs"
          emptyMessage="No logs found for this user."
        />
      </div>

      <Button variant="secondary" onClick={() => navigate('/settings/access')}>
        Back to Role Based Access
      </Button>
    </div>
  )
}
