import { Clock, Send } from 'lucide-react'
import { useState } from 'react'

import type { ChatMessage } from '../types/support'
import { cn } from '@/shared/lib/cn'

type TicketMessagesPanelProps = {
  title: string
  ticketId: string
  createdAt: string
  dueIn: string
  messages: ChatMessage[]
  assignedTo: string
}

export function TicketMessagesPanel({
  title,
  ticketId,
  createdAt,
  dueIn,
  messages,
  assignedTo,
}: TicketMessagesPanelProps) {
  const [draft, setDraft] = useState('')

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">
            #{ticketId} | Created: {createdAt}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Clock className="size-3.5" />
          {dueIn} Due in
        </span>
      </div>

      <p className="my-4 text-center text-xs text-slate-500">Ticket Assigned To {assignedTo}</p>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'agent' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className="size-8 shrink-0 rounded-full bg-slate-700" />
            <div
              className={cn(
                'max-w-[80%] space-y-1',
                msg.role === 'agent' ? 'text-right' : 'text-left',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{msg.sender}</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                    msg.role === 'user'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-blue-500/20 text-blue-300',
                  )}
                >
                  {msg.role}
                </span>
                {msg.online ? <span className="text-[10px] text-emerald-400">Online</span> : null}
              </div>
              <div className="rounded-xl border border-white/5 bg-[#1a1a1a] px-4 py-3 text-sm text-slate-300">
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-500">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <p className="mb-2 text-xs text-slate-500">{assignedTo} Typing...</p>
        <div className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Start Typing..."
            className="h-11 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:ring-white/20 focus:outline-none"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-amber-400 hover:text-amber-300"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
