import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { chatMessagesMock, closedTicketMock, supportTicketsMock } from '../mock/support.mock'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function TicketDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const ticket =
    supportTicketsMock.find((t) => t.id === id) ??
    (id === closedTicketMock.id ? closedTicketMock : closedTicketMock)

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
            oversight.
          </p>
        </div>
      </div>

      {/* Ticket info card */}
      <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
        {/* Top row: ID + status */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-muted">Ticket ID</span>
            <span className="text-body-md-semibold text-brand-accent font-mono">#{ticket.id}</span>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        {/* Detail pills row */}
        <div className="flex flex-wrap gap-3">
          <InfoPill label="Subject" value={ticket.subject} width={203} />
          <InfoPill label="Category" value={ticket.category} width={67} />
          <InfoPill
            label="Priority"
            value={<TicketPriorityBadge priority={ticket.priority} />}
            width={70}
          />
          <InfoPill label="Requester" value={ticket.reporter} width={108} />
          <InfoPill label="Assigned To" value={ticket.assignedTo ?? '—'} width={196} />
          <InfoPill label="Created On" value={ticket.createdAt} width={126} />
          <InfoPill label="Assigned On" value={ticket.createdAt} width={126} />
          {ticket.status === 'closed' && (
            <InfoPill label="Resolved On" value={ticket.createdAt} width={126} />
          )}
        </div>

        {/* Description */}
        {ticket.description ? (
          <div className="mt-5">
            <p className="text-body-sm text-muted mb-2">Description</p>
            <p className="text-body-md text-brand-text/80 leading-relaxed">{ticket.description}</p>
          </div>
        ) : null}
      </div>

      {/* Conversation History */}
      <section className="space-y-3">
        <h2 className="text-body-md-semibold text-brand-text">Conversation History</h2>
        <div className="radius-lg bg-brand-surface space-y-4 border border-white/[0.06] p-5">
          {chatMessagesMock.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'agent' ? 'flex-row-reverse' : 'flex-row')}
            >
              {/* Avatar */}
              <div className="size-[50px] shrink-0 rounded-full bg-white/10" />
              <div
                className={cn(
                  'flex min-w-0 flex-1 flex-col gap-1',
                  msg.role === 'agent' ? 'items-end' : 'items-start',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-body-sm-semibold text-brand-text">{msg.sender}</span>
                  <span
                    className={cn(
                      'text-body-sm-semibold inline-flex h-5 items-center rounded px-2 uppercase',
                      msg.role === 'user'
                        ? 'bg-brand-positive/15 text-brand-positive'
                        : 'bg-brand-action/15 text-brand-action',
                    )}
                  >
                    {msg.role}
                  </span>
                </div>
                <div className="radius-lg bg-brand-bg text-body-md text-brand-text/80 w-full border border-white/[0.06] px-4 py-3">
                  {msg.content}
                </div>
                <span className="text-body-sm text-muted">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resolution */}
      {ticket.resolution ? (
        <section className="space-y-3">
          <h2 className="text-body-md-semibold text-brand-text">Resolution</h2>
          <div className="radius-lg bg-brand-surface text-body-md text-brand-text/80 border border-white/[0.06] p-4 leading-relaxed">
            {ticket.resolution}
          </div>
        </section>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
        <button
          type="button"
          onClick={() => toast.message('Close coming soon')}
          className="ui-cta ui-cta-ghost"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => toast.success('Ticket reopened (static preview)')}
          className="ui-cta ui-cta-primary"
        >
          Reopen
        </button>
      </div>
    </div>
  )
}

function InfoPill({
  label,
  value,
  width,
}: {
  label: string
  value: React.ReactNode
  width?: number
}) {
  return (
    <div
      className="radius-md bg-brand-bg flex min-h-[44px] flex-col justify-center gap-0.5 border border-white/[0.06] px-3 py-2"
      style={{ width: width ? `${width}px` : undefined }}
    >
      <span className="text-body-sm text-muted leading-[18px]">{label}</span>
      {typeof value === 'string' ? (
        <span className="text-body-sm-medium text-brand-text leading-[18px]">{value}</span>
      ) : (
        <div className="mt-0.5">{value}</div>
      )}
    </div>
  )
}
