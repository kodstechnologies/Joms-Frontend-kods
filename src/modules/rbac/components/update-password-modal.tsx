import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { useSecurityPolicy } from '@/modules/settings/hooks/use-security-policy'
import {
  describePasswordPolicy,
  validatePasswordAgainstPolicy,
} from '@/modules/settings/utils/password-policy'
import { RequiredMark } from '@/shared/components/form/required-mark'

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
  const { passwordPolicy } = useSecurityPolicy()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  const policyRules = describePasswordPolicy(passwordPolicy)
  const passwordRules = [
    ...policyRules,
    ...(requireOldPassword || mode === 'reset'
      ? ['New password must be different from the current password.']
      : []),
  ]

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
    if (!newPassword || !confirmNewPassword) {
      toast.error('New password and confirmation are required')
      return
    }
    if (requireOldPassword && !oldPassword) {
      toast.error("User's current password is required")
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirmation do not match')
      return
    }
    const policyCheck = validatePasswordAgainstPolicy(newPassword, passwordPolicy)
    if (!policyCheck.valid) {
      toast.error(policyCheck.message || 'Password does not meet policy')
      return
    }
    onSubmit({ oldPassword, newPassword, confirmNewPassword })
  }

  if (!open) return null

  const title =
    mode === 'set' ? 'Set Password' : mode === 'reset' ? 'Reset Password' : 'Update Password'

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

  const oldPasswordLabel = mode === 'update' ? 'Enter Old Password' : "User's Current Password"
  const newPasswordLabel = 'Enter New Password'
  const confirmPasswordLabel = 'Confirm New Password'

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
        className="ui-modal-shell update-password-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="update-password-modal-title" className="update-password-title">
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

        <div className="ui-modal-body update-password-body">
          {userName && mode !== 'update' ? (
            <p className="update-password-desc">
              {mode === 'set' ? 'Set a password for' : 'Reset password for'} <span>{userName}</span>
              .
            </p>
          ) : null}

          <div className="update-password-fields">
            {requireOldPassword ? (
              <div className="update-password-field">
                <label className="update-password-label" htmlFor="old-password">
                  {oldPasswordLabel} <RequiredMark />
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  placeholder="Enter here.."
                  autoComplete="current-password"
                  className="update-password-input"
                />
              </div>
            ) : null}

            <div className="update-password-field">
              <label className="update-password-label" htmlFor="new-password">
                {newPasswordLabel} <RequiredMark />
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="new-password"
                className="update-password-input"
              />
            </div>

            <div className="update-password-field">
              <label className="update-password-label" htmlFor="confirm-new-password">
                {confirmPasswordLabel} <RequiredMark />
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="new-password"
                className="update-password-input"
              />
            </div>
          </div>

          <div className="update-password-rules">
            <p className="update-password-rules-title">Password Format &amp; Rules</p>
            <ul className="update-password-rules-list">
              {passwordRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ui-modal-footer update-password-footer">
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
            className="ui-modal-btn update-password-submit"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
