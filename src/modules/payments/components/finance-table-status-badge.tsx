import { cn } from '@/shared/lib/cn'
import {
  FINANCE_TABLE_STATUS_BADGE_BASE,
  financeTableStatusToneClass,
} from '@/modules/payments/utils/finance-status-tones'

export function FinanceTableStatusBadge({
  status,
  toneClass,
}: {
  status: string
  toneClass?: string
}) {
  return (
    <span
      className={cn(
        FINANCE_TABLE_STATUS_BADGE_BASE,
        toneClass ?? financeTableStatusToneClass(status),
      )}
    >
      {status}
    </span>
  )
}
