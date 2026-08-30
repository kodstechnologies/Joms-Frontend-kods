import { CalendarDays, CircleArrowDown, CircleArrowUp, CircleX, Monitor, X } from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import type { ComponentType } from 'react'
import { toast } from 'sonner'

import { useBranding } from '@/app/providers/use-branding'
import {
  downloadInvoiceDocument,
  invoiceFromMembershipSubscription,
} from '@/shared/utils/invoice-document'

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
  const { logoUrl } = useBranding()

  if (!open) return null

  const history = [...(subscription.actionHistory ?? [])].sort((a, b) => {
    const aTime = a.performedAt ? new Date(a.performedAt).getTime() : 0
    const bTime = b.performedAt ? new Date(b.performedAt).getTime() : 0
    return aTime - bTime
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ui-modal-shell h-[min(519px,85vh)] max-w-[723px]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-history-title"
      >
        <div className="ui-modal-header items-start">
          <div>
            <h2 id="membership-history-title" className="text-h3 text-brand-text">
              Membership History
            </h2>
            <p className="text-muted text-body-sm mt-1">
              View all membership transactions made by the user
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-brand-text rounded-brand-md p-1.5 transition-colors hover:bg-white/5"
            aria-label="Close membership history"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="ui-modal-body">
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
                    <div className="flex w-[52px] shrink-0 flex-col items-center pt-0.5">
                      <p className="text-muted text-body-sm leading-4 whitespace-nowrap">
                        {formatMembershipTimelineDate(performedAt)}
                      </p>
                      <img
                        src={calendarIcon}
                        alt="calendar"
                        className="text-muted mt-1.5 size-3.5"
                        style={{ filter: 'brightness(0) invert(1)' }}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="relative flex w-8 shrink-0 flex-col items-center">
                      {!isLast ? (
                        <div className="bg-brand-accent absolute top-4 bottom-0 w-px" />
                      ) : null}
                      <div className="border-brand-accent bg-brand-surface relative z-10 flex size-8 items-center justify-center rounded-full border">
                        <Icon className="text-brand-accent size-4" strokeWidth={1.75} />
                      </div>
                    </div>

                    <div className={`min-w-0 flex-1 ${isLast ? 'pb-1' : 'pb-7'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 pt-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <h3 className="text-body-md text-brand-text font-semibold">
                              {getHistoryActionTitle(entry.action)}
                            </h3>
                            <span className="text-muted text-body-sm leading-4">
                              {formatMembershipTimelineTime(performedAt)}
                            </span>
                          </div>
                          <p className="text-muted text-body-sm mt-1">
                            {getHistoryActionDescription(entry, subscription.purchasedPrice)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            void downloadInvoiceDocument(
                              invoiceFromMembershipSubscription(subscription, {
                                logoUrl,
                                historyAction: getHistoryActionTitle(entry.action),
                              }),
                              `${subscription.subscriptionId}-${entry.action}`,
                            )
                              .then(() => toast.success('Invoice downloaded'))
                              .catch(() => toast.error('Failed to download invoice'))
                          }}
                          className="ui-cta ui-cta-outline mt-0.5 h-8 shrink-0 rounded-full px-3.5"
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
            <p className="text-muted text-body-sm py-10 text-center">
              No membership history available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
