import { CircleDollarSign, ShieldCheck } from 'lucide-react'

const iconClass = 'size-3.5 text-white'

export function IntelligenceEventIcon() {
  return <ShieldCheck className={iconClass} strokeWidth={1.75} aria-hidden />
}

export function IntelligenceIssueIcon() {
  return (
    <span className="relative inline-flex size-3.5 shrink-0" aria-hidden>
      <CircleDollarSign className={iconClass} strokeWidth={1.65} />
      <span className="pointer-events-none absolute inset-[1px] flex items-center justify-center">
        <span className="h-[14px] w-[1.5px] rotate-45 rounded-full bg-white" />
      </span>
    </span>
  )
}
