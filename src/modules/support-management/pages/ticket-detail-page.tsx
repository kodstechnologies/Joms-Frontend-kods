import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { chatMessagesMock, closedTicketMock, supportTicketsMock } from '../mock/support.mock'
import { Button } from '@/shared/components/ui/button'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticket =
    supportTicketsMock.find((t) => t.id === id) ??
    (id === closedTicketMock.id ? closedTicketMock : closedTicketMock)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          to="/support/tickets"
          className="mt-1 rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Ticket Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or oversight.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Ticket ID</p>
            <p className="font-mono text-lg font-semibold text-amber-400">#{ticket.id}</p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Subject" value={ticket.subject} />
          <DetailField label="Category" value={ticket.category} />
          <div>
            <p className="text-xs text-slate-500">Priority</p>
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
        <h2 className="text-sm font-semibold text-white">Description</h2>
        <div className="rounded-xl border border-white/10 bg-[#111111] p-4 text-sm text-slate-300">
          {ticket.description ?? 'No description provided.'}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Conversation History</h2>
        <div className="space-y-4 rounded-xl border border-white/10 bg-[#111111] p-5">
          {chatMessagesMock.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'agent' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className="size-8 shrink-0 rounded-full bg-slate-700" />
              <div className={`max-w-[75%] ${msg.role === 'agent' ? 'text-right' : 'text-left'}`}>
                <div className="rounded-xl border border-white/5 bg-[#1a1a1a] px-4 py-3 text-sm text-slate-300">
                  {msg.content}
                </div>
                <span className="mt-1 block text-[10px] text-slate-500">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {ticket.resolution ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Resolution</h2>
          <div className="rounded-xl border border-white/10 bg-[#111111] p-4 text-sm text-slate-300">
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
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}
