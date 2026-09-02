import type { TicketStatus } from '../types/support'
import { cn } from '@/shared/lib/cn'
import { getStatusClassName, getStatusLabel } from '../utils/support-format'

export function TicketStatusBadge({
  status,
  variant = 'default',
}: {
  status: TicketStatus
  variant?: 'default' | 'workspace'
}) {
  if (variant === 'workspace') {
    return (
      <span className="inline-flex h-[22px] items-center rounded-full border border-white/20 bg-white/[0.06] px-2 text-[10px] font-semibold text-white">
        {getStatusLabel(status)}
      </span>
    )
  }

  return <span className={getStatusClassName(status)}>{getStatusLabel(status)}</span>
}
