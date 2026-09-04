import type { TicketPriority } from '../types/support'
import { getPriorityClassName, getPriorityLabel } from '../utils/support-format'
import { cn } from '@/shared/lib/cn'

export function TicketPriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority
  className?: string
}) {
  return (
    <span className={cn(getPriorityClassName(priority), className)}>
      {getPriorityLabel(priority)}
    </span>
  )
}
