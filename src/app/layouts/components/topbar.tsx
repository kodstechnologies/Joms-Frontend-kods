import { Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AlertsTrigger } from '@/app/layouts/components/alerts-panel'
import { NotificationTrigger } from '@/app/layouts/components/notification-dropdown'
import { SidebarBrand } from '@/app/layouts/components/sidebar-brand'
import { getVisibleNavigation } from '@/app/layouts/navigation/navigation.filter'
import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import { useBranding } from '@/app/providers/use-branding'
import { useMaintenance } from '@/app/providers/use-maintenance'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useContactSetupProfile, useRbacMe } from '@/modules/rbac/hooks/use-rbac'
import { formatDisplayClock, useLiveClock } from '@/modules/settings/utils/display-clock'
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
  alertsOpen,
  onAlertsOpen,
  showCompact = false,
}: {
  onMenuClick: () => void
  notificationsOpen: boolean
  onNotificationsOpen: () => void
  alertsOpen: boolean
  onAlertsOpen: () => void
  showCompact?: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isSubAdmin = Boolean(user && !user.isSuperAdmin)
  const profileQuery = useContactSetupProfile(isSubAdmin)
  const meQuery = useRbacMe()
  const visibleNavigation = getVisibleNavigation(user)
  const title = getTitleFromNav(location.pathname, visibleNavigation)
  const displayName = user?.fullname ?? 'Admin'
  const profileRoleLabel =
    profileQuery.data?.data.profile.roles.map((role) => role.name).join(', ') || 'Sub Admin'
  const roleLabel = user?.isSuperAdmin ? 'Super Admin' : profileRoleLabel
  const profileImageUrl = user?.isSuperAdmin
    ? meQuery.data?.data.profile?.profileImageUrl
    : profileQuery.data?.data.profile.profileImageUrl
  const userInitial = displayName.charAt(0).toUpperCase()
  const canOpenProfile = Boolean(user)
  const { applicationName, timezone, dateTimeFormat } = useBranding()
  const { status: maintenanceStatus } = useMaintenance()
  const now = useLiveClock()
  const clockLabel = formatDisplayClock(now, dateTimeFormat, timezone)
  const pageTitle = title || 'Dashboard'
  const brandName = applicationName || 'JOMS Applications'

  return (
    <header className={cn('sticky top-0 z-30 shrink-0 backdrop-blur', uiTokens.headerBg)}>
      {maintenanceStatus.active ? (
        <div className="border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-100 md:px-6">
          Maintenance mode is active. Other users cannot log in until it is turned off or the
          schedule ends.
        </div>
      ) : null}
      <div className="relative h-[var(--brand-topbar-height)]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-brand-md text-brand-stroke focus-visible:ring-brand-accent/30 p-2 hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="icon-lg" strokeWidth={1.5} />
            </button>
            {showCompact ? (
              <SidebarBrand />
            ) : (
              <div>
                <p className="text-body-md-semibold text-brand-text tracking-tight">{pageTitle}</p>
                <p className="text-body-sm text-muted leading-[18px]">{brandName}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AlertsTrigger open={alertsOpen} onOpen={onAlertsOpen} />
            <NotificationTrigger open={notificationsOpen} onOpen={onNotificationsOpen} />

            <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />

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
                <p className="text-body-md-semibold text-brand-text">{roleLabel}</p>
                <p className="text-body-sm text-muted tabular-nums">{clockLabel}</p>
              </div>
              <div className="from-brand-gold-from/30 to-brand-gold-to/20 text-brand-text text-body-md-semibold grid size-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br shadow-[0_12px_35px_rgba(0,0,0,0.45)]">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={displayName} className="size-full object-cover" />
                ) : (
                  <span className="translate-y-0.5">{userInitial}</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
