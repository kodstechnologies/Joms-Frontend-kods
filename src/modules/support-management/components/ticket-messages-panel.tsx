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
          <h2 className="text-h3 text-brand-text">{title}</h2>
          <p className="text-body-sm text-muted mt-1">
            #{ticketId} | Created: {createdAt}
          </p>
        </div>
        <span className="text-body-sm-semibold border-brand-accent/30 bg-brand-accent/10 text-brand-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
          <Clock className="size-3.5" />
          {dueIn} Due in
        </span>
      </div>

      <p className="text-body-sm text-muted my-4 text-center">Ticket Assigned To {assignedTo}</p>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'agent' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className="size-8 shrink-0 rounded-full bg-white/10" />
            <div
              className={cn(
                'max-w-[80%] space-y-1',
                msg.role === 'agent' ? 'text-right' : 'text-left',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-body-sm-semibold text-brand-text">{msg.sender}</span>
                <span
                  className={cn(
                    'text-body-sm-semibold rounded px-1.5 py-0.5 uppercase',
                    msg.role === 'user'
                      ? 'bg-brand-positive/20 text-brand-positive'
                      : 'bg-brand-action/20 text-brand-action',
                  )}
                >
                  {msg.role}
                </span>
                {msg.online ? (
                  <span className="text-body-sm text-brand-positive">Online</span>
                ) : null}
              </div>
              <div className="radius-lg bg-brand-surface text-body-md text-brand-text/80 border border-white/5 px-4 py-3">
                {msg.content}
              </div>
              <span className="text-body-sm text-muted">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <p className="text-body-sm text-muted mb-2">{assignedTo} Typing...</p>
        <div className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Start Typing..."
            className="ui-input h-11 w-full rounded-xl pr-12"
          />
          <button
            type="button"
            className="text-brand-accent hover:text-brand-gold-from absolute top-1/2 right-3 -translate-y-1/2"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
