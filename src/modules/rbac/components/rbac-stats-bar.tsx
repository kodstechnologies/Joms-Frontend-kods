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

function RbacStatCard({
  label,
  value,
  isLoading,
}: {
  label: string
  value: string
  isLoading?: boolean
}) {
  return (
    <div className="referral-stats-card flex min-h-[96px] w-full flex-col p-4">
      <p className="referral-stats-label">{label}</p>
      <p className={cn('referral-stats-value mt-2', isLoading && 'animate-pulse')}>{value}</p>
    </div>
  )
}

export function RbacStatsBar({ stats, isLoading }: RbacStatsBarProps) {
  const primaryCards = cards.slice(0, 4)
  const secondaryCard = cards[4]

  const formatValue = (key: (typeof cards)[number]['key']) =>
    isLoading ? '—' : String(stats?.[key] ?? 0).padStart(2, '0')

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <RbacStatCard
            key={card.key}
            label={card.label}
            value={formatValue(card.key)}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RbacStatCard
          label={secondaryCard.label}
          value={formatValue(secondaryCard.key)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
