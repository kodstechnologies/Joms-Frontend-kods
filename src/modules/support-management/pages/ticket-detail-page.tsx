import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { chatMessagesMock, closedTicketMock, supportTicketsMock } from '../mock/support.mock'
import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function TicketDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const ticket =
    supportTicketsMock.find((t) => t.id === id) ??
    (id === closedTicketMock.id ? closedTicketMock : closedTicketMock)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/support/tickets')}
          className="text-muted hover:text-brand-text mt-1 rounded-lg border border-white/10 p-2"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-h2 text-brand-text font-semibold tracking-tight">
            Ticket Management
          </h1>
          <p className="text-body-md text-muted mt-1">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
            oversight.
          </p>
        </div>
      </div>

      <div className="radius-lg bg-brand-surface border border-white/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-body-sm text-muted">Ticket ID</p>
            <p className="text-body-lg text-brand-accent font-mono font-semibold">#{ticket.id}</p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Subject" value={ticket.subject} />
          <DetailField label="Category" value={ticket.category} />
          <div>
            <p className="text-body-sm text-muted">Priority</p>
            <div className="mt-1">
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </div>
          <DetailField label="Requester" value={ticket.reporter} />
          <DetailField label="Assigned To" value={ticket.assignedTo} />
          <DetailField label="Created On" value={ticket.createdAt} />
          <DetailField label="Assigned On" value={ticket.createdAt} />
          {ticket.status === 'closed' ? (
            <DetailField label="Resolved On" value={ticket.createdAt} />
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-body-md-semibold text-brand-text">Description</h2>
        <div className="radius-lg bg-brand-surface text-body-md text-brand-text/80 border border-white/10 p-4">
          {ticket.description ?? 'No description provided.'}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-body-md-semibold text-brand-text">Conversation History</h2>
        <div className="radius-lg bg-brand-surface space-y-4 border border-white/10 p-5">
          {chatMessagesMock.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'agent' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className="size-8 shrink-0 rounded-full bg-white/10" />
              <div className={`max-w-[75%] ${msg.role === 'agent' ? 'text-right' : 'text-left'}`}>
                <div className="radius-lg bg-brand-surface text-body-md text-brand-text/80 border border-white/5 px-4 py-3">
                  {msg.content}
                </div>
                <span className="text-body-sm text-muted mt-1 block">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {ticket.resolution ? (
        <section className="space-y-3">
          <h2 className="text-body-md-semibold text-brand-text">Resolution</h2>
          <div className="radius-lg bg-brand-surface text-body-md text-brand-text/80 border border-white/10 p-4">
            {ticket.resolution}
          </div>
        </section>
      ) : null}

      <div className="flex justify-between border-t border-white/10 pt-6">
        <Button variant="secondary" onClick={() => toast.message('Close coming soon')}>
          Close
        </Button>
        <Button onClick={() => toast.success('Ticket reopened (static preview)')}>Reopen</Button>
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-body-sm text-muted">{label}</p>
      <p className="text-body-md text-brand-text mt-1">{value}</p>
    </div>
  )
}
