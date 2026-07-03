import type { TicketPriority } from '../types/support'
import { getPriorityClassName } from '../utils/support-format'

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={getPriorityClassName(priority)}>{priority}</span>
}
