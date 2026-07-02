import type { RbacStats } from '../types/rbac'
import { cn } from '@/shared/lib/cn'

const cards = [
  { key: 'totalUsers', label: 'Total User' },
  { key: 'totalActiveUsers', label: 'Total active users' },
  { key: 'currentlyOnlineUsers', label: 'Currently online users' },
  { key: 'suspendedUsers', label: 'Suspended Users' },
  { key: 'totalRolesAvailable', label: 'Total Roles Available' },
] as const

type RbacStatsBarProps = {
  stats?: RbacStats
  isLoading?: boolean
}

export function RbacStatsBar({ stats, isLoading }: RbacStatsBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-white/10 bg-[#141414] px-4 py-4"
        >
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className={cn('mt-2 text-2xl font-semibold text-white', isLoading && 'animate-pulse')}>
            {isLoading ? '—' : String(stats?.[card.key] ?? 0).padStart(2, '0')}
          </p>
        </div>
      ))}
    </div>
  )
}
