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
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Locked Since</th>
              <th className="px-4 py-3 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {lockedAccountsMock.map((row) => (
              <tr key={row.id} className="border-t border-white/5 text-slate-200">
                <td className="px-4 py-3">{row.admin}</td>
                <td className="px-4 py-3 text-slate-400">{row.role}</td>
                <td className="px-4 py-3">{row.reason}</td>
                <td className="px-4 py-3">{row.lockedSince}</td>
                <td className="px-4 py-3">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        View full locked account management from Security & Access settings.
      </p>
    </SettingsSectionCard>
  )
}
