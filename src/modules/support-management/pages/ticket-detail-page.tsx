import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { SupportAvatar } from '../components/support-avatar'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import {
  useLiveSupportUpdates,
  useReopenSupportTicket,
  useResolveSupportTicket,
  useSupportTicket,
} from '../hooks/use-support'
import {
  formatTicketDateTime,
  getApiErrorMessage,
  getPriorityLabel,
  getStatusLabel,
} from '../utils/support-format'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { DetailViewSkeleton } from '@/shared/components/ui/skeleton'

const CONTAINER = 'bg-[#141414]'
const TITLE_CLASS = 'text-brand-text text-[16px] leading-6 font-semibold'

function displayDate(value?: string | null) {
  const formatted = formatTicketDateTime(value)
  if (formatted && formatted !== '—') {
    return formatted.replace(/\s\d{2}:\d{2}$/, '')
  }
  return value?.trim() || '—'
}

export function TicketDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useSupportTicket(id)
  useLiveSupportUpdates()
  const reopenMutation = useReopenSupportTicket()
  const resolveMutation = useResolveSupportTicket()

  const ticket = data?.data?.ticket
  const messages = data?.data?.messages ?? []

  if (isLoading && !ticket) {
    return <DetailViewSkeleton pillCount={8} cardCount={2} />
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <p className="text-body-md text-muted">Ticket not found.</p>
      </div>
    )
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/support/tickets')}
          className="text-muted hover:text-brand-text mt-1 grid size-6 shrink-0 place-items-center rounded transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Ticket Management</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
            oversight.
          </p>
        </div>
      </div>

      <div className={cn('relative rounded-xl p-5 sm:p-6', CONTAINER)}>
        <div className="absolute top-5 right-5">
          {ticket.status === 'closed' ? (
            <span className="text-body-sm-semibold inline-flex h-[25px] items-center rounded-full bg-[#00A63E]/15 px-2.5 text-[#00A63E]">
              {getStatusLabel(ticket.status)}
            </span>
          ) : (
            <TicketStatusBadge status={ticket.status} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pr-28 sm:grid-cols-3 lg:grid-cols-5">
          <MetaField label="Ticket ID" value={`#${ticket.id}`} />
          <MetaField label="Subject" value={ticket.subject} />
          <MetaField label="Category" value={ticket.category} />
          <div className="min-w-0">
            <p className="text-body-sm text-muted mb-1.5">Priority</p>
            <span
              className={cn(
                'text-body-sm-semibold inline-flex h-[25px] items-center rounded-full px-2.5',
                ticket.priority === 'high' || ticket.priority === 'critical'
                  ? 'bg-[#D3191C]/20 text-white'
                  : 'bg-white/10 text-white',
              )}
            >
              {getPriorityLabel(ticket.priority)}
            </span>
          </div>
          <MetaField label="Requester" value={ticket.reporter} />
          <MetaField label="Assigned To" value={ticket.assignedTo || '—'} />
          <MetaField
            label="Created On"
            value={displayDate(ticket.createdAtIso || ticket.createdAt)}
          />
          <MetaField
            label="Assigned On"
            value={displayDate(ticket.assignedAt || ticket.createdAtIso || ticket.createdAt)}
          />
          {isClosed ? (
            <MetaField
              label="Resolved On"
              value={displayDate(ticket.resolvedAt || ticket.createdAtIso || ticket.createdAt)}
            />
          ) : null}
        </div>
      </div>

      <section>
        <h2 className={cn(TITLE_CLASS, 'mb-3')}>Description</h2>
        <div
          className={cn(
            'flex w-full max-w-[1089px] items-center overflow-visible rounded-xl px-4 py-3 text-[14px] leading-6 text-white',
            CONTAINER,
          )}
          style={{ minHeight: 50 }}
        >
          {ticket.description || '—'}
        </div>
      </section>

      <section className="space-y-4 overflow-visible border-t border-white/10 pt-5">
        <div className="flex items-center gap-3">
          <SupportAvatar
            name={ticket.reporter}
            src={ticket.reporterAvatarUrl}
            sizeClassName="size-8"
          />
          <h2 className={TITLE_CLASS}>Conversation History</h2>
        </div>

        <div className="w-full space-y-4 overflow-visible">
          {messages.length === 0 ? (
            <p className="text-body-md text-muted">No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isAgent = msg.role === 'agent'
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex w-full items-end gap-3 overflow-visible',
                    isAgent ? 'flex-row-reverse' : 'flex-row',
                  )}
                >
                  {isAgent ? (
                    <SupportAvatar
                      name={msg.sender}
                      src={msg.senderAvatarUrl}
                      sizeClassName="size-10 shrink-0"
                      fallback="icon"
                    />
                  ) : null}
                  <div
                    className={cn(
                      'min-w-0 flex-1 overflow-visible rounded-xl px-4 py-3',
                      CONTAINER,
                      isAgent ? 'max-w-[1132px]' : 'max-w-[1089px]',
                    )}
                    style={{ minHeight: isAgent ? 76 : 50 }}
                  >
                    <p className="text-body-md leading-relaxed break-words whitespace-pre-wrap text-white">
                      {msg.content &&
                      msg.content !== '[Image]' &&
                      msg.content !== '[Attachment]' &&
                      !msg.attachments?.some((file) => file.name && file.name === msg.content)
                        ? msg.content
                        : null}
                    </p>
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
                    <p
                      className={cn(
                        'text-muted mt-2 text-[11px] leading-4',
                        isAgent ? 'text-left' : 'text-right',
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      <section>
        <h2 className={cn(TITLE_CLASS, 'mb-3')}>Resolution</h2>
        <div
          className={cn(
            'flex w-full max-w-[1089px] items-center overflow-visible rounded-xl px-4 py-3 text-[14px] leading-6 text-white',
            CONTAINER,
          )}
          style={{ minHeight: 50 }}
        >
          {ticket.resolution || ticket.comments || '—'}
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-white/10 pt-5">
        <button
          type="button"
          disabled={
            resolveMutation.isPending || ticket.status === 'resolved' || ticket.status === 'closed'
          }
          onClick={async () => {
            try {
              await resolveMutation.mutateAsync({
                id: ticket.id,
                payload: { resolution: ticket.resolution || ticket.comments },
              })
              toast.success('Ticket closed')
            } catch (err) {
              toast.error(getApiErrorMessage(err, 'Failed to close ticket'))
            }
          }}
          className="ui-cta ui-cta-ghost"
        >
          Close
        </button>
        <button
          type="button"
          disabled={reopenMutation.isPending}
          onClick={async () => {
            try {
              await reopenMutation.mutateAsync(ticket.id)
              toast.success('Ticket reopened')
            } catch (err) {
              toast.error(getApiErrorMessage(err, 'Failed to reopen ticket'))
            }
          }}
          className="ui-cta ui-cta-primary"
        >
          Reopen
        </button>
      </div>
    </div>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-body-sm text-muted mb-1.5">{label}</p>
      <p className="text-body-sm-semibold text-brand-text truncate">{value}</p>
    </div>
  )
}
