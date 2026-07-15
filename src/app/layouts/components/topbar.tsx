import { Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { NotificationTrigger } from '@/app/layouts/components/notification-dropdown'
import { SidebarBrand } from '@/app/layouts/components/sidebar-brand'
import { getVisibleNavigation } from '@/app/layouts/navigation/navigation.filter'
import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useContactSetupProfile } from '@/modules/rbac/hooks/use-rbac'
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
  notificationsOpen,
  onNotificationsOpen,
  showCompact = false,
}: {
  onMenuClick: () => void
  notificationsOpen: boolean
  onNotificationsOpen: () => void
  showCompact?: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isSubAdmin = Boolean(user && !user.isSuperAdmin)
  const profileQuery = useContactSetupProfile(isSubAdmin)
  const visibleNavigation = getVisibleNavigation(user)
  const title = getTitleFromNav(location.pathname, visibleNavigation)
  const displayName = user?.fullname ?? 'Admin'
  const profileRoleLabel =
    profileQuery.data?.data.profile.roles.map((role) => role.name).join(', ') || 'Sub Admin'
  const roleLabel = user?.isSuperAdmin ? 'Super Admin' : profileRoleLabel
  const profileImageUrl = isSubAdmin ? profileQuery.data?.data.profile.profileImageUrl : undefined
  const userInitial = displayName.charAt(0).toUpperCase()
  const canOpenProfile = isSubAdmin

  return (
    <header className={cn('sticky top-0 z-30 backdrop-blur', uiTokens.headerBg)}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-brand-md text-brand-stroke focus-visible:ring-brand-accent/30 p-2 hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          {showCompact ? (
            <SidebarBrand />
          ) : (
            <div>
              <p className="text-brand-text text-[15px] font-semibold tracking-tight">{title}</p>
              <p className="text-brand-muted text-xs leading-relaxed">Command Operations Centre</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NotificationTrigger open={notificationsOpen} onOpen={onNotificationsOpen} />

          <button
            type="button"
            onClick={() => {
              if (canOpenProfile) {
                navigate('/settings/access/my-profile')
              }
            }}
            disabled={!canOpenProfile}
            className={cn(
              'rounded-brand-md flex items-center gap-3 transition-colors',
              canOpenProfile
                ? 'focus-visible:ring-brand-accent/30 cursor-pointer hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none'
                : 'cursor-default',
            )}
            aria-label={canOpenProfile ? 'Open my profile' : 'Profile'}
          >
            <div className={cn('hidden text-right sm:block')}>
              <p className="text-brand-text text-sm font-semibold">{displayName}</p>
              <p className="text-brand-muted text-[11px]">{roleLabel}</p>
            </div>
            <div className="from-brand-gold-from/30 to-brand-gold-to/20 text-brand-text grid size-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br text-sm font-semibold shadow-[0_12px_35px_rgba(0,0,0,0.45)]">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={displayName} className="size-full object-cover" />
              ) : (
                <span className="translate-y-0.5">{userInitial}</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
