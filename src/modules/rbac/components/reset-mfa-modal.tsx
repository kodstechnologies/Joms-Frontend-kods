import { AlertTriangle, KeyRound, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { SubAdmin } from '../types/rbac'

type ResetMfaModalProps = {
  open: boolean
  user: SubAdmin | null
  onClose: () => void
  onConfirm: (user: SubAdmin) => Promise<void> | void
  isSubmitting?: boolean
}

export function ResetMfaModal({
  open,
  user,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ResetMfaModalProps) {
  if (!open || !user) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-mfa-title"
        className="ui-modal-shell max-w-[500px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <h2 id="reset-mfa-title" className="text-h3 text-brand-text">
              Reset Two-Factor Authentication
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
            Are you sure you want to reset two-factor authentication (MFA) for{' '}
            <strong className="font-semibold text-white">{user.fullname}</strong>?
          </p>

          <div className="rounded-brand-md space-y-2 border border-white/10 bg-white/5 p-4 text-xs text-white/70">
            <div className="flex justify-between">
              <span className="text-brand-muted">User ID:</span>
              <span className="font-mono text-white">{user.adminCode || user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Email:</span>
              <span className="font-mono text-white">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Current 2FA Status:</span>
              <span className="font-semibold text-white">
                {user.mfaEnabled ? 'Enabled' : 'Disabled / Not Setup'}
              </span>
            </div>
            {user.roles && user.roles.length > 0 ? (
              <div className="flex justify-between">
                <span className="text-brand-muted">Assigned Roles:</span>
                <span className="font-medium text-white">
                  {user.roles.map((r) => r.name).join(', ')}
                </span>
              </div>
            ) : null}
          </div>

          <div className="rounded-brand-md flex items-start gap-3 border border-white/15 bg-white/5 p-3.5 text-xs text-white/80">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong>Instant action:</strong> This will clear the user&apos;s current authenticator
              app secret. An immediate 2FA setup prompt will be presented to the user requiring them
              to re-configure their authenticator app before continuing access.
            </p>
          </div>
        </div>

        <div className="ui-modal-footer flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-white/15 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(user)}
            disabled={isSubmitting}
            className="bg-brand-accent font-medium text-[#050505] hover:brightness-95"
          >
            {isSubmitting ? 'Resetting MFA...' : 'Confirm Reset MFA'}
          </Button>
        </div>
      </div>
    </div>
  )
}
