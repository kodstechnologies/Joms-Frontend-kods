import { useMemo } from 'react'

import { SidebarGroup } from '@/app/layouts/components/sidebar-group'
import { getVisibleNavigation } from '@/app/layouts/navigation/navigation.filter'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { LogOut } from 'lucide-react'

export function Sidebar({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const clearSession = useAuthStore((state) => state.clearSession)
  const user = useAuthStore((state) => state.user)
  const visibleNavigation = useMemo(() => getVisibleNavigation(user), [user])

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col px-3 pb-6 pt-1 md:h-[calc(100dvh-3.5rem)]">
      <div className={compact ? 'mb-4 flex items-center justify-center' : 'mb-5 mt-2 px-2'}>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-brand-accent" />
          {!compact ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
              JOMS Applications
            </p>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pb-4">
        {visibleNavigation.map((item) => (
          <SidebarGroup key={item.key} item={item} compact={compact} onNavigate={onNavigate} />
        ))}
      </nav>

      <button
        type="button"
        onClick={() => {
          clearSession()
          onNavigate?.()
        }}
        className="mt-2 flex items-center gap-2 rounded-brand-md border border-brand-danger/30 bg-brand-danger/10 px-3 py-2.5 text-sm font-semibold text-brand-danger transition-colors hover:bg-brand-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30"
        aria-label={compact ? 'Log Out' : 'Log Out'}
      >
        <LogOut className="size-4" />
        {!compact ? <span className="truncate">Log Out</span> : null}
      </button>
    </div>
  )
}
