import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

type AdminNotesModalProps = {
  open: boolean
  initialNotes?: string
  onClose: () => void
  onSubmit: (notes: string) => void
}

function AdminNotesModalContent({
  initialNotes,
  onClose,
  onSubmit,
}: {
  initialNotes: string
  onClose: () => void
  onSubmit: (notes: string) => void
}) {
  const [notes, setNotes] = useState(initialNotes)

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell w-full max-w-[520px]">
        <div className="ui-modal-header">
          <h2 className="text-h4 text-brand-text">Add Admin Notes</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-2">
          <label className="text-body-md-medium text-brand-text block">Admin Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Text here"
            rows={5}
            className="ui-textarea placeholder:text-muted"
          />
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const next = notes.trim()
              if (!next) return
              onSubmit(next)
              setNotes('')
            }}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function AdminNotesModal({
  open,
  initialNotes = '',
  onClose,
  onSubmit,
}: AdminNotesModalProps) {
  if (!open) return null

  return (
    <AdminNotesModalContent
      key={initialNotes || 'empty'}
      initialNotes={initialNotes}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
