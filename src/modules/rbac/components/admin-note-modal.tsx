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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 text-brand-text"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-note-modal-title"
        className="flex max-h-[90vh] w-full max-w-[470px] flex-col overflow-hidden rounded-brand-md border border-white/10 bg-brand-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="admin-note-modal-title" className="text-[18px] font-semibold text-brand-text">
            Admin Note
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1 text-brand-text transition-colors hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-brand-text">
              Notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              readOnly
              value={note || ''}
              className="h-[180px] w-full resize-none rounded-brand-md border border-transparent bg-brand-bg px-4 py-3 text-sm leading-6 text-brand-text outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
