import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLockedAccounts, useUnlockAccount } from '../hooks/use-security'
import type { LockedAccountRow } from '../types/settings'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { cn } from '@/shared/lib/cn'

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
            className="locked-accounts-unlock-btn"
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
  const [page, setPage] = useState(1)

  const pageSize = 10
  const { data: accountsResult, isLoading } = useLockedAccounts({ page, limit: pageSize })
  const unlockMutation = useUnlockAccount()

  const rows = accountsResult?.data ?? []
  const meta = accountsResult?.meta
  const totalPages = meta?.totalPages ?? 1

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

  const goBack = () =>
    navigateBackOrFallback(navigate, '/settings/main', { state: { settingsTab: 'security' } })

  const pageButtons = useMemo(() => {
    return Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).slice(0, 5)
  }, [totalPages])

  return (
    <div className="locked-accounts-page">
      <button type="button" onClick={goBack} className="locked-accounts-back" aria-label="Back">
        <ArrowLeft className="size-5" />
      </button>

      <div className="locked-accounts-heading">
        <h1 className="locked-accounts-title">Locked Accounts</h1>
        <p className="locked-accounts-breadcrumb">Settings / Platform Controls / Locked Account</p>
      </div>

      <section className="locked-accounts-card">
        <header className="locked-accounts-card-header">
          <h2 className="locked-accounts-card-title">Locked Account</h2>
          <p className="locked-accounts-card-desc">
            Manage accounts that have been locked due to security reasons
          </p>
        </header>

        <div className="locked-accounts-table-wrap">
          <table className="locked-accounts-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Roles</th>
                <th>Reason</th>
                <th>Locked Since</th>
                <th>Duration</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="locked-accounts-empty">
                    Loading locked accounts…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="locked-accounts-empty">
                    No locked accounts found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="locked-accounts-admin">{row.admin}</td>
                    <td>{row.role}</td>
                    <td>{row.reason}</td>
                    <td>{row.lockedSince}</td>
                    <td>{row.duration}</td>
                    <td>
                      <div className="locked-accounts-actions">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="locked-accounts-review-btn"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnlock(row.id)}
                          disabled={unlockMutation.isPending}
                          className="locked-accounts-unlock-btn"
                        >
                          Unlock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="locked-accounts-pagination">
            <button
              type="button"
              className="locked-accounts-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <div className="locked-accounts-page-numbers">
              {pageButtons.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={cn('locked-accounts-page-num', page === n && 'is-active')}
                  onClick={() => setPage(n)}
                >
                  {String(n).padStart(2, '0')}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="locked-accounts-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

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
