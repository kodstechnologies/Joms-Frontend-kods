import { LogOut } from 'lucide-react'

import { SidebarGroup } from '@/app/layouts/components/sidebar-group'
import { navigationConfig } from '@/app/layouts/navigation/navigation.config'
import { useAuthStore } from '@/app/store/auth-store'

export function Sidebar({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const clearSession = useAuthStore((state) => state.clearSession)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col px-3 pb-6 pt-1 md:h-[calc(100dvh-3.5rem)]">
      <div className={compact ? 'mb-4 flex items-center justify-center' : 'mb-5 mt-2 px-2'}>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-amber-500" />
          {!compact ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              JOMS Applications
            </p>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pb-4">
        {navigationConfig.map((item) => (
          <SidebarGroup key={item.key} item={item} compact={compact} onNavigate={onNavigate} />
        ))}
      </nav>

      <button
        type="button"
        onClick={() => {
          clearSession()
          onNavigate?.()
        }}
        className="mt-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30"
        aria-label={compact ? 'Log Out' : 'Log Out'}
      >
        <LogOut className="size-4" />
        {!compact ? <span className="truncate">Log Out</span> : null}
      </button>
    </div>
  )
}
