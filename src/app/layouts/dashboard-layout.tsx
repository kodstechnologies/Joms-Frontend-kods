import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { Sidebar } from '@/app/layouts/components/sidebar'
import { SidebarMobile } from '@/app/layouts/components/sidebar-mobile'
import { Topbar } from '@/app/layouts/components/topbar'
import { PageContainer } from '@/shared/components/responsive/page-container'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { uiTokens } from '@/shared/lib/design-tokens'

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const isTabletCompact = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktopShell = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    // Mobile drawer: close on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false)
  }, [location.pathname])

  const sidebarWidth = isTabletCompact ? '5.75rem' : '18.5rem'

  return (
    <div className={['relative h-dvh overflow-hidden text-slate-100', uiTokens.shellBg].join(' ')}>
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 md:block',
          uiTokens.sidebarBg,
          'transition-[width] duration-300',
        ].join(' ')}
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-14 items-center px-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-500" />
            {!isTabletCompact ? (
              <p className="text-sm font-semibold tracking-tight text-slate-100">JOMS</p>
            ) : null}
          </div>
        </div>
        <Sidebar compact={isTabletCompact} />
      </aside>

      <SidebarMobile open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className="relative flex h-dvh min-w-0 flex-1 flex-col overflow-hidden"
        style={{ paddingLeft: isDesktopShell ? sidebarWidth : 0 }}
      >
        <Topbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        <main
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
          style={{ overflowY: !isDesktopShell && isSidebarOpen ? 'hidden' : 'auto' }}
        >
          <div className="py-4 lg:py-6">
            <PageContainer>
              <Outlet />
            </PageContainer>
          </div>
        </main>
      </div>
    </div>
  )
}
