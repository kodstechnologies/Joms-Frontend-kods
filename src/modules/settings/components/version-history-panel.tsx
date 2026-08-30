import { createPortal } from 'react-dom'
import { ArrowLeft, Clock3, UserRound } from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'

import type { SettingsLog, SettingsModule } from '../types/settings'
import { useSettingsModuleVersions } from '../hooks/use-settings'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { formatDateTimeEnInSettingsVersion as formatDateTime } from '@/shared/lib/format-datetime'

type VersionHistoryPanelProps = {
  open: boolean
  module: SettingsModule | null
  onClose: () => void
}

function VersionCard({ version, isFirst }: { version: SettingsLog; isFirst: boolean }) {
  const changes = version.changes || []

  return (
    <div className="relative flex gap-4 pb-6">
      <div className="flex flex-col items-center">
        <div className="bg-brand-bg grid size-8 place-items-center rounded-full border border-white/20">
          <Clock3 className="text-muted size-3.5" />
        </div>
        <div className="mt-2 w-px flex-1 bg-white/15" />
      </div>

      <article className="bg-brand-surface min-w-0 flex-1 rounded-xl border border-white/10 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'size-2 rounded-full',
              version.isCurrentVersion || isFirst ? 'bg-brand-positive' : 'bg-brand-accent',
            )}
          />
          <p className="text-body-md-semibold text-white">
            Version {version.version || '—'}
            {version.isCurrentVersion || isFirst ? ' (Current Active)' : ''}
          </p>
          <span className="border-brand-positive/30 bg-brand-positive/10 text-brand-positive rounded-full border px-2 py-0.5 text-xs font-semibold">
            Active
          </span>
        </div>

        <div className="text-muted mb-4 space-y-1.5 text-sm">
          <p className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5" />
            Changed By: {version.performedBy || '—'}
          </p>
          <p>Role: {version.role || 'Admin'}</p>
          <p className="inline-flex items-center gap-1.5">
            <img src={calendarIcon} alt="calendar" className="size-3.5" />
            Date: {formatDateTime(version.createdAt)}
          </p>
          <p>Reason: {version.adminNote || '—'}</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="text-muted bg-black/30">
              <tr>
                <th className="px-3 py-2 font-medium">Setting</th>
                <th className="px-3 py-2 font-medium">Old Value</th>
                <th className="px-3 py-2 font-medium">New Value</th>
              </tr>
            </thead>
            <tbody>
              {changes.length ? (
                changes.map((change, index) => (
                  <tr key={`${change.setting}-${index}`} className="border-t border-white/10">
                    <td className="px-3 py-2 text-white">{change.setting}</td>
                    <td className="text-muted px-3 py-2">
                      {change.oldValue == null || change.oldValue === ''
                        ? '—'
                        : String(change.oldValue)}
                    </td>
                    <td className="px-3 py-2 text-white">
                      {change.newValue == null || change.newValue === ''
                        ? '—'
                        : String(change.newValue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-muted px-3 py-3 text-center">
                    No changes recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export function VersionHistoryPanel({ open, module, onClose }: VersionHistoryPanelProps) {
  const { data, isLoading } = useSettingsModuleVersions(module || undefined, {
    page: 1,
    limit: 30,
  })

  if (!open || !module) return null

  const versions = data?.data ?? []

  return createPortal(
    <div className="fixed inset-0 z-[130] flex justify-end bg-black/60">
      <div className="bg-brand-bg flex h-full w-full max-w-xl flex-col border-l border-white/10">
        <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-muted mt-1 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-h4 text-white">Version History</h2>
            <p className="text-muted mt-1 text-sm">
              Track all changes and revisions made to this service before approval
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-400">
              No version history for this module yet.
            </div>
          ) : (
            versions.map((version, index) => (
              <VersionCard key={version.id} version={version} isFirst={index === 0} />
            ))
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
