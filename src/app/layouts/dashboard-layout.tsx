import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PanelLeftClose } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

import { NotificationPanel } from '@/app/layouts/components/notification-dropdown'
import { Sidebar } from '@/app/layouts/components/sidebar'
import { SidebarBrand } from '@/app/layouts/components/sidebar-brand'
import { SidebarMobile } from '@/app/layouts/components/sidebar-mobile'
import { Topbar } from '@/app/layouts/components/topbar'
import { PageContainer } from '@/shared/components/responsive/page-container'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { uiTokens } from '@/shared/lib/design-tokens'
import { useSyncSubAdminPermissions } from '@/modules/auth/hooks/use-sync-sub-admin-permissions'

function PageContentLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="size-9 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
        <p className="animate-pulse text-sm font-medium text-brand-muted">Loading...</p>
      </div>
    </div>
  )
}

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

  useEffect(() => {
    if (isTabletCompact) {
      setIsCollapsed(true)
    }
  }, [isTabletCompact])

  const showCompact = isCollapsed

  return (
    <div className={cn('relative h-dvh overflow-hidden text-brand-text', uiTokens.shellBg)}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 md:flex md:flex-col transition-[width] duration-300 ease-in-out overflow-hidden',
          uiTokens.sidebarBg,
          showCompact ? 'w-[5.75rem]' : 'w-[18.5rem]',
        )}
      >
        <div
          className={cn(
            'relative z-10 flex h-16 shrink-0 items-center border-b border-white/5',
            showCompact ? 'justify-center px-2' : 'gap-2 px-3 pr-2',
          )}
        >
          {showCompact ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="grid size-10 place-items-center rounded-xl text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30"
              aria-label="Expand sidebar"
            >
              <PanelLeftClose className="size-5" strokeWidth={1.75} />
            </button>
          ) : (
            <>
              <SidebarBrand className="min-w-0 flex-1 overflow-hidden" />
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-5" strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1">
          <Sidebar compact={showCompact} />
        </div>
      </aside>

      <SidebarMobile open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationPanel
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <div
        className={cn(
          'relative flex h-dvh min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300 ease-in-out',
          showCompact ? 'md:pl-[5.75rem]' : 'md:pl-[18.5rem]',
        )}
      >
        <Topbar
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          notificationsOpen={isNotificationsOpen}
          onNotificationsOpen={() => setIsNotificationsOpen(true)}
          showCompact={showCompact}
        />
        <main
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
          style={{ overflowY: !isDesktopShell && isSidebarOpen ? 'hidden' : 'auto' }}
        >
          <div className="py-4 lg:py-6">
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
