import { Clock } from 'lucide-react'

import type { TicketStatus } from '../types/support'
import { getStatusLabel, isTerminalTicketStatus } from '../utils/support-format'
import { cn } from '@/shared/lib/cn'

type TicketDueStatusBadgeProps = {
  dueIn: string
  status?: string | null
}

export function TicketDueStatusBadge({ dueIn, status }: TicketDueStatusBadgeProps) {
  const isTerminal =
    isTerminalTicketStatus(status) || /^(resolved|closed)$/i.test(String(dueIn).trim())
  const badgeText = isTerminal ? (status ? getStatusLabel(status as TicketStatus) : dueIn) : dueIn

  const isTerminalGreen =
    status === 'resolved' ||
    status === 'closed' ||
    /^(resolved|closed)$/i.test(String(badgeText).trim())

  return (
    <div className="flex shrink-0 flex-col items-end">
      <span className="text-muted text-[10px] leading-3">Due in</span>
      <span
        className={cn(
          'mt-1 inline-flex h-[22px] items-center gap-1 rounded-full border px-2 text-[10px] font-semibold',
          isTerminal && isTerminalGreen
            ? 'border-brand-positive/30 bg-brand-positive/10 text-brand-positive'
            : isTerminal
              ? 'border-white/20 bg-white/[0.06] text-white'
              : 'border-brand-accent/30 text-brand-accent bg-[#2A1D13]',
        )}
      >
        <Clock className="size-3" strokeWidth={2} aria-hidden />
        {badgeText}
      </span>
    </div>
  )
}
