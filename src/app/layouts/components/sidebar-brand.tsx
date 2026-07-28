import { useState } from 'react'

import { useBranding } from '@/app/providers/use-branding'
import { cn } from '@/shared/lib/cn'

type SidebarBrandProps = {
  compact?: boolean
  showTitles?: boolean
  className?: string
}

export function SidebarBrand({ compact = false, showTitles = true, className }: SidebarBrandProps) {
  const { applicationName, logoUrl, productTitle } = useBranding()
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const showLogo = Boolean(logoUrl) && failedLogoUrl !== logoUrl
  const logoInitial = (applicationName || 'J').charAt(0).toUpperCase()

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      {showLogo ? (
        <img
          src={logoUrl}
          alt={applicationName}
          className={cn('shrink-0 rounded-full object-cover', compact ? 'size-9' : 'size-10')}
          onError={() => setFailedLogoUrl(logoUrl)}
        />
      ) : (
        <div
          className={cn(
            'bg-brand-surface text-brand-text grid shrink-0 place-items-center rounded-full border border-white/10 text-sm font-semibold',
            compact ? 'size-9' : 'size-10',
          )}
          aria-hidden
        >
          {logoInitial}
        </div>
      )}
      {showTitles ? (
        <div className="min-w-0">
          <p className="text-brand-text truncate text-sm font-semibold tracking-tight">
            {productTitle}
          </p>
          <p className="truncate text-xs text-white/50">{applicationName}</p>
        </div>
      ) : null}
    </div>
  )
}
