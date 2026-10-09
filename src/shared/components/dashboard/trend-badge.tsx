import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export type TrendBadgeTone = 'positive' | 'danger'

type TrendBadgeProps = {
  tone?: TrendBadgeTone
  direction?: 'up' | 'down'
  children: ReactNode
  className?: string
  hideIcon?: boolean
  icon?: ReactNode
}

const TONE_CLASS: Record<TrendBadgeTone, string> = {
  positive: 'ui-trend-badge-positive',
  danger: 'ui-trend-badge-danger',
}

export function formatTrendPercent(percentage: number, direction?: 'up' | 'down'): string {
  const abs = Math.abs(percentage)
  if (abs === 0) return '0%'
  const isDown = direction === 'down' || (direction == null && percentage < 0)
  return `${isDown ? '-' : '+'}${abs}%`
}

export function ensureTrendChangeSign(change: string, direction?: 'up' | 'down'): string {
  const trimmed = change.trim()
  if (!trimmed) return trimmed

  const hasMinus = trimmed.startsWith('-')
  const hasPlus = trimmed.startsWith('+')
  const body = hasMinus || hasPlus ? trimmed.slice(1) : trimmed
  const numeric = Number.parseFloat(body.replace(/%/g, ''))

  if (!Number.isFinite(numeric)) {
    if (direction === 'down' && !hasMinus) return `-${body}`
    if (direction === 'up' && !hasPlus && !hasMinus) return `+${body}`
    return trimmed
  }

  if (numeric === 0) return body.includes('%') ? '0%' : '0'
  const isDown = direction === 'down' || (direction == null && (hasMinus || numeric < 0))
  const absBody = body.replace(/^-/, '')
  return `${isDown ? '-' : '+'}${absBody}`
}

function ArrowGrowthIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className={cn('ui-trend-badge-icon', className)}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21.92 6.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 6h-5a1 1 0 0 0 0 2h2.59L13 13.59l-3.29-3.3a1 1 0 0 0-1.42 0l-6 6a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L9 12.41l3.29 3.3a1 1 0 0 0 1.42 0L20 9.41V12a1 1 0 0 0 2 0V7a1 1 0 0 0-.08-.38" />
    </svg>
  )
}

function ChartDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className={cn('ui-trend-badge-icon', className)}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 11a1 1 0 0 0-1 1v2.59l-6.29-6.3a1 1 0 0 0-1.42 0L9 11.59l-5.29-5.3a1 1 0 0 0-1.42 1.42l6 6a1 1 0 0 0 1.42 0l3.29-3.3L18.59 16H16a1 1 0 0 0 0 2h5a1 1 0 0 0 .38-.08a1 1 0 0 0 .54-.54A1 1 0 0 0 22 17v-5a1 1 0 0 0-1-1" />
    </svg>
  )
}

export function TrendBadge({
  tone,
  direction,
  children,
  className,
  hideIcon = false,
  icon,
}: TrendBadgeProps) {
  const resolvedTone: TrendBadgeTone = tone ?? (direction === 'down' ? 'danger' : 'positive')
  const isUp = direction ? direction === 'up' : resolvedTone === 'positive'

  const resolvedIcon = icon ?? (hideIcon ? null : isUp ? <ArrowGrowthIcon /> : <ChartDownIcon />)

  return (
    <span className={cn('ui-trend-badge', TONE_CLASS[resolvedTone], className)}>
      {resolvedIcon}
      <span className="ui-trend-badge-value">{children}</span>
    </span>
  )
}
