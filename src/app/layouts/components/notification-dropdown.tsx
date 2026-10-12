import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'

import {
  NOTIFICATION_PAGE_SIZE,
  useInboxInfiniteScroll,
  useInfiniteMyNotifications,
  useMarkNotificationRead,
  useUnreadNotificationCount,
  type InAppNotification,
} from '@/modules/notifications'
import { resolveAdminInboxNavigation } from '@/modules/notifications/utils/admin-inbox-navigation'
import {
  getInboxRowIcon,
  getNotificationCategoryLabel,
} from '@/modules/notifications/utils/inbox-icons'
import { formatInboxRelativeTime, splitInboxByDay } from '@/modules/notifications/utils/inbox-time'
import { cn } from '@/shared/lib/cn'

const getNotificationDetail = (item: InAppNotification) => {
  if (item.metadata?.requester) {
    return `Requester: ${item.metadata.requester}`
  }
  if (item.additionalNotes?.trim()) return item.additionalNotes.trim()
  return item.body
}

function NotificationIcon({ item }: { item: InAppNotification }) {
  const imageUrl = item.sender?.imageUrl || item.senderImageUrl
  const iconSrc = getInboxRowIcon(item)

  if (imageUrl && !/joms|admin/i.test(String(item.senderType || ''))) {
    return (
      <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/5">
        <img src={imageUrl} alt="" className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div className="text-brand-text grid size-10 shrink-0 place-items-center rounded-full bg-white/5">
      <img src={iconSrc} alt="" className="size-4 brightness-0 invert" />
    </div>
  )
}

function NotificationRow({
  item,
  selected,
  onSelect,
}: {
  item: InAppNotification
  selected: boolean
  onSelect: (item: InAppNotification) => void
}) {
  const category = getNotificationCategoryLabel(item)
  const detail = getNotificationDetail(item)

  return (
    <li className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={cn(
          'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]',
          selected && 'ring-brand-accent/70 bg-white/[0.03] ring-1 ring-inset',
          !item.isRead && 'bg-brand-accent/[0.03]',
        )}
      >
        <NotificationIcon item={item} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-body-md-semibold text-brand-text truncate leading-snug">
                {category}
              </p>
              <p className="text-brand-muted text-body-md mt-1 leading-snug">{item.title}</p>
              <p className="text-brand-muted text-body-sm mt-1 line-clamp-2 leading-relaxed">
                {detail}
              </p>
            </div>
            <span className="text-brand-muted text-body-sm shrink-0 pt-0.5">
              {formatInboxRelativeTime(item.createdAt)}
            </span>
          </div>
        </div>

        {!item.isRead ? (
          <span
            className="bg-brand-accent mt-1.5 size-2 shrink-0 rounded-full"
            aria-hidden="true"
          />
        ) : null}
      </button>
    </li>
  )
}

function NotificationSection({
  label,
  items,
  selectedId,
  onSelect,
}: {
  label: string
  items: InAppNotification[]
  selectedId: string | null
  onSelect: (item: InAppNotification) => void
}) {
  if (items.length === 0) return null

  return (
    <section>
      <p className="text-brand-muted text-body-sm-semibold px-5 pt-5 pb-2 tracking-[0.18em] uppercase">
        {label}
      </p>
      <ul>
        {items.map((item) => (
          <NotificationRow
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  )
}

type NotificationPanelProps = {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const navigate = useNavigate()
  const notificationsQuery = useInfiniteMyNotifications(
    open,
    'notification',
    NOTIFICATION_PAGE_SIZE,
  )
  const markReadMutation = useMarkNotificationRead()
  const notifications = notificationsQuery.notifications
  const totalCount = notificationsQuery.totalCount
  const { todayItems, olderItems } = useMemo(() => splitInboxByDay(notifications), [notifications])

  const selectedId = useMemo(
    () => notifications.find((item) => !item.isRead)?.id ?? notifications[0]?.id ?? null,
    [notifications],
  )

  const sentinelRef = useInboxInfiniteScroll({
    enabled: open,
    hasNextPage: Boolean(notificationsQuery.hasNextPage),
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
    fetchNextPage: () => {
      void notificationsQuery.fetchNextPage()
    },
    itemCount: notifications.length,
  })

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const handleSelect = (item: InAppNotification) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id)
    }
    const target = resolveAdminInboxNavigation(item)
    onClose()
    navigate(target.path, target.state ? { state: target.state } : undefined)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="bg-brand-surface pointer-events-auto fixed inset-y-0 right-0 z-50 flex w-full max-w-[26rem] translate-x-0 flex-col border-l border-white/10 shadow-[-18px_0_50px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <h2 className="text-brand-text text-lg font-semibold tracking-tight">
            Notifications ({totalCount})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md text-brand-muted hover:text-brand-text focus-visible:ring-brand-accent/30 grid size-9 place-items-center transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Close notifications panel"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {notificationsQuery.isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="border-brand-accent size-8 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-brand-muted text-xs">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="text-brand-muted grid size-12 place-items-center rounded-full bg-white/5">
                <Bell className="size-5" aria-hidden="true" />
              </div>
              <p className="text-brand-text text-sm font-semibold">No notifications</p>
              <p className="text-brand-muted text-xs leading-relaxed">
                Account, support, and moderation updates will show up here.
              </p>
            </div>
          ) : (
            <>
              <NotificationSection
                label="Today"
                items={todayItems}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
              <NotificationSection
                label="Older"
                items={olderItems}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
              <div ref={sentinelRef} className="h-8 w-full" aria-hidden="true" />
              {notificationsQuery.isFetchingNextPage ? (
                <div className="flex items-center justify-center gap-2 px-6 py-4">
                  <div className="border-brand-accent size-5 animate-spin rounded-full border-2 border-t-transparent" />
                  <p className="text-brand-muted text-xs">Loading more...</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  )
}

type NotificationTriggerProps = {
  open: boolean
  onOpen: () => void
}

export function NotificationTrigger({ open, onOpen }: NotificationTriggerProps) {
  const unreadQuery = useUnreadNotificationCount('notification')
  const count = unreadQuery.data ?? 0

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onOpen}
      className={cn(
        'rounded-brand-md bg-brand-surface text-brand-stroke relative grid size-10 place-items-center border border-white/10 transition-colors',
        'hover:border-brand-accent-muted hover:bg-white/7',
        'focus-visible:ring-brand-accent/30 focus-visible:ring-2 focus-visible:outline-none',
        open && 'border-brand-accent-muted text-brand-text bg-white/7',
      )}
    >
      <Bell className="size-5" />
      {count > 0 ? (
        <span className="bg-brand-accent absolute top-1.5 right-1.5 size-2 rounded-full" />
      ) : null}
    </button>
  )
}
