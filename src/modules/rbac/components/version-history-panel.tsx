import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, RotateCcw, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'

import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import { Button } from '@/shared/components/ui/button'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

import { useRollbackAuditLog } from '../hooks/use-rbac'
import type { AuditLog } from '../types/rbac'

type VersionHistoryPanelProps = {
  open: boolean
  logs: AuditLog[]
  isLoading?: boolean
  onClose: () => void
  onRolledBack?: () => void
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const snapshotOf = (log: AuditLog, version: 'new' | 'previous') => {
  const metadata = log.metadata || {}
  if (version === 'new') {
    return (
      metadata.newVersion ?? {
        changedTo: log.changedTo || metadata.changedTo,
        action: log.action,
      }
    )
  }
  return (
    metadata.previousVersion ?? {
      previousRole: log.previousRole || metadata.previousRole,
      action: log.action,
    }
  )
}

const affectedLabel = (log: AuditLog) => {
  if (log.username && log.username !== '—') return `Account for: ${log.username}`
  if (log.changedTo) return `Updated Role: ${log.changedTo}`
  if (log.previousRole) return `Previous Role: ${log.previousRole}`
  return log.module || 'RBAC'
}

function SnapshotModal({
  title,
  snapshot,
  onClose,
}: {
  title: string
  snapshot: unknown
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
      <div
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface w-full max-w-lg p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-brand-text text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <pre className="rounded-brand-md text-brand-text bg-brand-bg mt-4 max-h-72 overflow-auto border border-white/10 p-4 text-xs">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function HistoryEntry({
  log,
  onViewNew,
  onRollback,
  isRollingBack,
}: {
  log: AuditLog
  onViewNew: (log: AuditLog) => void
  onRollback: (log: AuditLog) => void
  isRollingBack: boolean
}) {
  return (
    <article className="border-b border-white/10 py-5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-brand-text text-base font-semibold">{log.action}</h3>
          <div className="text-muted mt-3 space-y-2 text-sm">
            <p className="inline-flex items-center gap-2">
              <img src={calendarIcon} alt="" className="size-3.5" />
              {formatDateTime(log.createdAt)}
            </p>
            <p className="flex items-center gap-2">
              <img src={calendarIcon} alt="" className="size-3.5" />
              <span className="underline underline-offset-2">{affectedLabel(log)}</span>
            </p>
            <p className="inline-flex items-center gap-2">
              <UserRound className="size-3.5" />
              By: {log.performedBy || '—'}
            </p>
            {log.rolledBack ? (
              <p className="text-brand-muted text-xs font-medium">Already rolled back</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button type="button" className="px-4 py-2 text-xs" onClick={() => onViewNew(log)}>
            View New Version
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2 text-xs"
            disabled={!log.canRollback || isRollingBack}
            onClick={() => onRollback(log)}
          >
            <RotateCcw className="size-3.5" />
            Rollback
          </Button>
        </div>
      </div>
    </article>
  )
}

export function VersionHistoryPanel({
  open,
  logs,
  isLoading,
  onClose,
  onRolledBack,
}: VersionHistoryPanelProps) {
  const rollbackMutation = useRollbackAuditLog()
  const [snapshotLog, setSnapshotLog] = useState<AuditLog | null>(null)
  const [confirmLog, setConfirmLog] = useState<AuditLog | null>(null)

  const entries = useMemo(
    () => logs.filter((log) => log.status?.toLowerCase() === 'success'),
    [logs],
  )

  if (!open) return null

  const handleRollback = async () => {
    if (!confirmLog) return
    const logId = confirmLog.id || confirmLog._id
    if (!logId) return

    try {
      await rollbackMutation.mutateAsync(logId)
      toast.success('Rolled back to the previous role')
      setConfirmLog(null)
      onRolledBack?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to rollback'))
    }
  }

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
              Track all changes and revisions made to this service before approval.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {isLoading ? (
            <div className="space-y-3 py-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-400">
              No version history for this admin yet.
            </div>
          ) : (
            entries.map((log) => (
              <HistoryEntry
                key={log.id || log._id || `${log.action}-${log.createdAt}`}
                log={log}
                onViewNew={setSnapshotLog}
                onRollback={setConfirmLog}
                isRollingBack={rollbackMutation.isPending}
              />
            ))
          )}
        </div>
      </div>

      {snapshotLog ? (
        <SnapshotModal
          title="New Version"
          snapshot={snapshotOf(snapshotLog, 'new')}
          onClose={() => setSnapshotLog(null)}
        />
      ) : null}

      {confirmLog ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
          <div
            className={cn(
              uiTokens.radiusCard,
              uiTokens.borderSubtle,
              'bg-brand-surface w-full max-w-md p-6',
            )}
          >
            <h3 className="text-brand-text text-lg font-semibold">Rollback to previous role?</h3>
            <p className="text-muted mt-2 text-sm">
              This will restore the previous role
              {confirmLog.previousRole ? (
                <>
                  {' '}
                  <span className="text-brand-text font-medium">{confirmLog.previousRole}</span>
                </>
              ) : null}{' '}
              for this change.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmLog(null)}>
                Cancel
              </Button>
              <Button
                disabled={rollbackMutation.isPending}
                onClick={() => {
                  void handleRollback()
                }}
              >
                Rollback
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
