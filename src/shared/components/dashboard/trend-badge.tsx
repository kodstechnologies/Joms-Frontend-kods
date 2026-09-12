import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export type TrendBadgeTone = 'positive' | 'danger'

type TrendBadgeProps = {
  tone?: TrendBadgeTone
  /** When set, drives the icon and defaults tone if not provided. */
  direction?: 'up' | 'down'
  children: ReactNode
  className?: string
  /** Hide the default trending icon. */
  hideIcon?: boolean
  /** Replace the default trending icon (e.g. Clock3). */
  icon?: ReactNode
}

const TONE_CLASS: Record<TrendBadgeTone, string> = {
  positive: 'ui-trend-badge-positive',
  danger: 'ui-trend-badge-danger',
}

/**
 * Formats a trend % for the badge.
 * Backend may send a signed `changePercent` (e.g. -5.2) and/or `direction`.
 * Always shows `+` / `-` with the absolute value (except exact 0 → `0%`).
 */
export function formatTrendPercent(percentage: number, direction?: 'up' | 'down'): string {
  const abs = Math.abs(percentage)
  if (abs === 0) return '0%'
  const isDown = direction === 'down' || (direction == null && percentage < 0)
  return `${isDown ? '-' : '+'}${abs}%`
}

/**
 * Ensures a backend change string (e.g. "5.2%" or "-5.2%") shows the correct sign
 * for the badge direction. Avoids double signs.
 */
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

/**
 * Unicons `uil:arrow-growth`
 * Figma: 16×16 icon frame. Path fills #00A63E; vector bounds ≈ 13.34×8 at (1.33, 4).
 */
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

/** Unicons `uil:chart-down` — same 16×16 frame as arrow-growth */
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

/**
 * Figma `ui-trend-badge ui-trend-badge-positive`
 * — min 69×33 · radius 10 · pad 8×6 · gap 5 · bg #00A63E33 (grows with value)
 * — icon 16×16 (uil:arrow-growth) · value min 36×17 Figtree Medium 14/17 · #00A63E
 */
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
