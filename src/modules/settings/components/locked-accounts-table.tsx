import { useActivateExpert, useExperts } from '@/modules/expert/hooks/use-expert'
import { toast } from 'sonner'
import { SettingsSectionCard } from './settings-section-card'
import { getApiErrorMessage } from '@/shared/lib/api-error'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LockedAccountsTable() {
  const { data, isLoading } = useExperts({ page: 1, limit: 5, status: 'suspended' })
  const activateExpert = useActivateExpert()
  const rows = (data?.data ?? []).filter((expert) => expert.status === 'suspended')

  return (
    <SettingsSectionCard
      title="Suspended Experts"
      description="Experts suspended by auto-rules or an admin. Unlock restores access immediately."
    >
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Expert</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Blocked until</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No suspended experts
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-white/5 text-slate-200">
                  <td className="px-4 py-3">
                    <div>{row.name}</div>
                    <div className="text-xs text-slate-400">
                      {row.email || row.phone || row.expertId}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.blockedReason || row.reason || '—'}</td>
                  <td className="px-4 py-3">
                    {row.blockedUntil ? formatDate(row.blockedUntil) : 'Permanent'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-50"
                      disabled={activateExpert.isPending}
                      onClick={() =>
                        activateExpert.mutate(row.id, {
                          onSuccess: () => toast.success('Expert unlocked'),
                          onError: (error: unknown) => {
                            const err = error as { response?: { data?: { message?: string } } }
                            toast.error(getApiErrorMessage(err, 'Failed to unlock expert'))
                          },
                        })
                      }
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Admin lockouts stay in Security & Access. This list is experts only.
      </p>
    </SettingsSectionCard>
  )
}
