import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  ShoppingCart,
  X,
  XCircle,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { toast } from 'sonner'

import type { MembershipSubscription } from '../types/membership-subscription'
import {
  formatMembershipTimelineDate,
  formatMembershipTimelineTime,
  getHistoryActionDescription,
  getHistoryActionTitle,
} from '../utils/membership-format'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type MembershipHistoryModalProps = {
  open: boolean
  onClose: () => void
  subscription: MembershipSubscription
}

const ACTION_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  purchase: ShoppingCart,
  upgrade: ArrowUpCircle,
  downgrade: ArrowDownCircle,
  cancel: XCircle,
  extend: Calendar,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">Membership History</h2>
            <p className="mt-1 text-sm text-slate-400">
              View all membership transactions made by the user
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(85vh-88px)] overflow-y-auto px-6 py-6">
          {history.length ? (
            <div className="space-y-0">
              {history.map((entry, index) => {
                const Icon = ACTION_ICONS[entry.action] ?? ShoppingCart
                const performedAt = entry.performedAt ?? subscription.startedAt

                return (
                  <div key={`${entry.action}-${index}`} className="relative flex gap-5">
                    <div className="w-14 shrink-0 pt-1 text-right">
                      <p className="text-sm font-medium text-white">
                        {formatMembershipTimelineDate(performedAt)}
                      </p>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'relative z-10 flex size-9 items-center justify-center rounded-full border border-amber-500/30 bg-[#1a1a1a]',
                        )}
                      >
                        <Icon className="size-4 text-amber-300" />
                      </div>
                      {index < history.length - 1 ? (
                        <div className="absolute top-9 bottom-0 w-px bg-amber-500/25" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 border-b border-white/5 pb-6 last:border-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">
                              {getHistoryActionTitle(entry.action)}
                            </h3>
                            <span className="text-xs text-slate-500">
                              {formatMembershipTimelineTime(performedAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">
                            {getHistoryActionDescription(entry, subscription.purchasedPrice)}
                          </p>
                        </div>

                        <Button
                          variant="secondary"
                          className="shrink-0 px-4 py-2 text-xs"
                          onClick={() => toast.info('Invoice view coming soon')}
                        >
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">
              No membership history available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
