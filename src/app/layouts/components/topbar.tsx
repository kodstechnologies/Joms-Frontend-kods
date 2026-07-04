import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { NotificationTrigger } from '@/app/layouts/components/notification-dropdown'
import { getVisibleNavigation } from '@/app/layouts/navigation/navigation.filter'
import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

function findTitleInNav(items: NavItem[], pathname: string): string | null {
  for (const item of items) {
    if (item.to && pathname.startsWith(item.to)) {
      return item.label
    }
    if (item.children) {
      const childTitle = findTitleInNav(item.children, pathname)
      if (childTitle) return childTitle
    }
  }
  return null
}

function getTitleFromNav(pathname: string, items: NavItem[]) {
  return findTitleInNav(items, pathname) ?? 'Dashboard'
}

export function Topbar({
  onMenuClick,
  onToggleCollapse,
  notificationsOpen,
  onNotificationsOpen,
}: {
  onMenuClick: () => void
  onToggleCollapse: () => void
  notificationsOpen: boolean
  onNotificationsOpen: () => void
}) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const visibleNavigation = getVisibleNavigation(user)
  const title = getTitleFromNav(location.pathname, visibleNavigation)
  const displayName = user?.fullname ?? 'Admin'
  const roleLabel = user?.isSuperAdmin ? 'Super Admin' : 'Sub Admin'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <header className={cn('sticky top-0 z-30 backdrop-blur', uiTokens.headerBg)}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-brand-md p-2 text-brand-stroke hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-brand-md p-2 text-brand-stroke hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 md:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-brand-text">{title}</p>
            <p className="text-xs leading-relaxed text-brand-muted">Command Operations Centre</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationTrigger open={notificationsOpen} onOpen={onNotificationsOpen} />

          <div className="flex items-center gap-3">
            <div className={cn('hidden text-right sm:block')}>
              <p className="text-sm font-semibold text-brand-text">{displayName}</p>
              <p className="text-[11px] text-brand-muted">{roleLabel}</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-brand-gold-from/30 to-brand-gold-to/20 text-sm font-semibold text-brand-text shadow-[0_12px_35px_rgba(0,0,0,0.45)]">
              <span className="translate-y-0.5">{userInitial}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
