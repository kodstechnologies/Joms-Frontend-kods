import { CalendarDays, CircleArrowDown, CircleArrowUp, CircleX, Monitor, X } from 'lucide-react'
import type { ComponentType } from 'react'
import { toast } from 'sonner'

import type { MembershipSubscription } from '../types/membership-subscription'
import {
  formatMembershipTimelineDate,
  formatMembershipTimelineTime,
  getHistoryActionDescription,
  getHistoryActionTitle,
} from '../utils/membership-format'

type MembershipHistoryModalProps = {
  open: boolean
  onClose: () => void
  subscription: MembershipSubscription
}

const TIMELINE_GOLD = '#D48D3B'

const ACTION_ICONS: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  purchase: Monitor,
  upgrade: CircleArrowUp,
  downgrade: CircleArrowDown,
  cancel: CircleX,
  extend: CalendarDays,
}

export function MembershipHistoryModal({
  open,
  onClose,
  subscription,
}: MembershipHistoryModalProps) {
  if (!open) return null

  const history = [...(subscription.actionHistory ?? [])].sort((a, b) => {
    const aTime = a.performedAt ? new Date(a.performedAt).getTime() : 0
    const bTime = b.performedAt ? new Date(b.performedAt).getTime() : 0
    return aTime - bTime
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      {/* Figma: 723×519, #141414, radius 10 */}
      <div
        className="flex h-[min(519px,85vh)] w-full max-w-[723px] flex-col overflow-hidden rounded-[10px] bg-[#141414]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-history-title"
      >
        <div className="flex shrink-0 items-start justify-between px-6 pt-5 pb-4">
          <div>
            <h2
              id="membership-history-title"
              className="text-[20px] leading-7 font-semibold text-white"
            >
              Membership History
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-white/45">
              View all membership transactions made by the user
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] p-1.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close membership history"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {history.length ? (
            <div className="relative">
              {history.map((entry, index) => {
                const Icon = ACTION_ICONS[entry.action] ?? Monitor
                const performedAt = entry.performedAt ?? subscription.startedAt
                const isLast = index === history.length - 1

                return (
                  <div
                    key={`${entry.action}-${performedAt}-${index}`}
                    className="relative flex gap-4"
                  >
                    {/* Date + calendar — left of timeline */}
                    <div className="flex w-[52px] shrink-0 flex-col items-center pt-0.5">
                      <p className="text-[12px] leading-4 whitespace-nowrap text-white/45">
                        {formatMembershipTimelineDate(performedAt)}
                      </p>
                      <CalendarDays className="mt-1.5 size-3.5 text-white/40" strokeWidth={1.75} />
                    </div>

                    {/* Timeline column */}
                    <div className="relative flex w-8 shrink-0 flex-col items-center">
                      {!isLast ? (
                        <div
                          className="absolute top-4 bottom-0 w-px"
                          style={{ backgroundColor: TIMELINE_GOLD }}
                        />
                      ) : null}
                      <div
                        className="relative z-10 flex size-8 items-center justify-center rounded-full border bg-[#141414]"
                        style={{ borderColor: TIMELINE_GOLD }}
                      >
                        <Icon className="size-4 text-[#D48D3B]" strokeWidth={1.75} />
                      </div>
                    </div>

                    {/* Content + invoice button */}
                    <div className={`min-w-0 flex-1 ${isLast ? 'pb-1' : 'pb-7'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 pt-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <h3 className="text-[14px] leading-5 font-semibold text-white">
                              {getHistoryActionTitle(entry.action)}
                            </h3>
                            <span className="text-[12px] leading-4 text-white/45">
                              {formatMembershipTimelineTime(performedAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] leading-5 text-white/45">
                            {getHistoryActionDescription(entry, subscription.purchasedPrice)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toast.info('Invoice view coming soon')}
                          className="mt-0.5 inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-white/40 px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-white/5"
                        >
                          View Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-white/45">
              No membership history available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
