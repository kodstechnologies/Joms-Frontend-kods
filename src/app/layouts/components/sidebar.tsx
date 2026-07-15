import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { SidebarGroup } from '@/app/layouts/components/sidebar-group'
import { getVisibleNavigation } from '@/app/layouts/navigation/navigation.filter'
import { findActiveTopLevelKey } from '@/app/layouts/navigation/sidebar-utils'
import { useLogoutMutation } from '@/modules/auth/hooks/use-logout-mutation'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'

export function Sidebar({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void
  compact?: boolean
}) {
  const clearSession = useAuthStore((state) => state.clearSession)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogoutMutation()
  const visibleNavigation = useMemo(() => getVisibleNavigation(user), [user])
  const activeTopLevelKey = useMemo(
    () => findActiveTopLevelKey(visibleNavigation, location.pathname),
    [location.pathname, visibleNavigation],
  )

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Logout still clears local session below
    } finally {
      clearSession()
      onNavigate?.()
    }
  }

  return (
    <div className="flex h-full flex-col px-3 pt-2 pb-6">
      <nav className="flex-1 space-y-0.5 overflow-y-auto pb-4 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
        {visibleNavigation.map((item) => (
          <SidebarGroup
            key={item.key}
            item={item}
            compact={compact}
            activeTopLevelKey={activeTopLevelKey}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <button
        type="button"
        onClick={() => {
          void handleLogout()
        }}
        disabled={isLoggingOut}
        className={cn(
          'text-brand-danger hover:text-brand-danger/80 focus-visible:ring-brand-accent/30 mt-2 flex items-center text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          compact ? 'justify-center py-3' : 'rounded-brand-md gap-2 px-3 py-2.5',
        )}
        aria-label="Log Out"
      >
        <LogOut className="size-4" />
        {!compact ? (
          <span className="truncate">{isLoggingOut ? 'Logging out…' : 'Log Out'}</span>
        ) : null}
      </button>
    </div>
  )
}
