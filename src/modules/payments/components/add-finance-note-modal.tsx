import { SquarePen, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

type AddFinanceNoteModalProps = {
  open: boolean
  title?: string
  description?: string
  noteLabel?: string
  placeholder?: string
  submitLabel?: string
  submittingLabel?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (adminNote: string) => void
}

export function AddFinanceNoteModal(props: AddFinanceNoteModalProps) {
  if (!props.open) return null
  return <AddFinanceNoteModalInner {...props} />
}

function AddFinanceNoteModalInner({
  title = 'Add Internal Note',
  description = 'This note is stored for admin review and audit history.',
  noteLabel = 'Admin Note',
  placeholder = 'Enter internal note',
  submitLabel = 'Save Note',
  submittingLabel = 'Saving...',
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddFinanceNoteModalProps) {
  const [adminNote, setAdminNote] = useState('')

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose])

  const handleSubmit = () => {
    const note = adminNote.trim()
    if (!note) {
      toast.error('Admin note is required')
      return
    }
    onSubmit(note)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-finance-note-title"
        className="ui-modal-shell w-full max-w-[520px] p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div className="flex items-start gap-3">
            <div className="bg-brand-accent/15 text-brand-accent grid size-10 place-items-center rounded-full">
              <SquarePen className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="add-finance-note-title" className="text-h3 text-brand-text tracking-tight">
                {title}
              </h2>
              <p className="text-body-sm text-muted mt-1">{description}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="text-muted hover:text-brand-text grid size-8 place-items-center rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">
              {noteLabel} <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder={placeholder}
              rows={4}
              className="ui-textarea min-h-[120px]"
              autoFocus
            />
          </label>
        </div>

        <div className="ui-modal-footer flex-col sm:flex-row">
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
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
