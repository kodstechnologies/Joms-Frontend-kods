import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-white/10', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'radius-lg bg-brand-surface flex min-h-[130px] flex-col justify-center border border-white/[0.06] p-5',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="mt-3 h-8 w-24" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function ChartSkeleton({
  title,
  height = '280px',
  className,
}: {
  title?: string
  height?: string
  className?: string
}) {
  return (
    <div
      className={cn('radius-lg bg-brand-surface border border-white/[0.06] p-5', className)}
      aria-hidden="true"
    >
      {title ? (
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="size-6 rounded-md" />
        </div>
      ) : null}
      <div style={{ height }} className="flex w-full flex-col justify-end gap-3 pt-4">
        <div className="flex flex-1 items-end gap-3 px-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <Skeleton
                className="w-full rounded-t"
                style={{ height: `${25 + ((i * 37) % 65)}%` }}
              />
              <Skeleton className="h-2.5 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DetailViewSkeleton({
  pillCount = 6,
  cardCount = 2,
}: {
  pillCount?: number
  cardCount?: number
}) {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex items-start gap-3">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: pillCount }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[110px] flex-1 flex-col items-center gap-2 rounded-lg border border-white/5 bg-black/40 p-3"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {Array.from({ length: cardCount }).map((_, i) => (
        <div
          key={i}
          className="radius-lg bg-brand-surface space-y-4 border border-white/[0.06] p-5"
        >
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0"
              >
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
