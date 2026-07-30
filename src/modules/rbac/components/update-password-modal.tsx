import { useState } from 'react'
import { X } from 'lucide-react'

const PASSWORD_RULES = [
  'Password must be at least 6 characters long.',
  'New password must be different from the current password.',
]

type UpdatePasswordModalProps = {
  open: boolean
  userName?: string
  isSubmitting?: boolean
  requireOldPassword?: boolean
  mode?: 'update' | 'set' | 'reset'
  onClose: () => void
  onSubmit: (payload: {
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
  }) => void
}

export function UpdatePasswordModal({
  open,
  userName,
  isSubmitting = false,
  requireOldPassword = true,
  mode = 'update',
  onClose,
  onSubmit,
}: UpdatePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  const resetForm = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    onSubmit({ oldPassword, newPassword, confirmNewPassword })
  }

  if (!open) return null

  const title =
    mode === 'set' ? 'Set Password' : mode === 'reset' ? 'Reset Password' : 'Update Password'

  const description = (() => {
    if (!userName) return null
    if (mode === 'set') {
      return (
        <>
          Set a password for <span className="text-body-md-medium text-brand-text">{userName}</span>
          .
        </>
      )
    }
    if (mode === 'reset') {
      return (
        <>
          Reset password for <span className="text-body-md-medium text-brand-text">{userName}</span>
          .
        </>
      )
    }
    return (
      <>
        Reset password for <span className="text-body-md-medium text-brand-text">{userName}</span>.
        Enter the user&apos;s current password, then set a new one.
      </>
    )
  })()

  const submitLabel = (() => {
    if (isSubmitting) {
      if (mode === 'set') return 'Setting...'
      if (mode === 'reset') return 'Resetting...'
      return 'Updating...'
    }
    if (mode === 'set') return 'Set Password'
    if (mode === 'reset') return 'Reset Password'
    return 'Change Password'
  })()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-password-modal-title"
        className="ui-modal-shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="update-password-modal-title" className="text-h2 text-brand-text">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          {description ? <p className="text-body-md text-muted">{description}</p> : null}

          <div className="space-y-4">
            {requireOldPassword ? (
              <div className="space-y-2">
                <label className="text-body-sm-medium text-brand-text" htmlFor="old-password">
                  User&apos;s Current Password<span className="text-brand-danger">*</span>
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  placeholder="Enter here.."
                  autoComplete="current-password"
                  className="ui-input"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-body-sm-medium text-brand-text" htmlFor="new-password">
                Enter New Password<span className="text-brand-danger">*</span>
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="new-password"
                className="ui-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-body-sm-medium text-brand-text" htmlFor="confirm-new-password">
                Confirm New Password<span className="text-brand-danger">*</span>
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="new-password"
                className="ui-input"
              />
            </div>
          </div>

          <div className="radius-md bg-brand-bg border border-white/10 px-4 py-3">
            <p className="text-body-md-semibold text-brand-text">Password Format &amp; Rules</p>
            <ul className="text-body-sm text-muted mt-2 list-disc space-y-1 pl-4">
              {(requireOldPassword
                ? PASSWORD_RULES
                : PASSWORD_RULES.filter((rule) => !rule.includes('different from the current'))
              ).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
              {!requireOldPassword && mode === 'reset' ? (
                <li>New password must be different from the current password.</li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
