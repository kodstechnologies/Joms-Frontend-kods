import { cn } from '@/shared/lib/cn'

const badgeClass = 'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5'

export function FinanceStatusBadge({ status, toneClass }: { status: string; toneClass: string }) {
  return <span className={cn(badgeClass, toneClass)}>{status}</span>
}
