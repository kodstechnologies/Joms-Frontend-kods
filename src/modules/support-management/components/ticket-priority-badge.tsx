import type { TicketPriority } from '../types/support'
import { getPriorityClassName, getPriorityLabel } from '../utils/support-format'

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={getPriorityClassName(priority)}>{getPriorityLabel(priority)}</span>
}
