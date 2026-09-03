import { cn } from '@/shared/lib/cn'

const SUBTLE_STATUS_STYLES: Record<
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

const SOLID_STATUS_STYLES: Record<
  string,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  success: {
    backgroundColor: '#00A63E',
    color: '#FFFFFF',
    borderColor: '#00A63E',
  },
  failed: {
    backgroundColor: '#D3191C',
    color: '#FFFFFF',
    borderColor: '#D3191C',
  },
  pending: {
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    borderColor: '#F59E0B',
  },
}

const STATUS_LABELS: Record<string, string> = {
  success: 'Success',
  failed: 'Failed',
  pending: 'Pending',
}

export function LogStatusBadge({
  status,
  variant = 'subtle',
}: {
  status: string
  variant?: 'subtle' | 'solid'
}) {
  const key = status.toLowerCase()
  const palette =
    variant === 'solid'
      ? SOLID_STATUS_STYLES[key] || SOLID_STATUS_STYLES.failed
      : SUBTLE_STATUS_STYLES[key] || SUBTLE_STATUS_STYLES.failed

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 text-[11px] font-semibold',
        variant === 'solid' ? 'h-[25px]' : 'py-0.5',
      )}
      style={palette}
    >
      {STATUS_LABELS[key] || status}
    </span>
  )
}
