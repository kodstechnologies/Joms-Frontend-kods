import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

const REASON_OPTIONS = [
  { label: '[Reason]', value: 'reason-1' },
  { label: '[Reason]', value: 'reason-2' },
  { label: '[Reason]', value: 'reason-3' },
  { label: '[Reason]', value: 'reason-4' },
] as const

export type DeleteCategoryModalPayload = {
  reasons: string[]
  adminNotes: string
}

type DeleteCategoryModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (payload: DeleteCategoryModalPayload) => void
  isSubmitting?: boolean
}

export function DeleteCategoryModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: DeleteCategoryModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['reason-1', 'reason-2'])
  const [confirmed, setConfirmed] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = () => {
    setSelectedReasons(['reason-1', 'reason-2'])
    setConfirmed(false)
    setAdminNotes('')
    onClose()
  }

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const canSubmit = confirmed && adminNotes.trim().length > 0 && selectedReasons.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050505]/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-category-modal-title"
        className="ui-modal-shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="delete-category-modal-title" className="text-h2 text-brand-text">
            Delete Category
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
          <div className="flex flex-col items-center text-center">
            <span className="bg-brand-danger/20 mb-3 flex size-12 items-center justify-center rounded-full">
              <Trash2 className="icon-md text-brand-danger" aria-hidden="true" />
            </span>

            <p className="text-body-md-semibold text-brand-text">
              Are you sure you want Delete this Category?
            </p>
            <p className="text-body-sm text-muted mt-1.5">
              This will result in removing this category from the App.
            </p>
          </div>

          <div>
            <span className="text-body-sm-medium text-muted mb-[10px] block">Reasons</span>
            <div className="flex flex-wrap gap-[10px]">
              {REASON_OPTIONS.map((option) => {
                const isSelected = selectedReasons.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleReason(option.value)}
                    className={cn(
                      'ui-modal-reason-chip',
                      isSelected ? 'ui-modal-reason-chip-selected' : 'ui-modal-reason-chip-idle',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="text-body-md text-brand-text flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-[15px] shrink-0 accent-white"
            />
            <span>I confirm the documents are not approved due to above reasons.</span>
          </label>

          <label className="block">
            <span className="text-body-sm-medium text-brand-text mb-2 block">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              className="ui-textarea min-h-[72px]"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={handleClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() =>
              onConfirm({
                reasons: selectedReasons,
                adminNotes: adminNotes.trim(),
              })
            }
            className="ui-modal-btn ui-modal-btn-negative"
          >
            Disable Role
          </button>
        </div>
      </div>
    </div>
  )
}
