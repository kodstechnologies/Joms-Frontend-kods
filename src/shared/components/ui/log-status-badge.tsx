import { cn } from '@/shared/lib/cn'

export function LogStatusBadge({ status }: { status: string }) {
  const isSuccess = status.toLowerCase() === 'success'
  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5 capitalize',
        isSuccess
          ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
          : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {isSuccess ? 'Success' : 'Failed'}
    </span>
  )
}
