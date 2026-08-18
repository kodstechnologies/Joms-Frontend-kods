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
  isLoading?: boolean
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
  isLoading = false,
}: TicketIntelligencePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-h3 text-brand-text">{title}</h2>
            <p className="text-body-sm text-muted mt-1">
              #{ticketId} | Created: {createdAt}
            </p>
          </div>
          <span className="text-body-sm-semibold border-brand-accent/30 bg-brand-accent/10 text-brand-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
            <Clock className="size-3.5" />
            Due in {dueIn}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ContextCard
            icon={<Shield className="text-brand-action size-4" />}
            label="Event"
            title={eventName}
            subtitle={`Event Date: ${eventDate}`}
          />
          <ContextCard
            icon={<CreditCard className="text-brand-danger size-4" />}
            label="Issue"
            title={issueName}
            subtitle={issueDetail}
          />
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <h3 className="text-body-sm-semibold text-muted mb-3 tracking-widest">ACTIVITY</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-body-sm text-muted py-6 text-center">Loading activity…</p>
          ) : activities.length === 0 ? (
            <p className="text-body-sm text-muted py-6 text-center">
              No activity for this session yet.
            </p>
          ) : (
            activities.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="radius-lg bg-brand-surface flex items-center justify-between border border-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Activity className="text-brand-accent size-4" />
                  <div>
                    <p className="text-body-md-medium text-brand-text">{item.title}</p>
                    <p className="text-body-sm text-muted">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-body-sm-semibold text-muted">{item.time}</span>
              </div>
            ))
          )}
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
    <div className="radius-lg bg-brand-surface border border-white/5 p-4">
      <div className="text-body-sm text-muted flex items-center gap-2">
        {icon}
        <span className="font-semibold tracking-wide uppercase">{label}</span>
      </div>
      <p className="text-body-md-medium text-brand-text mt-2">{title}</p>
      <p className="text-body-sm text-muted mt-1">{subtitle}</p>
    </div>
  )
}
