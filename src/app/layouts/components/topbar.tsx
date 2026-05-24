import { Bell, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { navigationConfig } from '@/app/layouts/navigation/navigation.config'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

function getTitleFromNav(pathname: string) {
  for (const group of navigationConfig) {
    for (const child of group.children ?? []) {
      if (child.to && pathname.startsWith(child.to)) {
        return child.label
      }
    }
  }
  return 'Executive Overview'
}

export function Topbar({ onMenuClick, onToggleCollapse }: { onMenuClick: () => void; onToggleCollapse: () => void }) {
  const location = useLocation()
  const title = getTitleFromNav(location.pathname)

  return (
    <header className={cn('sticky top-0 z-30 backdrop-blur', uiTokens.headerBg)}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-2 text-slate-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30 md:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-slate-50">{title}</p>
            <p className="text-xs leading-relaxed text-slate-400">Command Operations Centre</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-colors hover:border-white/15 hover:bg-white/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-amber-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className={cn('hidden text-right sm:block')}>
              <p className="text-sm font-semibold text-slate-100">Super Admin</p>
              <p className="text-[11px] text-slate-400">Last login: 11/02/2026 · 05:29</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-amber-400/20 to-fuchsia-500/10 text-sm font-semibold text-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.45)]">
              <span className="translate-y-0.5">S</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
