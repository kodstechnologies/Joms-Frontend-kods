import type { SubAdminInvite } from '../types/rbac'
import { cn } from '@/shared/lib/cn'

export function InviteStatusBadge({ status }: { status: SubAdminInvite['status'] }) {
  const isAccepted = status === 'accepted'
  const isPending = status === 'pending'

  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5 capitalize',
        isAccepted && 'border-brand-success/25 bg-brand-success/10 text-brand-success',
        isPending && 'border-brand-accent-muted bg-brand-accent/15 text-brand-accent',
        !isAccepted && !isPending && 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {isAccepted ? 'Accepted' : isPending ? 'Pending' : 'Revoked'}
    </span>
  )
}
