import moduleIcon from '@/assets/JOMS_ICONS-2/icons8-module-24.svg'

const iconClass = 'size-4 shrink-0 text-white'

export function CaseTicketStatusIcon() {
  return (
    <svg viewBox="0 0 16 16" className={iconClass} fill="currentColor" aria-hidden>
      <path d="M4.5 1h7v2.8L8 6.2 4.5 3.8V1zm0 14h7v-2.8L8 9.8 4.5 12.2V15zM6 2.5v1.5L8 6l2-2V2.5H6zm0 11h4V12L8 10 6 12v1.5z" />
    </svg>
  )
}

export function CasePriorityIcon() {
  return (
    <svg viewBox="0 0 16 16" className={iconClass} fill="currentColor" aria-hidden>
      <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 1.5a5 5 0 110 10 5 5 0 010-10zm-.75 3.25a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
    </svg>
  )
}

export function CaseModuleIcon() {
  return (
    <img
      src={moduleIcon}
      alt=""
      className="size-4 shrink-0 brightness-0 invert"
      aria-hidden="true"
    />
  )
}

export function CaseIssueTypeIcon() {
  return (
    <svg viewBox="0 0 16 16" className={iconClass} fill="currentColor" aria-hidden>
      <path d="M1.5 4.5h13v7h-13v-7zm1 1v5h11v-5h-11zm5.5 1.25a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5z" />
      <path d="M2.5 2.5h11v1h-11v-1zm0 10h11v1h-11v-1z" opacity="0.75" />
    </svg>
  )
}

export function CaseEscalationIcon() {
  return <CaseIssueTypeIcon />
}
