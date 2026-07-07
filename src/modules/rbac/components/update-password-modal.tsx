import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

const PASSWORD_RULES = [
  'Password must be at least 6 characters long.',
  'New password must be different from the current password.',
]

type UpdatePasswordModalProps = {
  open: boolean
  userName?: string
  isSubmitting?: boolean
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
  onClose,
  onSubmit,
}: UpdatePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const resetForm = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    onSubmit({ oldPassword, newPassword, confirmNewPassword })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 text-brand-text"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-password-modal-title"
        className="flex max-h-[90vh] w-full max-w-[470px] flex-col overflow-hidden rounded-brand-md border border-white/10 bg-brand-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="update-password-modal-title" className="text-[18px] font-semibold text-brand-text">
            Update Password
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleClose}
            className="rounded-full p-1 text-brand-text transition-colors hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {userName ? (
            <p className="mb-5 text-sm text-brand-muted">
              Reset password for <span className="font-medium text-brand-text">{userName}</span>.
              Enter your super admin password to confirm this action.
            </p>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text" htmlFor="old-password">
                Enter Old Password<span className="text-brand-danger">*</span>
              </label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text" htmlFor="new-password">
                Enter New Password<span className="text-brand-danger">*</span>
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text" htmlFor="confirm-new-password">
                Confirm New Password<span className="text-brand-danger">*</span>
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="Enter here.."
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-5 rounded-brand-md border border-white/10 bg-brand-bg px-4 py-3">
            <p className="text-sm font-semibold text-brand-text">Password Format &amp; Rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-brand-muted">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(isSubmitting && 'opacity-70')}
          >
            {isSubmitting ? 'Updating...' : 'Change Password'}
          </Button>
        </div>
      </div>
    </div>
  )
}
