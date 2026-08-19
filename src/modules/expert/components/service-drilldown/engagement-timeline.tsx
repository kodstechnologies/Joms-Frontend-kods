import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Flag,
  Landmark,
  RefreshCcw,
  Timer,
} from 'lucide-react'

import { cn } from '@/shared/lib/cn'

import type { OrderTimelineStep } from '../../type/service-drilldown'
import { DASH, formatTimelineStamp } from './drilldown-format'

const VISIBLE_STEPS = 5

const ICON_BY_KEY: Record<string, LucideIcon> = {
  quote: FileText,
  response: Timer,
  flag: Flag,
  payment: Landmark,
  payment_complete: RefreshCcw,
}

const iconFor = (step: OrderTimelineStep): LucideIcon => {
  if (step.icon && ICON_BY_KEY[step.icon]) return ICON_BY_KEY[step.icon]
  const label = step.label.toLowerCase()
  if (label.includes('quot')) return FileText
  if (label.includes('response') || label.includes('accepted')) return Timer
  if (label.includes('completed') && label.includes('payment')) return RefreshCcw
  if (label.includes('payment')) return Landmark
  if (label.includes('approved') || label.includes('client')) return Flag
  return ClipboardList
}

export function EngagementTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  const [offset, setOffset] = useState(0)
  const maxOffset = Math.max(0, steps.length - VISIBLE_STEPS)
  const visible = steps.slice(offset, offset + VISIBLE_STEPS)
  const canPage = steps.length > VISIBLE_STEPS

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Timelines</h3>
        {canPage ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous timeline steps"
              disabled={offset === 0}
              onClick={() => setOffset((current) => Math.max(0, current - 1))}
              className="grid size-8 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next timeline steps"
              disabled={offset >= maxOffset}
              onClick={() => setOffset((current) => Math.min(maxOffset, current + 1))}
              className="grid size-8 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full border border-white/20 text-white/40">
              <ChevronLeft className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-full border border-white/20 text-white/40">
              <ChevronRight className="size-4" />
            </span>
          </div>
        )}
      </div>

      {steps.length === 0 ? (
        <p className="text-muted text-sm">No timeline events yet.</p>
      ) : (
        <ol
          className="relative grid gap-4"
          style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
        >
          <div className="bg-brand-accent/70 absolute right-6 bottom-[18px] left-6 h-px" />
          {visible.map((item, index) => {
            const Icon = iconFor(item)
            return (
              <li
                key={`${item.label}-${item.at || 'pending'}-${offset + index}`}
                className="relative flex flex-col"
              >
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-muted mt-1 text-[11px]">
                  {item.at ? formatTimelineStamp(item.at) : DASH}
                </p>
                <p className="mt-1 min-h-[40px] text-[12px] leading-relaxed text-white/80">
                  {item.detail || DASH}
                </p>
                <div
                  className={cn(
                    'border-brand-accent bg-brand-bg relative z-10 mt-4 grid size-9 place-items-center rounded-full border',
                    item.complete ? 'text-white' : 'text-muted opacity-50',
                  )}
                >
                  <Icon className="size-4" />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
