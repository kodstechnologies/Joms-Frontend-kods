import { cn } from '@/shared/lib/cn'

const STATUS_STYLES: Record<
  string,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  success: {
    backgroundColor: 'rgb(0 166 62 / 15%)',
    color: '#00A63E',
    borderColor: 'rgb(0 166 62 / 30%)',
  },
  failed: {
    backgroundColor: 'rgb(211 25 28 / 15%)',
    color: '#D3191C',
    borderColor: 'rgb(211 25 28 / 30%)',
  },
  pending: {
    backgroundColor: 'rgb(245 158 11 / 15%)',
    color: '#F59E0B',
    borderColor: 'rgb(245 158 11 / 30%)',
  },
}

const STATUS_LABELS: Record<string, string> = {
  success: 'Success',
  failed: 'Failed',
  pending: 'Pending',
}

export function LogStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()
  const palette = STATUS_STYLES[key] || STATUS_STYLES.failed

  return (
    <span
      className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold')}
      style={palette}
    >
      {STATUS_LABELS[key] || status}
    </span>
  )
}
