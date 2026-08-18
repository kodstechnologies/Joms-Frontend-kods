import { Clock, Send } from 'lucide-react'
import { useState } from 'react'

import type { ChatMessage } from '../types/support'
import { SupportAvatar } from './support-avatar'
import { cn } from '@/shared/lib/cn'

type TicketMessagesPanelProps = {
  title: string
  ticketId: string
  createdAt: string
  dueIn: string
  messages: ChatMessage[]
  assignedTo: string
  onSend?: (content: string) => void | Promise<void>
  isSending?: boolean
  isLoading?: boolean
}

export function TicketMessagesPanel({
  title,
  ticketId,
  createdAt,
  dueIn,
  messages,
  assignedTo,
  onSend,
  isSending = false,
  isLoading = false,
}: TicketMessagesPanelProps) {
  const [draft, setDraft] = useState('')

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !onSend || isSending) return
    await onSend(content)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
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

      <p className="text-body-sm text-muted my-4 shrink-0 text-center">
        Ticket Assigned To {assignedTo}
      </p>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
        {isLoading ? (
          <p className="text-body-sm text-muted py-8 text-center">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-body-sm text-muted py-8 text-center">
            No messages for #{ticketId} yet.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'agent' ? 'flex-row-reverse' : 'flex-row')}
            >
              <SupportAvatar name={msg.sender} src={msg.senderAvatarUrl} sizeClassName="size-8" />
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
                  {msg.content &&
                  msg.content !== '[Image]' &&
                  msg.content !== '[Attachment]' &&
                  !msg.attachments?.some((file) => file.name && file.name === msg.content)
                    ? msg.content
                    : null}
                  {msg.attachments?.map((file) => {
                    const isImage =
                      String(file.mimeType || '').startsWith('image/') ||
                      /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(
                        String(file.name || file.url || ''),
                      )
                    return (
                      <a key={file.url} href={file.url} target="_blank" rel="noreferrer">
                        {isImage ? (
                          <img
                            src={file.url}
                            alt={file.name || 'Attachment'}
                            className="mt-2 max-h-48 rounded-md"
                          />
                        ) : (
                          <span className="text-brand-accent mt-2 inline-block underline">
                            {file.name || 'Download file'}
                          </span>
                        )}
                      </a>
                    )
                  })}
                </div>
                <span className="text-body-sm text-muted">{msg.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 shrink-0 border-t border-white/5 pt-4">
        <div className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleSend()
              }
            }}
            placeholder="Start Typing..."
            className="ui-input h-11 w-full rounded-xl pr-12"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            className="text-brand-accent hover:text-brand-gold-from absolute top-1/2 right-3 -translate-y-1/2"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
