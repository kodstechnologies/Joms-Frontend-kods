import { GitMerge, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'
import { SupportAvatar } from './support-avatar'

type MergeTicketItem = {
  id?: string
  user: string
  issue: string
  time: string
  avatarUrl?: string | null
  isPrimary?: boolean
}

type MergeTicketsModalProps = {
  open: boolean
  onClose: () => void
  tickets?: MergeTicketItem[]
  onSubmit?: (notes: string) => void | Promise<void>
}

export function MergeTicketsModal({
  open,
  onClose,
  tickets = [],
  onSubmit,
}: MergeTicketsModalProps) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const mergeTickets = tickets

  useEffect(() => {
    if (!open) {
      setNotes('')
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  const primary = mergeTickets.find((ticket) => ticket.isPrimary) || mergeTickets[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-tickets-title"
        className="ui-modal-shell w-full max-w-[551px] !bg-[#141414]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="merge-tickets-title" className="text-h2 text-brand-text">
            Merge Tickets
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#B7540F1A]">
              <GitMerge className="size-6 text-[#E8A06A]" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <p className="text-body-md mx-auto max-w-[420px] text-[#FFFFFF80]">
              You are merging {mergeTickets.length || 2} tickets of &apos;
              {primary?.user || 'user'}&apos; regarding &apos;{primary?.issue || 'issue'}&apos;
            </p>
          </div>

          <div className="space-y-0">
            {mergeTickets.map((ticket, index) => {
              const showConnector = index < mergeTickets.length - 1
              return (
                <div key={ticket.id ?? index} className="relative flex gap-3">
                  {showConnector ? (
                    <>
                      <div className="absolute top-10 left-5 h-[calc(100%-1.25rem)] w-px bg-white/15" />
                      <div className="absolute top-[calc(50%+0.5rem)] left-[11px] z-20 grid size-5 place-items-center rounded-full bg-[#141414]">
                        <GitMerge
                          className="size-3.5 text-[#E8A06A]"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </div>
                    </>
                  ) : null}

                  <SupportAvatar
                    name={ticket.user}
                    src={ticket.avatarUrl}
                    sizeClassName="relative z-10 size-10"
                    fallback="icon"
                  />

                  <div
                    className={cn(
                      'flex min-w-0 flex-1 items-start justify-between gap-3',
                      showConnector ? 'pb-8' : 'pb-1',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-body-md-semibold truncate text-white">{ticket.user}</p>
                      <p className="text-body-sm mt-0.5 text-[#FFFFFF80]">{ticket.issue}</p>
                    </div>
                    <p className="text-body-sm shrink-0 whitespace-nowrap text-[#FFFFFF80]">
                      {ticket.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <label className="block space-y-2 text-left">
            <span className="text-body-sm-medium text-white">
              Admin notes <span className="text-[#FF453A]">*</span>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add admin notes"
              className="ui-textarea min-h-[120px] w-full resize-none rounded-[10px] border border-white/15 bg-[#050505] px-3 py-3 text-white placeholder:text-white/40 focus:border-[#3B82F6] focus:outline-none"
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
              if (!notes.trim()) {
                toast.error('Admin notes are required.')
                return
              }
              try {
                setSubmitting(true)
                if (onSubmit) {
                  await onSubmit(notes.trim())
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
            {submitting ? 'Merging…' : 'Merge Tickets'}
          </button>
        </div>
      </div>
    </div>
  )
}
