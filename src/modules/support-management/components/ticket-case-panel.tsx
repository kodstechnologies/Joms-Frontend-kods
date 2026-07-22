import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

type TicketCasePanelProps = {
  reporterName: string
  reporterId: string
  pastTicketsCount: number
  assignedTo: string
  status: string
  priority: string
  module: string
  issueType: string
  comments: string
  onEscalate?: () => void
  onResolve?: () => void
}

export function TicketCasePanel({
  reporterName,
  reporterId,
  pastTicketsCount,
  assignedTo,
  status,
  priority,
  module,
  issueType,
  comments,
  onEscalate,
  onResolve,
}: TicketCasePanelProps) {
  return (
    <div className="radius-lg bg-brand-surface flex h-full flex-col border border-white/10">
      <div className="space-y-5 border-b border-white/5 p-4">
        <div>
          <p className="text-body-sm-semibold text-muted tracking-widest uppercase">
            Case Reporter
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-body-md-semibold text-brand-text">{reporterName}</span>
                <span className="text-body-sm-semibold border-brand-positive/30 bg-brand-positive/10 text-brand-positive rounded border px-1.5 py-0.5">
                  USER
                </span>
              </div>
              <p className="text-body-sm text-muted">User ID: {reporterId}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to={`/support/past-tickets/${reporterId}`}>
              <Button variant="secondary" className="text-body-sm">
                Past Tickets ({pastTicketsCount})
              </Button>
            </Link>
            <Button variant="ghost" className="text-body-sm">
              View Profile
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-body-sm-semibold text-muted tracking-widest uppercase">
              Assigned To
            </p>
            <button type="button" className="text-body-sm text-brand-accent hover:underline">
              Reassign
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="size-8 rounded-full bg-white/10" />
            <span className="text-body-md text-brand-text">{assignedTo}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <SelectField label="Ticket Status" value={status} />
        <SelectField label="Priority" value={priority} />
        <SelectField label="Module" value={module} />
        <SelectField label="Issue Type" value={issueType} />

        <label className="block space-y-2">
          <span className="text-body-sm text-muted">Comments</span>
          <textarea
            readOnly
            value={comments}
            className="ui-textarea text-brand-text/80 h-24 resize-none"
          />
        </label>

        <SelectField label="Escalation Pathway" value="None" />
      </div>

      <div className="flex gap-2 border-t border-white/5 p-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onEscalate ?? (() => toast.message('Escalation coming soon'))}
        >
          Escalate
        </Button>
        <Button
          className="flex-1"
          onClick={onResolve ?? (() => toast.success('Ticket marked as resolved (static preview)'))}
        >
          Mark as Resolved
        </Button>
      </div>
    </div>
  )
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-body-sm text-muted">{label}</span>
      <div className="radius-md bg-brand-surface flex h-10 items-center justify-between border border-white/10 px-3">
        <span className="text-body-md text-brand-text">{value}</span>
        <span className="text-muted">▾</span>
      </div>
    </label>
  )
}
