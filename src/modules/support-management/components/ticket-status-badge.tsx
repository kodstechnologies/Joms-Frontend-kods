import type { TicketStatus } from '../types/support'
import { getStatusClassName, getStatusLabel } from '../utils/support-format'

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <span className={getStatusClassName(status)}>{getStatusLabel(status)}</span>
}
