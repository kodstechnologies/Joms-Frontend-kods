import { MoreVertical } from 'lucide-react'
import { toast } from 'sonner'

import { lockedAccountsMock } from '../mock/settings.defaults'
import { SettingsSectionCard } from './settings-section-card'

export function LockedAccountsTable() {
  return (
    <SettingsSectionCard
      title="Locked Account"
      description="Manage accounts that have been locked due to security reasons."
    >
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Mail ID</th>
              <th className="px-4 py-3 font-medium">Suspended Since</th>
              <th className="px-4 py-3 font-medium">Auto-Lift At</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lockedAccountsMock.map((row) => (
              <tr key={row.id} className="border-t border-white/5 text-slate-200">
                <td className="px-4 py-3">{row.user}</td>
                <td className="px-4 py-3 text-slate-400">{row.email}</td>
                <td className="px-4 py-3">{row.suspendedSince}</td>
                <td className="px-4 py-3">{row.autoLiftAt}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white"
                    onClick={() => toast.message('Unlock / extend coming soon')}
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsSectionCard>
  )
}
