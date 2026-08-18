import { GitMerge, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type MergeTicketItem = {
  id?: string
  user: string
  issue: string
  time: string
}

type MergeTicketsModalProps = {
  open: boolean
  onClose: () => void
  tickets?: MergeTicketItem[]
  onSubmit?: (notes: string) => void | Promise<void>
}

const fallbackTickets: MergeTicketItem[] = [
  { user: 'Sara Johnson', issue: 'Payment Issue', time: '21 Jan 2024, 11:53 AM' },
  { user: 'Sara Johnson', issue: 'Payment Issue', time: '21 Jan 2024, 10:12 AM' },
]

export function MergeTicketsModal({ open, onClose, tickets, onSubmit }: MergeTicketsModalProps) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const mergeTickets = tickets?.length ? tickets : fallbackTickets

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="ui-modal-shell">
        <div className="ui-modal-header">
          <h2 className="text-h2 text-brand-text">Merge Tickets</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-6 text-center">
          <div className="bg-brand-accent/10 text-brand-accent mx-auto grid size-14 place-items-center rounded-full">
            <GitMerge className="icon-lg" />
          </div>
          <p className="text-body-md text-muted">
            You are merging {mergeTickets.length} tickets of &apos;
            {mergeTickets[0]?.user ?? 'user'}&apos; regarding &apos;
            {mergeTickets[0]?.issue ?? 'issue'}&apos;
          </p>

          <div className="space-y-0 text-left">
            {mergeTickets.map((ticket, index) => (
              <div key={ticket.id ?? index} className="relative flex gap-4">
                {index < mergeTickets.length - 1 ? (
                  <div className="absolute top-8 left-[11px] h-full w-px bg-white/10" />
                ) : null}
                <div className="border-brand-accent/40 bg-brand-accent/10 relative z-10 mt-1 size-6 shrink-0 rounded-full border" />
                <div className="pb-6">
                  <p className="text-body-md-semibold text-brand-text">{ticket.user}</p>
                  <p className="text-body-sm text-muted">{ticket.issue}</p>
                  <p className="text-body-sm text-muted mt-1">{ticket.time}</p>
                </div>
              </div>
            ))}
          </div>

          <label className="block space-y-2 text-left">
            <span className="text-body-sm-medium text-brand-text">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter here"
              className="ui-textarea"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={async () => {
              try {
                setSubmitting(true)
                if (onSubmit) {
                  await onSubmit(notes)
                } else {
                  toast.success('Tickets merged (static preview)')
                }
                onClose()
              } catch {
                // Parent handles toast
              } finally {
                setSubmitting(false)
              }
            }}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Merge Tickets
          </button>
        </div>
      </div>
    </div>
  )
}
