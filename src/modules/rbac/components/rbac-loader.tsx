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
        fullScreen ? 'bg-brand-bg min-h-screen' : 'min-h-[40vh]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-brand-muted text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}
