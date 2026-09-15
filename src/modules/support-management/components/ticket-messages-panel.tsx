import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

import type { ChatMessage } from '../types/support'
import { SupportAvatar } from './support-avatar'
import { TicketDueStatusBadge } from './ticket-due-status-badge'
import { cn } from '@/shared/lib/cn'
import {
  InPageMediaViewer,
  type InPageMediaItem,
} from '@/shared/components/media/in-page-media-viewer'

type TicketMessagesPanelProps = {
  title: string
  ticketId: string
  createdAt: string
  dueIn: string
  status?: string | null
  messages: ChatMessage[]
  assignedTo: string
  onSend?: (content: string) => void | Promise<void>
  isSending?: boolean
  isLoading?: boolean
  active?: boolean
}

export function TicketMessagesPanel({
  title,
  ticketId,
  createdAt,
  dueIn,
  status,
  messages,
  assignedTo,
  onSend,
  isSending = false,
  isLoading = false,
  active = true,
}: TicketMessagesPanelProps) {
  const [draft, setDraft] = useState('')
  const [mediaIndex, setMediaIndex] = useState<number | null>(null)
  const [mediaItems, setMediaItems] = useState<InPageMediaItem[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || isLoading || !messages.length) return
    const frame = window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [active, isLoading, messages, ticketId])

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !onSend || isSending) return
    await onSend(content)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-brand-text text-[20px] leading-[28px] font-semibold">{title}</h2>
          <p className="text-muted mt-1 text-[11px] leading-4">
            #{ticketId} | Created: {createdAt}
          </p>
        </div>
        <TicketDueStatusBadge dueIn={dueIn} status={status} />
      </div>

      <p className="text-body-xs text-muted my-3 shrink-0 text-center leading-5">
        Ticket Assigned To {assignedTo}
      </p>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1">
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
              <SupportAvatar
                name={msg.sender}
                src={msg.senderAvatarUrl}
                sizeClassName="size-[50px] shrink-0"
              />
              <div
                className={cn(
                  'max-w-[399px] space-y-1',
                  msg.role === 'agent' ? 'text-right' : 'text-left',
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-2',
                    msg.role === 'agent' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <span className="text-body-sm text-brand-text font-semibold">{msg.sender}</span>
                  <span
                    className={cn(
                      'inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-semibold uppercase',
                      msg.role === 'user'
                        ? 'bg-brand-positive/20 text-brand-positive'
                        : 'bg-brand-action/20 text-brand-action',
                    )}
                  >
                    {msg.role}
                  </span>
                  {msg.online ? (
                    <span className="text-body-xs text-brand-positive">Online</span>
                  ) : null}
                </div>
                <div className="text-body-sm text-brand-text/90 rounded-lg border border-white/[0.06] bg-[#050505] px-4 py-3">
                  {msg.content &&
                  msg.content !== '[Image]' &&
                  msg.content !== '[Attachment]' &&
                  !msg.attachments?.some((file) => file.name && file.name === msg.content)
                    ? msg.content
                    : null}
                  {msg.attachments?.map((file, fileIndex) => {
                    const isImage =
                      String(file.mimeType || '').startsWith('image/') ||
                      /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(
                        String(file.name || file.url || ''),
                      )
                    const openAttachment = () => {
                      const items = (msg.attachments || []).map((attachment) => ({
                        url: attachment.url,
                        title: attachment.name || 'Attachment',
                        mimeType: attachment.mimeType,
                      }))
                      setMediaItems(items)
                      setMediaIndex(fileIndex)
                    }
                    return (
                      <button
                        key={file.url}
                        type="button"
                        onClick={openAttachment}
                        className="block text-left"
                      >
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
                      </button>
                    )
                  })}
                </div>
                <span className="text-body-xs text-muted">{msg.time}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 shrink-0 border-t border-white/[0.06] pt-4">
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
            className="text-brand-text placeholder:text-muted h-[47px] w-full rounded-xl border border-white/[0.08] bg-[#050505] pr-14 pl-4 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center text-white hover:text-white/80"
          >
            <Send className="size-6" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <InPageMediaViewer
        open={mediaIndex != null}
        items={mediaItems}
        index={mediaIndex ?? 0}
        onClose={() => setMediaIndex(null)}
        onIndexChange={setMediaIndex}
      />
    </div>
  )
}
