import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLockedAccounts, useUnlockAccount } from '../hooks/use-security'
import type { LockedAccountRow } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { DataTable } from '@/shared/components/table/data-table'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

function AccountDetailsModal({
  open,
  account,
  onClose,
  onUnlock,
  isUnlocking,
}: {
  open: boolean
  account: LockedAccountRow | null
  onClose: () => void
  onUnlock: () => void
  isUnlocking: boolean
}) {
  if (!open || !account) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white">Account Details</h2>
        <div className="mt-5 space-y-3 text-sm">
          <DetailRow label="Admin" value={account.username ?? account.admin} />
          <DetailRow label="IP Address" value={account.ipAddress ?? '—'} />
          <DetailRow label="Locked Since" value={account.lockedSince} />
          <DetailRow label="Duration" value={account.duration} />
          <DetailRow label="Role" value={account.role} />
          <DetailRow
            label="Failed Attempts"
            value={String(account.failedAttempts ?? '—')}
            valueClassName="text-rose-400"
          />
          <DetailRow label="Reason" value={account.reason} />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUnlocking}
            onClick={onUnlock}
            className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505] disabled:opacity-50"
          >
            {isUnlocking ? 'Unlocking…' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2">
      <span className="text-slate-500">{label}</span>
      <span className={cn('font-medium text-white', valueClassName)}>{value}</span>
    </div>
  )
}

export function LockedAccountsPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<LockedAccountRow | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 10
  const { data: accountsResult, isLoading } = useLockedAccounts({ page, limit: pageSize, search })
  const unlockMutation = useUnlockAccount()

  const rows = accountsResult?.data ?? []
  const meta = accountsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const handleUnlock = (id: string) => {
    unlockMutation.mutate(id, {
      onSuccess: () => {
        setSelected(null)
        toast.success('Account unlocked')
      },
      onError: () => toast.error('Failed to unlock account'),
    })
  }

  const columns = useMemo<ColumnDef<LockedAccountRow>[]>(
    () => [
      {
        accessorKey: 'admin',
        header: 'Admin',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.admin}</span>,
      },
      {
        accessorKey: 'role',
        header: 'Roles',
        cell: ({ row }) => <span className="text-slate-400">{row.original.role}</span>,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => <span className="text-slate-300">{row.original.reason}</span>,
      },
      {
        accessorKey: 'lockedSince',
        header: 'Locked Since',
        cell: ({ row }) => <span className="text-slate-400">{row.original.lockedSince}</span>,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => <span className="text-slate-400">{row.original.duration}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(row.original)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white"
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => handleUnlock(row.original.id)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
            >
              Unlock
            </button>
          </div>
        ),
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
        Settings / Security & Access / Locked Accounts
      </button>

      <SectionHeader
        title="Locked Accounts"
        subtitle="Manage accounts that have been locked due to security reasons"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => navigate('/settings/logs'),
            variant: 'secondary',
          },
        ]}
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
          searchPlaceholder="Search by admin, role, or reason…"
          pagination={{
            page,
            pageSize,
            totalItems,
            totalPages,
            onPageChange: setPage,
          }}
          resourceLabel="accounts"
        />
      </div>

      <AccountDetailsModal
        open={Boolean(selected)}
        account={selected}
        onClose={() => setSelected(null)}
        onUnlock={() => selected && handleUnlock(selected.id)}
        isUnlocking={unlockMutation.isPending}
      />
    </div>
  )
}
