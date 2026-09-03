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

const cardClass = 'rounded-[10px] border border-white/[0.06] bg-[#111111] p-4 sm:p-5'
const sectionTitleClass =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-medium tracking-normal text-white/50"
const labelClass =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-medium tracking-normal text-white/50"
const valueClass =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-medium tracking-normal text-white"

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
          'flex max-h-[min(90vh,920px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[10px] border border-white/10',
          'bg-[#050505] shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="settings-log-details-title"
            className="font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-lg leading-7 font-semibold tracking-normal text-white"
          >
            Action Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close details"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <section className={cardClass}>
            <h3 className={cn(sectionTitleClass, 'mb-4')}>Action Information</h3>
            <div className="space-y-3">
              <InfoRow label="Admin Name" value={log.performedBy || '—'} />
              <InfoRow label="Admin Role" value={log.role || 'Admin'} />
              <InfoRow label="Module" value={log.moduleLabel || log.module} />
              <InfoRow label="Action Performed" value={formatActionPerformed(log)} />
              <InfoRow label="Date & Time" value={formatDateTime(log.createdAt)} />
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className={sectionTitleClass}>Changes Made</h3>
              <button
                type="button"
                onClick={onViewVersionHistory}
                className={cn(
                  sectionTitleClass,
                  'underline underline-offset-4 hover:text-white/70',
                )}
              >
                View Version History
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className={cn(labelClass, 'pr-3 pb-2.5 font-medium')}>Setting Changed</th>
                    <th className={cn(labelClass, 'pr-3 pb-2.5 font-medium')}>Old Value</th>
                    <th className={cn(labelClass, 'pb-2.5 font-medium')}>New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.length ? (
                    changes.map((change, index) => (
                      <tr
                        key={`${change.setting}-${index}`}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        <td className={cn(valueClass, 'py-2.5 pr-3')}>{change.setting}</td>
                        <td className={cn(valueClass, 'py-2.5 pr-3 text-white/70')}>
                          {change.oldValue == null || change.oldValue === ''
                            ? '—'
                            : String(change.oldValue)}
                        </td>
                        <td className={cn(valueClass, 'py-2.5')}>
                          {change.newValue == null || change.newValue === ''
                            ? '—'
                            : String(change.newValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className={cn(labelClass, 'py-4 text-center')}>
                        No field-level changes recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={cardClass}>
            <h3 className={cn(sectionTitleClass, 'mb-3')}>Admin Note</h3>
            <div className="border-t border-white/10 pt-3">
              <p className="font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-[20px] font-medium tracking-normal text-white/70">
                {log.adminNote?.trim() || 'No admin note provided for this action.'}
              </p>
            </div>
          </section>

          <section className={cardClass}>
            <h3 className={cn(sectionTitleClass, 'mb-4')}>System Information</h3>
            <div className="space-y-3">
              <InfoRow label="Impact Scope" value={log.impactScope || '—'} />
              <InfoRow label="Affected User" value={log.affectedUser || '—'} />
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-[10px] border border-white/20 bg-[#050505] px-4 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canRestore || isRestoring}
            onClick={onRestore}
            className="inline-flex h-10 min-w-[220px] items-center justify-center rounded-[10px] bg-gradient-to-b from-[#F6CB86] to-[#E0A263] px-4 text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="flex items-start justify-between gap-4">
      <span className={labelClass}>{label}</span>
      <span className={cn(valueClass, 'max-w-[60%] text-right')}>{value}</span>
    </div>
  )
}
