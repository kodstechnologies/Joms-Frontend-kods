import { cn } from '@/shared/lib/cn'

type RbacLoaderProps = {
  label?: string
  fullScreen?: boolean
  className?: string
}

export function RbacLoader({
  label = 'Loading...',
  fullScreen = false,
  className,
}: RbacLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-screen bg-brand-bg' : 'min-h-[40vh]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-9 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
        <p className="text-sm font-medium text-brand-muted">{label}</p>
      </div>
    </div>
  )
}
