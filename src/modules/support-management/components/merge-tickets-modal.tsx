import { GitMerge, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

type MergeTicketsModalProps = {
  open: boolean
  onClose: () => void
}

const mergeTickets = [
  { user: 'Sara Johnson', issue: 'Payment Issue', time: '21 Jan 2024, 11:53 AM' },
  { user: 'Sara Johnson', issue: 'Payment Issue', time: '21 Jan 2024, 10:12 AM' },
]

export function MergeTicketsModal({ open, onClose }: MergeTicketsModalProps) {
  const [notes, setNotes] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">Merge Tickets</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-500/10 text-amber-400">
            <GitMerge className="size-6" />
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            You are merging 2 tickets of &apos;Sara Johnson&apos; regarding &apos;Payment Issue&apos;
          </p>

          <div className="space-y-0 text-left">
            {mergeTickets.map((ticket, index) => (
              <div key={index} className="relative flex gap-4">
                {index < mergeTickets.length - 1 ? (
                  <div className="absolute left-[11px] top-8 h-full w-px bg-white/10" />
                ) : null}
                <div className="relative z-10 mt-1 size-6 shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10" />
                <div className="pb-6">
                  <p className="text-sm font-semibold text-white">{ticket.user}</p>
                  <p className="text-xs text-slate-400">{ticket.issue}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{ticket.time}</p>
                </div>
              </div>
            ))}
          </div>

          <label className="block space-y-2.5 text-left">
            <span className="text-sm font-medium text-white">Admin notes *</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter here"
              className="h-28 w-full resize-none rounded-lg border-0 bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-transparent px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            Cancel
          </button>
          <Button
            onClick={() => {
              toast.success('Tickets merged (static preview)')
              onClose()
            }}
          >
            Merge Tickets
          </Button>
        </div>
      </div>
    </div>
  )
}
