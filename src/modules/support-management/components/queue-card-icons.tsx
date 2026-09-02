import { Calendar, Package, User } from 'lucide-react'

const iconClass = 'shrink-0 text-white'

export function QueueCalendarIcon() {
  return <Calendar className={`${iconClass} size-3`} strokeWidth={1.75} aria-hidden />
}

export function QueueSubjectIcon() {
  return <Package className={`${iconClass} size-3.5`} strokeWidth={1.75} aria-hidden />
}

export function QueueReporterIcon() {
  return <User className={`${iconClass} size-3.5`} strokeWidth={1.75} aria-hidden />
}
