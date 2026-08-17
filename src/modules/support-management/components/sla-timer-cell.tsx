import { useEffect, useState } from 'react'

import type { TicketStatus } from '../types/support'
import { formatSlaCountdown, isTerminalTicketStatus } from '../utils/support-format'

type SlaTimerCellProps = {
  slaTimer?: string | null
  slaDueAt?: string | null
  status?: TicketStatus | string | null
}

function remainingLabel(slaDueAt: string, now: number) {
  return formatSlaCountdown(new Date(slaDueAt).getTime() - now)
}

export function SlaTimerCell({ slaTimer, slaDueAt, status }: SlaTimerCellProps) {
  const isTerminal = isTerminalTicketStatus(status)
  const [now, setNow] = useState(() => Date.now())
  const shouldTick = !isTerminal && Boolean(slaDueAt)

  useEffect(() => {
    if (!shouldTick) return

    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [shouldTick, slaDueAt])

  const label = isTerminal ? '—' : slaDueAt ? remainingLabel(slaDueAt, now) : slaTimer || '—'

  return <span className="text-body-sm text-brand-text tabular-nums">{label}</span>
}
