import { X } from 'lucide-react'

import type { SettingsLog } from '../types/settings'
import { cn } from '@/shared/lib/cn'
import { formatDateTimeEnInLogs as formatDateTime } from '@/shared/lib/format-datetime'

type SettingsLogActionDetailsModalProps = {
  open: boolean
  log: SettingsLog | null
  isRestoring?: boolean
  onClose: () => void
  onViewVersionHistory: () => void
  onRestore: () => void
}

const formatActionPerformed = (log: SettingsLog) => {
  const firstChange = log.changes?.[0]
  if (firstChange?.setting && firstChange.newValue != null) {
    const verb =
      log.action === 'reset'
        ? 'Reset'
        : log.action === 'restore'
          ? 'Restored'
          : String(firstChange.newValue).toLowerCase() === 'enabled' ||
              String(firstChange.newValue).toLowerCase() === 'disabled'
            ? String(firstChange.newValue).toLowerCase() === 'enabled'
              ? 'Enabled'
              : 'Disabled'
            : 'Updated'
    return `${verb} ${firstChange.setting}`
  }

  const labels: Record<string, string> = {
    update: 'Updated settings',
    reset: 'Reset settings to defaults',
    restore: 'Restored previous settings version',
  }
  return labels[log.action] || 'Settings action'
}

export function SettingsLogActionDetailsModal({
  open,
  log,
  isRestoring = false,
  onClose,
  onViewVersionHistory,
  onRestore,
}: SettingsLogActionDetailsModalProps) {
  if (!open || !log) return null

  const changes = log.changes || []
  const canRestore = log.status === 'success' && log.action !== 'restore'

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-log-details-title"
        className={cn(
          'flex max-h-[min(90vh,920px)] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl border border-white/10',
          'bg-gradient-to-b from-[#141414] to-[#050505] shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-6 py-5">
          <h2 id="settings-log-details-title" className="text-lg font-semibold text-white">
            Action Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close details"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <section className="mb-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Action Information</h3>
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505]/60 p-4">
              <InfoRow label="Admin Name" value={log.performedBy || '—'} />
              <InfoRow label="Admin Role" value={log.role || 'Admin'} />
              <InfoRow label="Module" value={log.moduleLabel || log.module} />
              <InfoRow label="Action Performed" value={formatActionPerformed(log)} />
              <InfoRow label="Date & Time" value={formatDateTime(log.createdAt)} />
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Changes Made</h3>
              <button
                type="button"
                onClick={onViewVersionHistory}
                className="text-sm font-medium text-[#F6CB86] underline underline-offset-4"
              >
                View Version History
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#050505] text-white/55">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Setting Changed</th>
                    <th className="px-3 py-2.5 font-medium">Old Value</th>
                    <th className="px-3 py-2.5 font-medium">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.length ? (
                    changes.map((change, index) => (
                      <tr key={`${change.setting}-${index}`} className="border-t border-white/10">
                        <td className="px-3 py-2.5 text-white">{change.setting}</td>
                        <td className="px-3 py-2.5 text-white/55">
                          {change.oldValue == null || change.oldValue === ''
                            ? '—'
                            : String(change.oldValue)}
                        </td>
                        <td className="px-3 py-2.5 text-white">
                          {change.newValue == null || change.newValue === ''
                            ? '—'
                            : String(change.newValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-white/55">
                        No field-level changes recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Admin Note</h3>
            <div className="min-h-[96px] rounded-xl border border-white/10 bg-[#050505] p-4">
              <p className="text-sm leading-relaxed text-white/85">
                {log.adminNote?.trim() || 'No admin note provided for this action.'}
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-white">System Information</h3>
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505]/60 p-4">
              <InfoRow label="Impact Scope" value={log.impactScope || '—'} />
              <InfoRow label="Affected User" value={log.affectedUser || '—'} />
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-lg border border-white/20 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canRestore || isRestoring}
            onClick={onRestore}
            className="inline-flex h-10 min-w-[238px] items-center justify-center rounded-lg bg-gradient-to-r from-[#E0A263] to-[#F6CB86] px-4 text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRestoring ? 'Restoring...' : 'Restore Previous Version'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-white/55">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  )
}
