import { createPortal } from 'react-dom'
import { History, X } from 'lucide-react'
import { toast } from 'sonner'

import type { SettingsLog } from '../types/settings'
import { useRestoreSettingsLog } from '../hooks/use-settings'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type ActionDetailsModalProps = {
  open: boolean
  log: SettingsLog | null
  onClose: () => void
  onOpenVersionHistory: (log: SettingsLog) => void
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted text-xs">{label}</p>
      <p className="text-sm text-white">{value || '—'}</p>
    </div>
  )
}

export function ActionDetailsModal({
  open,
  log,
  onClose,
  onOpenVersionHistory,
}: ActionDetailsModalProps) {
  const restoreMutation = useRestoreSettingsLog()

  if (!open || !log) return null

  const changes = log.changes?.length
    ? log.changes
    : (log.changedSettings || []).map((setting) => ({
        setting,
        oldValue: '—',
        newValue: '—',
      }))

  const handleRestore = () => {
    restoreMutation.mutate(log.id, {
      onSuccess: () => {
        toast.success('Previous version restored')
        onClose()
      },
      onError: () => toast.error('Failed to restore previous version'),
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-brand-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-h4 text-white">Action Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section className="space-y-3">
            <p className="text-body-md-semibold text-white">Action Information</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Admin Name" value={log.performedBy} />
              <InfoRow label="Admin Role" value={log.role || 'Admin'} />
              <InfoRow label="Module" value={log.moduleLabel || log.module} />
              <InfoRow
                label="Action Performed"
                value={`${log.action}${log.changedSettings?.[0] ? ` · ${log.changedSettings[0]}` : ''}`}
              />
              <InfoRow label="Date & Time" value={formatDateTime(log.createdAt)} />
              <InfoRow label="Status" value={log.status} />
              <InfoRow label="Version" value={log.version || '—'} />
              <InfoRow label="IP Address" value={log.ipAddress} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-body-md-semibold text-white">Changes Made</p>
              <button
                type="button"
                onClick={() => onOpenVersionHistory(log)}
                className="text-brand-accent text-body-sm inline-flex items-center gap-1.5 underline"
              >
                <History className="size-3.5" />
                View Version History
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10">
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
                      <td colSpan={3} className="text-muted px-3 py-4 text-center">
                        No field-level changes recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-body-md-semibold text-white">Admin Note</p>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              {log.adminNote || 'No admin note provided for this action.'}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted text-xs">Impact Scope</p>
              <p className="text-sm text-white">{log.impactScope || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted text-xs">Affected User</p>
              <p className="text-sm text-white">{log.affectedUser || '—'}</p>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={restoreMutation.isPending || log.status !== 'success'}
            onClick={handleRestore}
            className={cn(log.status !== 'success' && 'opacity-60')}
          >
            {restoreMutation.isPending ? 'Restoring…' : 'Restore Previous Version'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
