import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, Briefcase, CalendarDays, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'

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

const formatHistoryDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatHistoryDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${time}, ${formatHistoryDate(value)}`
}

const metadataString = (metadata: Record<string, unknown> | undefined, key: string) => {
  const value = metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

const getDateMeta = (log: AuditLog) => {
  const action = log.action.toLowerCase()
  if (action.includes('creat')) {
    return { label: 'Created Date', value: formatHistoryDate(log.createdAt) }
  }
  if (action.includes('suspend')) {
    return { label: 'Suspended Date & Time', value: formatHistoryDateTime(log.createdAt) }
  }
  if (action.includes('updat')) {
    return { label: 'Updated Date & Time', value: formatHistoryDateTime(log.createdAt) }
  }
  return { label: 'Date & Time', value: formatHistoryDateTime(log.createdAt) }
}

const getSubjectMeta = (log: AuditLog) => {
  const action = log.action.toLowerCase()
  const username = log.username && log.username !== '—' ? log.username : ''

  if (action.includes('suspend') && username) {
    return { label: 'Suspended User', value: username }
  }
  if (action.includes('plan') || action.includes('pric')) {
    return { label: 'Updated Plan', value: log.changedTo || username || log.module || '—' }
  }
  if (username) {
    return { label: 'Account for', value: username }
  }
  if (log.changedTo) {
    return { label: 'Updated Role', value: log.changedTo }
  }
  if (log.previousRole) {
    return { label: 'Previous Role', value: log.previousRole }
  }
  return { label: 'Module', value: log.module || 'RBAC' }
}

const getActorValue = (log: AuditLog) => {
  const name = log.performedBy?.trim() || '—'
  const role =
    metadataString(log.metadata, 'performedByRole') ||
    metadataString(log.metadata, 'actorRole') ||
    metadataString(log.metadata, 'role')
  if (!role || name.toLowerCase().includes(role.toLowerCase())) return name
  return `${name}(${role})`
}

function MetaRow({
  icon,
  label,
  value,
  valueLinked,
}: {
  icon: ReactNode
  label: string
  value: string
  valueLinked?: boolean
}) {
  return (
    <p className="vh-meta-row">
      <span className="vh-meta-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="vh-meta-text">
        <span className="vh-meta-label">{label}: </span>
        <span className={cn('vh-meta-value', valueLinked && 'is-link')}>{value}</span>
      </span>
    </p>
  )
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
  const dateMeta = getDateMeta(log)
  const subjectMeta = getSubjectMeta(log)

  return (
    <article className="vh-entry">
      <h3 className="vh-entry-title">{log.action}</h3>

      <div className="vh-entry-body">
        <div className="vh-meta-block">
          <MetaRow
            icon={<CalendarDays className="size-3.5" strokeWidth={1.75} />}
            label={dateMeta.label}
            value={dateMeta.value}
          />
          <MetaRow
            icon={<Briefcase className="size-3.5" strokeWidth={1.75} />}
            label={subjectMeta.label}
            value={subjectMeta.value}
            valueLinked
          />
          <MetaRow
            icon={<UserRound className="size-3.5" strokeWidth={1.75} />}
            label="By"
            value={getActorValue(log)}
          />
        </div>

        <div className="vh-entry-actions">
          <button type="button" className="vh-btn-view" onClick={() => onViewNew(log)}>
            View New Version
          </button>
          <button
            type="button"
            className="vh-btn-rollback"
            disabled={!log.canRollback || isRollingBack}
            onClick={() => onRollback(log)}
          >
            Rollback
          </button>
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

  return (
    <div className="vh-page">
      <div className="vh-header">
        <button type="button" onClick={onClose} className="vh-back">
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span>Version History</span>
        </button>
        <p className="vh-subtitle">
          Track all changes and revisions made to this service before approval
        </p>
      </div>

      <div className="vh-list">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="vh-empty">No version history for this admin yet.</div>
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
    </div>
  )
}
