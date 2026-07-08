import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

import { NotificationPanel } from '@/app/layouts/components/notification-dropdown'
import { Sidebar } from '@/app/layouts/components/sidebar'
import { SidebarMobile } from '@/app/layouts/components/sidebar-mobile'
import { Topbar } from '@/app/layouts/components/topbar'
import { PageContainer } from '@/shared/components/responsive/page-container'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { uiTokens } from '@/shared/lib/design-tokens'
import { useSyncSubAdminPermissions } from '@/modules/auth/hooks/use-sync-sub-admin-permissions'

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const location = useLocation()
  const isTabletCompact = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktopShell = useMediaQuery('(min-width: 768px)')

  useSyncSubAdminPermissions()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false)
    setIsNotificationsOpen(false)
  }, [location.pathname])

  const showCompact = isCollapsed || isTabletCompact

  return (
    <div className={cn('relative h-dvh overflow-hidden text-brand-text', uiTokens.shellBg)}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 md:block transition-[width] duration-300 ease-in-out overflow-hidden',
          uiTokens.sidebarBg,
          showCompact ? 'w-[5.75rem]' : 'w-[18.5rem]'
        )}
      >
        <div className="flex h-16 items-center px-3 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-accent shrink-0" />
            {!showCompact ? (
              <p className="text-sm font-semibold tracking-tight text-brand-text uppercase">JOMS</p>
            ) : null}
          </div>
        </div>
        <Sidebar compact={showCompact} />
      </aside>

      <SidebarMobile open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationPanel
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <div
        className={cn(
          "relative flex h-dvh min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300 ease-in-out",
          showCompact ? "md:pl-[5.75rem]" : "md:pl-[18.5rem]"
        )}
      >
        <Topbar
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          notificationsOpen={isNotificationsOpen}
          onNotificationsOpen={() => setIsNotificationsOpen(true)}
        />
        <main
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
          style={{ overflowY: !isDesktopShell && isSidebarOpen ? 'hidden' : 'auto' }}
        >
          <div className="py-4 lg:py-6">
            <PageContainer>
              <Outlet/>
            </PageContainer>
          </div>
        </main>
      </div>
    </div>
  )
}