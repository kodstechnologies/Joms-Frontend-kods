import { useState } from 'react'
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

  return (
    <div
      className="text-brand-text fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-password-modal-title"
        className="rounded-brand-md bg-brand-surface flex max-h-[90vh] w-full max-w-[470px] flex-col overflow-hidden border border-white/10 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            id="update-password-modal-title"
            className="text-brand-text text-[18px] font-semibold"
          >
            Update Password
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleClose}
            className="text-brand-text rounded-full p-1 transition-colors hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {userName ? (
            <p className="text-brand-muted mb-5 text-sm">
              Reset password for <span className="text-brand-text font-medium">{userName}</span>.
              Enter the user&apos;s current password, then set a new one.
            </p>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium" htmlFor="old-password">
                User&apos;s Current Password<span className="text-brand-danger">*</span>
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
              <label className="text-brand-text text-sm font-medium" htmlFor="new-password">
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
              <label className="text-brand-text text-sm font-medium" htmlFor="confirm-new-password">
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

          <div className="rounded-brand-md bg-brand-bg mt-5 border border-white/10 px-4 py-3">
            <p className="text-brand-text text-sm font-semibold">Password Format &amp; Rules</p>
            <ul className="text-brand-muted mt-2 list-disc space-y-1 pl-4 text-xs">
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
