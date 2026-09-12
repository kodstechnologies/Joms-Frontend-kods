import { Skeleton } from '@/shared/components/ui/skeleton'

import { StatCard } from '../stat-card'

export type CategoryMetricCard = {
  id: string
  title: string
  value: string
  isTextValue?: boolean
}

const TEXT_VALUE_METRIC_IDS = new Set([
  'top-revenue-category',
  'lowest-revenue-category',
  'highest-order-category',
  'lowest-order-category',
  'top-booking-category',
  'lowest-booking-category',
  'highest-booking-category',
])

function CategoryStatCardSkeleton() {
  return (
    <div
      className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4"
      aria-hidden="true"
    >
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="mt-3 h-8 w-24" />
    </div>
  )
}

export function CategoryStatsBar({
  metrics,
  isLoading,
  skeletonIds,
}: {
  metrics: CategoryMetricCard[]
  isLoading: boolean
  skeletonIds: string[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? skeletonIds.map((id) => <CategoryStatCardSkeleton key={id} />)
        : metrics.map((metric) => (
            <StatCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              isTextValue={metric.isTextValue ?? TEXT_VALUE_METRIC_IDS.has(metric.id)}
            />
          ))}
    </div>
  )
}
