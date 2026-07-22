import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLockedAccounts, useUnlockAccount } from '../hooks/use-security'
import type { LockedAccountRow } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
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
      <div className="ui-modal-shell max-w-[480px]">
        <div className="ui-modal-header">
          <h2 className="text-h4 text-brand-text">Account Details</h2>
        </div>
        <div className="ui-modal-body space-y-3">
          <DetailRow label="Admin" value={account.username ?? account.admin} />
          <DetailRow label="IP Address" value={account.ipAddress ?? '—'} />
          <DetailRow label="Locked Since" value={account.lockedSince} />
          <DetailRow label="Duration" value={account.duration} />
          <DetailRow label="Role" value={account.role} />
          <DetailRow
            label="Failed Attempts"
            value={String(account.failedAttempts ?? '—')}
            valueClassName="text-brand-danger"
          />
          <DetailRow label="Reason" value={account.reason} />
        </div>
        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={isUnlocking}
            onClick={onUnlock}
            className="ui-modal-btn ui-modal-btn-gold"
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
      <span className="text-body-md text-muted">{label}</span>
      <span className={cn('text-body-md-medium text-brand-text', valueClassName)}>{value}</span>
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

  const handleUnlock = useCallback(
    (id: string) => {
      unlockMutation.mutate(id, {
        onSuccess: () => {
          setSelected(null)
          toast.success('Account unlocked')
        },
        onError: () => toast.error('Failed to unlock account'),
      })
    },
    [unlockMutation],
  )

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
        cell: ({ row }) => <span className="text-muted">{row.original.role}</span>,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => <span className="text-brand-text/80">{row.original.reason}</span>,
      },
      {
        accessorKey: 'lockedSince',
        header: 'Locked Since',
        cell: ({ row }) => <span className="text-muted">{row.original.lockedSince}</span>,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => <span className="text-muted">{row.original.duration}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(row.original)}
              className="text-body-sm-medium rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-white"
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => handleUnlock(row.original.id)}
              className="border-brand-positive/30 bg-brand-positive/10 text-body-sm-medium text-brand-positive rounded-lg border px-3 py-1"
            >
              Unlock
            </button>
          </div>
        ),
      },
    ],
    [handleUnlock],
  )

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() =>
          navigateBackOrFallback(navigate, '/settings/main', { state: { settingsTab: 'security' } })
        }
        className="text-body-md text-muted inline-flex items-center gap-2 hover:text-white"
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
