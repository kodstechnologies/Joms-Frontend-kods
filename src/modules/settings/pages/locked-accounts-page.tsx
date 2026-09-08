import { useCallback, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLockedAccounts, useUnlockAccount } from '../hooks/use-security'
import type { LockedAccountRow } from '../types/settings'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { cn } from '@/shared/lib/cn'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'

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

  const details: Array<{ label: string; value: string; danger?: boolean }> = [
    { label: 'Admin', value: account.username || account.admin || '—' },
    { label: 'IP Address', value: account.ipAddress || '—' },
    { label: 'Locked Since', value: account.lockedSince || '—' },
    { label: 'Duration', value: account.duration || '—' },
    { label: 'Role', value: account.role || '—' },
    {
      label: 'Failed Attempts',
      value: account.failedAttempts != null ? String(account.failedAttempts) : '—',
      danger: true,
    },
    { label: 'Reason', value: account.reason || '—' },
  ]

  return (
    <div className="locked-accounts-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="locked-accounts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="locked-account-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="locked-accounts-modal-header">
          <div className="locked-accounts-modal-heading">
            <h2 id="locked-account-details-title" className="locked-accounts-modal-title">
              Account Details
            </h2>
            <p className="locked-accounts-modal-subtitle">Review locked account information</p>
          </div>
          <button
            type="button"
            className="locked-accounts-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="locked-accounts-modal-panel">
          {details.map((item) => (
            <div key={item.label} className="locked-accounts-modal-row">
              <span className="locked-accounts-modal-label">{item.label}</span>
              <span
                className={cn(
                  'locked-accounts-modal-value',
                  item.danger && 'locked-accounts-modal-value-danger',
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <footer className="locked-accounts-modal-footer">
          <button type="button" onClick={onClose} className="locked-accounts-modal-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={isUnlocking}
            onClick={onUnlock}
            className="locked-accounts-modal-unlock"
          >
            {isUnlocking ? 'Unlocking…' : 'Unlock'}
          </button>
        </footer>
      </div>
    </div>
  )
}

const LOCKED_ACCOUNT_SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'admin',
  'role',
  'reason',
  'lockedSince',
  'duration',
])

export function LockedAccountsPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<LockedAccountRow | null>(null)
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: LOCKED_ACCOUNT_SORT_FIELD_MAP,
    defaultSortBy: 'lockedSince',
    onPageReset: () => setPage(1),
  })

  const pageSize = 10
  const { data: accountsResult, isLoading } = useLockedAccounts({
    page,
    limit: pageSize,
    ...serverSort.sortParams,
  })
  const unlockMutation = useUnlockAccount()

  const meta = accountsResult?.meta
  const totalPages = meta?.totalPages ?? 1

  const handleColumnSort = (columnId: string) => {
    serverSort.onSortingChange((prev) => {
      const current = prev[0]
      if (!current || current.id !== columnId) {
        return [{ id: columnId, desc: false }]
      }
      if (!current.desc) {
        return [{ id: columnId, desc: true }]
      }
      return []
    })
  }

  const rows = accountsResult?.data ?? []

  const renderSortIcon = (columnId: string) => {
    const active = serverSort.sorting[0]
    if (!active || active.id !== columnId) {
      return <ArrowUpDown className="text-muted/50 size-[14px]" aria-hidden="true" />
    }
    return active.desc ? (
      <ArrowDown className="text-brand-primary size-[14px]" aria-hidden="true" />
    ) : (
      <ArrowUp className="text-brand-primary size-[14px]" aria-hidden="true" />
    )
  }

  const handleUnlock = useCallback(
    (id: string) => {
      unlockMutation.mutate(id, {
        onSuccess: () => {
          setSelected(null)
          toast.success('Account unlocked')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to unlock account')),
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
                <th
                  onClick={() => handleColumnSort('admin')}
                  className="cursor-pointer select-none"
                >
                  <div className="inline-flex items-center gap-1.5">
                    Admin {renderSortIcon('admin')}
                  </div>
                </th>
                <th onClick={() => handleColumnSort('role')} className="cursor-pointer select-none">
                  <div className="inline-flex items-center gap-1.5">
                    Roles {renderSortIcon('role')}
                  </div>
                </th>
                <th
                  onClick={() => handleColumnSort('reason')}
                  className="cursor-pointer select-none"
                >
                  <div className="inline-flex items-center gap-1.5">
                    Reason {renderSortIcon('reason')}
                  </div>
                </th>
                <th
                  onClick={() => handleColumnSort('lockedSince')}
                  className="cursor-pointer select-none"
                >
                  <div className="inline-flex items-center gap-1.5">
                    Locked Since {renderSortIcon('lockedSince')}
                  </div>
                </th>
                <th
                  onClick={() => handleColumnSort('duration')}
                  className="cursor-pointer select-none"
                >
                  <div className="inline-flex items-center gap-1.5">
                    Duration {renderSortIcon('duration')}
                  </div>
                </th>
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
