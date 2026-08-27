import type { EscalationStatus } from '../types/support'
import {
  dashIfEmpty,
  getEscalationStatusClassName,
  getEscalationStatusLabel,
} from '../utils/support-format'

export function EscalationStatusBadge({ status }: { status?: EscalationStatus | string | null }) {
  const label = getEscalationStatusLabel(status)
  if (!label) return <>{dashIfEmpty(null)}</>
  return <span className={getEscalationStatusClassName(status)}>{label}</span>
}
