import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
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

const getSubjectProfileHref = (log: AuditLog) => {
  const fromLog = typeof log.subAdminId === 'string' ? log.subAdminId.trim() : ''
  if (fromLog) return `/settings/access/users/${fromLog}`

  const metadata = log.metadata || {}
  const fromMeta =
    (typeof metadata.subAdminId === 'string' && metadata.subAdminId.trim()) ||
    (typeof metadata.userId === 'string' && metadata.userId.trim()) ||
    (typeof metadata.targetUserId === 'string' && metadata.targetUserId.trim()) ||
    ''
  return fromMeta ? `/settings/access/users/${fromMeta}` : undefined
}

const getSubjectMeta = (log: AuditLog) => {
  const action = log.action.toLowerCase()
  const username = log.username && log.username !== '—' ? log.username : ''
  const profileHref = getSubjectProfileHref(log)

  if (action.includes('suspend') && username) {
    return { label: 'Suspended User', value: username, href: profileHref }
  }
  if (action.includes('plan') || action.includes('pric')) {
    return {
      label: 'Updated Plan',
      value: log.changedTo || username || log.module || '—',
    }
  }
  if (username) {
    return { label: 'Account for', value: username, href: profileHref }
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
  href,
}: {
  icon: ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <p className="vh-meta-row">
      <span className="vh-meta-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="vh-meta-text">
        <span className="vh-meta-label">{label}: </span>
        {href ? (
          <Link to={href} className="vh-meta-value is-link">
            {value}
          </Link>
        ) : (
          <span className="vh-meta-value">{value}</span>
        )}
      </span>
    </p>
  )
}

const SNAPSHOT_FIELD_ORDER = [
  'firstName',
  'lastName',
  'fullname',
  'name',
  'email',
  'phone',
  'status',
  'jobTitle',
  'department',
  'roleNames',
  'roles',
  'permissions',
  'changedTo',
  'previousRole',
  'action',
] as const

const SNAPSHOT_FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  fullname: 'Full Name',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  status: 'Status',
  jobTitle: 'Job Title',
  department: 'Department',
  roleNames: 'Assigned Roles',
  roles: 'Assigned Roles',
  roleIds: 'Role IDs',
  permissions: 'Permissions',
  changedTo: 'Changed To',
  previousRole: 'Previous Role',
  action: 'Action',
}

const HIDDEN_SNAPSHOT_KEYS = new Set([
  'id',
  '_id',
  'password',
  'passwordHash',
  'mfaSecret',
  'mfaPendingSecret',
])

const humanizeKey = (key: string) =>
  SNAPSHOT_FIELD_LABELS[key] ||
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const asPlainObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const toStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item).trim()
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const label = record.name ?? record.label ?? record.title ?? record.roleName
        return typeof label === 'string' ? label.trim() : ''
      }
      return ''
    })
    .filter(Boolean)
}

const formatPrimitive = (value: unknown): string => {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value.trim() || '—'
  return String(value)
}

const buildSnapshotRows = (snapshot: unknown) => {
  const object = asPlainObject(snapshot)
  if (!object) {
    return [{ key: 'value', label: 'Details', value: snapshot }]
  }

  const keys = Object.keys(object).filter((key) => !HIDDEN_SNAPSHOT_KEYS.has(key))
  const hasRoleNames =
    toStringList(object.roleNames).length > 0 || toStringList(object.roles).length > 0
  const ordered = [
    ...SNAPSHOT_FIELD_ORDER.filter((key) => keys.includes(key)),
    ...keys
      .filter((key) => !(SNAPSHOT_FIELD_ORDER as readonly string[]).includes(key))
      .sort((a, b) => a.localeCompare(b)),
  ].filter((key, index, list) => list.indexOf(key) === index)

  return ordered
    .filter((key) => !(key === 'roleIds' && hasRoleNames))
    .map((key) => ({
      key,
      label: humanizeKey(key),
      value: object[key],
    }))
    .filter((row) => {
      if (row.value == null || row.value === '') return false
      if (Array.isArray(row.value) && row.value.length === 0) return false
      return true
    })
}

function SnapshotValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  if (fieldKey === 'status' && typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    const isActive = normalized === 'active'
    return (
      <span className={cn('admin-info-status-pill', isActive ? 'is-active' : 'is-inactive')}>
        {value}
      </span>
    )
  }

  const list =
    fieldKey === 'roleNames' ||
    fieldKey === 'roles' ||
    fieldKey === 'permissions' ||
    fieldKey === 'roleIds'
      ? toStringList(value)
      : Array.isArray(value)
        ? toStringList(value)
        : []

  if (list.length > 0) {
    return (
      <div className="vh-snapshot-chips">
        {list.map((item) => (
          <span key={`${fieldKey}-${item}`} className="vh-snapshot-chip">
            {item}
          </span>
        ))}
      </div>
    )
  }

  const nested = asPlainObject(value)
  if (nested) {
    const nestedRows = Object.entries(nested)
      .filter(([key]) => !HIDDEN_SNAPSHOT_KEYS.has(key))
      .map(([key, nestedValue]) => ({
        key,
        label: humanizeKey(key),
        text: formatPrimitive(nestedValue),
      }))
      .filter((row) => row.text !== '—')

    if (!nestedRows.length) return <span className="vh-snapshot-value">—</span>

    return (
      <div className="vh-snapshot-nested">
        {nestedRows.map((row) => (
          <div key={row.key} className="vh-snapshot-nested-row">
            <span className="vh-snapshot-nested-label">{row.label}</span>
            <span className="vh-snapshot-value">{row.text}</span>
          </div>
        ))}
      </div>
    )
  }

  return <span className="vh-snapshot-value">{formatPrimitive(value)}</span>
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
  const rows = buildSnapshotRows(snapshot)

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vh-snapshot-title"
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface flex w-full max-w-lg flex-col overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-6 py-5">
          <h3 id="vh-snapshot-title" className="text-brand-text text-lg font-semibold">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted grid size-8 place-items-center rounded-md hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto px-6 py-5">
          {rows.length === 0 ? (
            <p className="text-muted text-sm">No version details available.</p>
          ) : (
            <div className="vh-snapshot-grid">
              {rows.map((row) => (
                <div key={row.key} className="vh-snapshot-row">
                  <p className="vh-snapshot-label">{row.label}</p>
                  <SnapshotValue fieldKey={row.key} value={row.value} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-white/10 px-6 py-4">
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
            href={subjectMeta.href}
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
