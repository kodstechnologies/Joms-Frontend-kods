import adminLogo from '@/assets/admin-logo.png'
import { cn } from '@/shared/lib/cn'

type SidebarBrandProps = {
  compact?: boolean
  showTitles?: boolean
  className?: string
}

export function SidebarBrand({
  compact = false,
  showTitles = true,
  className,
}: SidebarBrandProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <img
        src={adminLogo}
        alt="JOMS"
        className={cn('shrink-0 rounded-full object-cover', compact ? 'size-9' : 'size-10')}
      />
      {showTitles ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-brand-text">
            Command Operations Centre
          </p>
          <p className="truncate text-xs text-white/50">JOMS Applications</p>
        </div>
      ) : null}
    </div>
  )
}
