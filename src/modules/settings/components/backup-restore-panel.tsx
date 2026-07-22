import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { RestoreBackupModal } from './restore-backup-modal'
import {
  useBackupMetrics,
  useBackups,
  useDeleteBackup,
  useRestoreBackup,
  useRunBackup,
} from '../hooks/use-backups'
import type { BackupHistoryRow, SettingsMetric } from '../types/settings'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 8

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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<BackupHistoryRow | null>(null)

  const { data: metrics = [], isLoading: metricsLoading } = useBackupMetrics()
  const metricCards: SettingsMetric[] = metricsLoading ? [] : metrics
  const { data: backupsResult, isLoading } = useBackups({ page, limit: PAGE_SIZE, search })
  const runBackupMutation = useRunBackup()
  const restoreMutation = useRestoreBackup()
  const deleteMutation = useDeleteBackup()

  const rows = backupsResult?.data ?? []
  const meta = backupsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const columns = useMemo<ColumnDef<BackupHistoryRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Backup ID / Name',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.name}</span>,
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
        header: 'Actions',
        cell: ({ row }) => (
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpenId((current) => (current === row.original.id ? null : row.original.id))
              }
              className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white"
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpenId === row.original.id ? (
              <div className="bg-brand-surface absolute right-0 z-10 mt-1 min-w-[120px] rounded-lg border border-white/10 py-1 shadow-xl">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-white/5"
                  onClick={() => {
                    setRestoreTarget(row.original)
                    setMenuOpenId(null)
                  }}
                >
                  Restore
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-xs text-rose-300 hover:bg-white/5"
                  onClick={() => {
                    deleteMutation.mutate(row.original.id, {
                      onSuccess: () => {
                        setMenuOpenId(null)
                        toast.success('Backup deleted')
                      },
                      onError: () => toast.error('Failed to delete backup'),
                    })
                  }}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        ),
      },
    ],
    [menuOpenId, deleteMutation],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Backups & Restore</h2>
          <p className="text-sm text-slate-400">Manage system backups and restoration</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={runBackupMutation.isPending}
            onClick={() =>
              runBackupMutation.mutate(
                { name: 'Manual Backup', scope: 'Partial' },
                {
                  onSuccess: () => toast.success('Backup started'),
                  onError: () => toast.error('Failed to start backup'),
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
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search by name, ID or profession"
          onExport={() => toast.success('Export started')}
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
                toast.success('Restore initiated')
              },
              onError: () => toast.error('Failed to initiate restore'),
            },
          )
        }}
      />
    </div>
  )
}
