import { useNavigate } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'

export type PageBreadcrumbItem = {
  label: string
  to?: string
  state?: unknown
  isActive?: boolean
}

type PageBreadcrumbProps = {
  items: PageBreadcrumbItem[]
  className?: string
}

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  const navigate = useNavigate()

  if (items.length === 0) return null

  return (
    <nav
      className={cn(
        'text-body-sm text-muted flex flex-wrap items-center gap-1.5 font-medium',
        className,
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isCurrent = isLast || Boolean(item.isActive)
        const canNavigate = Boolean(item.to) && !isCurrent

        return (
          <span key={`${item.label}-${index}`} className="contents">
            {index > 0 && <span className="text-[#333333]">/</span>}
            {canNavigate ? (
              <button
                type="button"
                onClick={() =>
                  navigate(item.to as string, item.state ? { state: item.state } : undefined)
                }
                className="hover:text-brand-text transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className={cn(isCurrent && 'font-bold text-white')}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
