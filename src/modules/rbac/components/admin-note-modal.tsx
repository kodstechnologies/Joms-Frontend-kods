import { X } from 'lucide-react'

type AdminNoteModalProps = {
  open: boolean
  note?: string
  onClose: () => void
}

export function AdminNoteModal({ open, note, onClose }: AdminNoteModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-note-modal-title"
        className="ui-modal-shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="admin-note-modal-title" className="text-h2 text-brand-text">
            Admin Note
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body">
          <label className="block">
            <span className="text-body-sm-medium text-brand-text mb-2 block">
              Notes <span className="text-brand-danger">*</span>
            </span>
            <textarea readOnly value={note || ''} className="ui-textarea min-h-[180px]" />
          </label>
        </div>
      </div>
    </div>
  )
}
