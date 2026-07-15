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
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#111111]">
      <div className="space-y-5 border-b border-white/5 p-4">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            Case Reporter
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="size-10 rounded-full bg-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{reporterName}</span>
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  USER
                </span>
              </div>
              <p className="text-xs text-slate-500">User ID: {reporterId}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to={`/support/past-tickets/${reporterId}`}>
              <Button variant="secondary" className="text-xs">
                Past Tickets ({pastTicketsCount})
              </Button>
            </Link>
            <Button variant="ghost" className="text-xs">
              View Profile
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Assigned To
            </p>
            <button type="button" className="text-xs text-amber-400 hover:underline">
              Reassign
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="size-8 rounded-full bg-slate-700" />
            <span className="text-sm text-white">{assignedTo}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <SelectField label="Ticket Status" value={status} />
        <SelectField label="Priority" value={priority} />
        <SelectField label="Module" value={module} />
        <SelectField label="Issue Type" value={issueType} />

        <label className="block space-y-2">
          <span className="text-xs font-medium text-slate-400">Comments</span>
          <textarea
            readOnly
            value={comments}
            className="h-24 w-full resize-none rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-slate-300"
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
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#1a1a1a] px-3">
        <span className="text-sm text-white">{value}</span>
        <span className="text-slate-500">▾</span>
      </div>
    </label>
  )
}
