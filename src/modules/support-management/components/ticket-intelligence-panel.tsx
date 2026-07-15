import { Activity, Clock, CreditCard, Shield } from 'lucide-react'

import type { ActivityItem } from '../types/support'

type TicketIntelligencePanelProps = {
  title: string
  ticketId: string
  createdAt: string
  dueIn: string
  eventName: string
  eventDate: string
  issueName: string
  issueDetail: string
  activities: ActivityItem[]
}

export function TicketIntelligencePanel({
  title,
  ticketId,
  createdAt,
  dueIn,
  eventName,
  eventDate,
  issueName,
  issueDetail,
  activities,
}: TicketIntelligencePanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">
            #{ticketId} | Created: {createdAt}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Clock className="size-3.5" />
          Due in {dueIn}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ContextCard
          icon={<Shield className="size-4 text-blue-400" />}
          label="Event"
          title={eventName}
          subtitle={`Event Date: ${eventDate}`}
        />
        <ContextCard
          icon={<CreditCard className="size-4 text-rose-400" />}
          label="Issue"
          title={issueName}
          subtitle={issueDetail}
        />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold tracking-widest text-slate-500">ACTIVITY</h3>
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-[#1a1a1a] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Activity className="size-4 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContextCard({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  title: string
  subtitle: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {icon}
        <span className="font-semibold tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  )
}
