import { GitMerge, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

type TicketItem = {
  id: string
  title: string
  description?: string
  date?: string
}

type MergeTicketsModalProps = {
  isOpen: boolean
  onClose: () => void
  onMerge: (payload: { ticketIds: string[]; adminNotes: string }) => void | Promise<void>
  availableTickets?: TicketItem[]
  title?: string
  description?: string
}

export function MergeTicketsModal(props: MergeTicketsModalProps) {
  if (!props.isOpen) return null
  return <MergeTicketsModalInner {...props} />
}

function MergeTicketsModalInner({
  onClose,
  onMerge,
  availableTickets = [],
  title = 'Merge Tickets',
  description,
}: MergeTicketsModalProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    if (submitting) return
    onClose()
  }, [onClose, submitting])

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

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId],
    )
  }

  const handleMerge = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Select at least one ticket')
      return
    }
    setSubmitting(true)
    try {
      await onMerge({ ticketIds: selectedTickets, adminNotes: adminNotes.trim() })
      setSelectedTickets([])
      setAdminNotes('')
      onClose()
    } catch {
      // Parent surfaces API errors
    } finally {
      setSubmitting(false)
    }
  }

  const resolvedDescription =
    description ||
    (availableTickets.length
      ? `You are merging ${availableTickets.length} selected ticket(s).`
      : 'Select tickets to merge.')

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-tickets-title"
        className="ui-modal-shell w-full max-w-[520px] p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="merge-tickets-title" className="text-h2 text-brand-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close merge tickets modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="bg-brand-accent/10 text-brand-accent mx-auto grid size-14 place-items-center rounded-full">
            <GitMerge className="icon-lg" />
          </div>
          <p className="text-body-md text-muted text-center">{resolvedDescription}</p>

          <div className="space-y-2 text-left">
            <p className="text-body-sm-medium text-brand-text">Select tickets to merge</p>
            {availableTickets.length === 0 ? (
              <p className="text-body-sm text-muted">No tickets available.</p>
            ) : (
              availableTickets.map((ticket) => (
                <label
                  key={ticket.id}
                  className="flex items-start gap-3 rounded-md border border-white/10 bg-white/5 p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={() => toggleTicket(ticket.id)}
                    className="mt-1 rounded border-slate-700 bg-transparent"
                  />
                  <span>
                    <span className="text-body-sm-medium text-brand-text block">{ticket.title}</span>
                    {ticket.description ? (
                      <span className="text-body-sm text-muted mt-1 block">{ticket.description}</span>
                    ) : null}
                  </span>
                </label>
              ))
            )}
          </div>

          <label className="block space-y-2 text-left">
            <span className="text-body-sm-medium text-brand-text">Admin notes (optional)</span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Add notes about this merge"
              className="ui-textarea"
              rows={3}
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleMerge()}
            disabled={submitting || selectedTickets.length === 0}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {submitting ? 'Merging...' : 'Merge Tickets'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default MergeTicketsModal
