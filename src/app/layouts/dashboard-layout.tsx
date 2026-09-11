import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PanelLeftClose } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

import { AlertsPanel } from '@/app/layouts/components/alerts-panel'
import { NotificationPanel } from '@/app/layouts/components/notification-dropdown'
import { Sidebar } from '@/app/layouts/components/sidebar'
import { SidebarBrand } from '@/app/layouts/components/sidebar-brand'
import { SidebarMobile } from '@/app/layouts/components/sidebar-mobile'
import { Topbar } from '@/app/layouts/components/topbar'
import { PageContainer } from '@/shared/components/responsive/page-container'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { uiTokens } from '@/shared/lib/design-tokens'
import { useSyncSubAdminPermissions } from '@/modules/auth/hooks/use-sync-sub-admin-permissions'
import { usePushNotifications } from '@/modules/notifications'

function PageContentLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted text-body-md-medium animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const location = useLocation()
  const isTabletCompact = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktopShell = useMediaQuery('(min-width: 768px)')

  useSyncSubAdminPermissions()
  usePushNotifications()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close overlays on route change
    setIsSidebarOpen(false)
    setIsNotificationsOpen(false)
    setIsAlertsOpen(false)
  }, [location.pathname])

  const showCompact = isTabletCompact || isCollapsed

  return (
    <div className={cn('text-brand-text relative h-dvh overflow-hidden', uiTokens.shellBg)}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-white/10 transition-[width] duration-300 ease-in-out md:flex md:flex-col',
          uiTokens.sidebarBg,
          showCompact ? 'w-[var(--brand-sidebar-collapsed)]' : 'w-[var(--brand-sidebar-width)]',
        )}
      >
        <div
          className={cn(
            'relative z-10 flex h-[var(--brand-topbar-height)] shrink-0 items-center border-b border-white/10',
            showCompact ? 'justify-center px-2' : 'gap-2 px-4 pr-2',
          )}
        >
          {showCompact ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="focus-visible:ring-brand-accent/30 grid size-10 place-items-center rounded-xl text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Expand sidebar"
            >
              <PanelLeftClose className="icon-lg" strokeWidth={1.5} />
            </button>
          ) : (
            <>
              <SidebarBrand className="min-w-0 flex-1 overflow-hidden" />
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="focus-visible:ring-brand-accent/30 grid size-8 shrink-0 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="icon-lg" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1">
          <Sidebar compact={showCompact} />
        </div>
      </aside>

      <SidebarMobile open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationPanel open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <AlertsPanel open={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />

      <div
        className={cn(
          'relative flex h-dvh min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300 ease-in-out',
          showCompact
            ? 'md:pl-[var(--brand-sidebar-collapsed)]'
            : 'md:pl-[var(--brand-sidebar-width)]',
        )}
      >
        <Topbar
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          notificationsOpen={isNotificationsOpen}
          onNotificationsOpen={() => {
            setIsAlertsOpen(false)
            setIsNotificationsOpen(true)
          }}
          alertsOpen={isAlertsOpen}
          onAlertsOpen={() => {
            setIsNotificationsOpen(false)
            setIsAlertsOpen(true)
          }}
          showCompact={showCompact}
        />
        <main
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth"
          style={{ overflowY: !isDesktopShell && isSidebarOpen ? 'hidden' : 'auto' }}
        >
          <div className="min-w-0 py-4 md:py-6">
            <PageContainer>
              <Suspense fallback={<PageContentLoader />}>
                <Outlet />
              </Suspense>
            </PageContainer>
          </div>
        </main>
      </div>
    </div>
  )
}
