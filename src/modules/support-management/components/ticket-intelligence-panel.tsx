import { Activity } from 'lucide-react'

import type { ActivityItem } from '../types/support'
import { IntelligenceEventIcon, IntelligenceIssueIcon } from './intelligence-card-icons'
import { TicketDueStatusBadge } from './ticket-due-status-badge'
import { cn } from '@/shared/lib/cn'

type TicketIntelligencePanelProps = {
  title: string
  ticketId: string
  createdAt: string
  dueIn: string
  status?: string | null
  eventName: string
  eventDate: string
  issueName: string
  issueDetail: string
  activities: ActivityItem[]
  isLoading?: boolean
}

function IntelligenceIconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-[#111112]">
      {children}
    </span>
  )
}

export function TicketIntelligencePanel({
  title,
  ticketId,
  createdAt,
  dueIn,
  status,
  eventName,
  eventDate,
  issueName,
  issueDetail,
  activities,
  isLoading = false,
}: TicketIntelligencePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-brand-text text-[20px] leading-[28px] font-semibold">{title}</h2>
            <p className="text-muted mt-1 text-[11px] leading-4">
              #{ticketId} | Created: {createdAt}
            </p>
          </div>
          <TicketDueStatusBadge dueIn={dueIn} status={status} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ContextCard
            icon={<IntelligenceEventIcon />}
            label="Event"
            title={eventName}
            subtitle={`Event Date: ${eventDate}`}
          />
          <ContextCard
            icon={<IntelligenceIssueIcon />}
            label="Issue"
            title={issueName}
            subtitle={issueDetail}
          />
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <h3 className="text-muted mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
          Activity
        </h3>
        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#18181A]">
          {isLoading ? (
            <p className="text-body-sm text-muted py-6 text-center">Loading activity…</p>
          ) : activities.length === 0 ? (
            <p className="text-body-sm text-muted py-6 text-center">
              No activity for this session yet.
            </p>
          ) : (
            activities.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'flex min-h-[61px] items-center justify-between px-3.5 py-3',
                  index > 0 && 'border-t border-white/[0.06]',
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <IntelligenceIconTile>
                    <Activity className="size-3.5 text-white" strokeWidth={1.75} aria-hidden />
                  </IntelligenceIconTile>
                  <div className="min-w-0">
                    <p className="text-brand-text truncate text-[13px] leading-5 font-medium">
                      {item.title}
                    </p>
                    <p className="text-muted truncate text-[11px] leading-4">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-muted ml-3 shrink-0 text-[11px] leading-4">{item.time}</span>
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
    <div className="min-h-[88px] rounded-lg border border-white/[0.06] bg-[#18181A] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted text-[11px] font-medium">{label}</span>
        <IntelligenceIconTile>{icon}</IntelligenceIconTile>
      </div>
      <p className="text-brand-text mt-2 truncate text-[15px] leading-[22px] font-semibold">
        {title}
      </p>
      <p className="text-muted mt-1 truncate text-[11px] leading-4">{subtitle}</p>
    </div>
  )
}
