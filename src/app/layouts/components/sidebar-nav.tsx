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
    } finally {
      clearSession()
      onNavigate?.()
    }
  }

  return (
    <div className={cn('flex h-full flex-col pt-1 pb-6', compact ? 'px-2' : 'px-3')}>
      <nav
        className={cn(
          'flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] overflow-y-auto pb-4',
          compact ? 'space-y-1' : 'space-y-0.5',
        )}
      >
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

      <div className={cn('pt-3', compact ? 'flex justify-center' : 'pl-1')}>
        <button
          type="button"
          onClick={() => {
            void handleLogout()
          }}
          disabled={isLoggingOut}
          className={cn(
            'flex cursor-pointer items-center justify-center rounded-[10px] bg-[#D3191C] text-white shadow-sm transition-all hover:bg-[#ba1417] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
            compact ? 'size-10' : 'h-10 w-fit gap-2.5 px-3.5 text-[13px] font-medium tracking-wide',
          )}
          aria-label="Log Out"
        >
          <LogOut className="size-4 shrink-0 text-white" strokeWidth={2} />
          {!compact ? (
            <span className="font-medium whitespace-nowrap text-white">
              {isLoggingOut ? 'Logging out…' : 'Log Out'}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
