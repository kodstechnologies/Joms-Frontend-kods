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
      className="text-brand-text fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-note-modal-title"
        className="rounded-brand-md bg-brand-surface flex max-h-[90vh] w-full max-w-[470px] flex-col overflow-hidden border border-white/10 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="admin-note-modal-title" className="text-brand-text text-[18px] font-semibold">
            Admin Note
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-text rounded-full p-1 transition-colors hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <label className="block">
            <span className="text-brand-text mb-2 block text-sm font-medium">
              Notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              readOnly
              value={note || ''}
              className="rounded-brand-md bg-brand-bg text-brand-text h-[180px] w-full resize-none border border-transparent px-4 py-3 text-sm leading-6 outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
