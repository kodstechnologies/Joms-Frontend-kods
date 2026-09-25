import { AlertTriangle, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import type { Role, SubAdmin } from '../types/rbac'

type RevokeRoleModalProps =
  | {
      type: 'role'
      open: boolean
      role: Role | null
      onClose: () => void
      onConfirm: (role: Role) => Promise<void> | void
      isSubmitting?: boolean
    }
  | {
      type: 'user'
      open: boolean
      user: SubAdmin | null
      targetRoleId?: string
      targetRoleName?: string
      onClose: () => void
      onConfirm: (user: SubAdmin, roleId: string) => Promise<void> | void
      isSubmitting?: boolean
    }

export function RevokeRoleModal(props: RevokeRoleModalProps) {
  if (!props.open) return null

  if (props.type === 'role') {
    return <RevokeRoleContent {...props} />
  }

  return <RevokeUserRoleContent {...props} />
}

function RevokeRoleContent({
  role,
  onClose,
  onConfirm,
  isSubmitting = false,
}: Extract<RevokeRoleModalProps, { type: 'role' }>) {
  if (!role) return null

  const userCount = role.userCount ?? 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revoke-role-title"
        className="ui-modal-shell max-w-[500px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </span>
            <h2 id="revoke-role-title" className="text-h3 text-brand-text">
              Revoke Role
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <p className="text-body-sm text-brand-text/80 leading-relaxed">
            Are you sure you want to revoke the role{' '}
            <strong className="font-semibold text-white">{role.name}</strong>?
          </p>

          <div className="rounded-brand-md space-y-2 border border-white/10 bg-white/5 p-4 text-xs text-white/70">
            <div className="flex justify-between">
              <span className="text-brand-muted">Role ID:</span>
              <span className="font-mono text-white">{role.roleCode || role.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Current Status:</span>
              <span className="text-white capitalize">{role.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Assigned Users:</span>
              <span className="font-semibold text-white">
                {userCount} user{userCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-white/15 bg-white/5 p-3 text-xs text-white/80">
            <AlertTriangle className="size-4 shrink-0 text-white" aria-hidden="true" />
            <span>
              This will immediately remove this role from all assigned users and mark the role as
              disabled. Affected users will lose associated permissions.
            </span>
          </div>
        </div>

        <div className="ui-modal-footer flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void onConfirm(role)}
            className="bg-brand-accent h-9 rounded-lg px-4 text-sm font-semibold text-[#050505] shadow-none hover:brightness-95"
          >
            {isSubmitting ? 'Revoking...' : 'Confirm Revoke Role'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RevokeUserRoleContent({
  user,
  targetRoleId,
  targetRoleName,
  onClose,
  onConfirm,
  isSubmitting = false,
}: Extract<RevokeRoleModalProps, { type: 'user' }>) {
  if (!user) return null

  const userRoles = user.roles ?? []
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    targetRoleId || userRoles[0]?.id || '',
  )

  const effectiveRoleId = targetRoleId || selectedRoleId
  const roleObject = userRoles.find((r) => r.id === effectiveRoleId)
  const displayName = targetRoleName || roleObject?.name || 'Assigned Role'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revoke-user-role-title"
        className="ui-modal-shell max-w-[500px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </span>
            <h2 id="revoke-user-role-title" className="text-h3 text-brand-text">
              Revoke Role from User
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <p className="text-body-sm text-brand-text/80 leading-relaxed">
            Are you sure you want to revoke the role from{' '}
            <strong className="font-semibold text-white">{user.fullname}</strong>?
          </p>

          <div className="rounded-brand-md space-y-2 border border-white/10 bg-white/5 p-4 text-xs text-white/70">
            <div className="flex justify-between">
              <span className="text-brand-muted">User:</span>
              <span className="font-semibold text-white">{user.fullname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Email:</span>
              <span className="font-mono text-white">{user.email}</span>
            </div>
            {targetRoleId ? (
              <div className="flex justify-between">
                <span className="text-brand-muted">Role to Revoke:</span>
                <span className="font-semibold text-white">{displayName}</span>
              </div>
            ) : userRoles.length > 1 ? (
              <div className="pt-2">
                <label className="text-brand-muted block pb-1.5">Select Role to Revoke:</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/20 bg-black px-3 text-xs text-white outline-none"
                >
                  {userRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.roleCode})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-brand-muted">Role to Revoke:</span>
                <span className="font-semibold text-white">
                  {userRoles[0]?.name || displayName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-white/15 bg-white/5 p-3 text-xs text-white/80">
            <AlertTriangle className="size-4 shrink-0 text-white" aria-hidden="true" />
            <span>
              The user will immediately lose all permissions and privileges granted by this role.
            </span>
          </div>
        </div>

        <div className="ui-modal-footer flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !effectiveRoleId}
            onClick={() => void onConfirm(user, effectiveRoleId)}
            className="bg-brand-accent h-9 rounded-lg px-4 text-sm font-semibold text-[#050505] shadow-none hover:brightness-95"
          >
            {isSubmitting ? 'Revoking...' : 'Confirm Revoke'}
          </Button>
        </div>
      </div>
    </div>
  )
}
