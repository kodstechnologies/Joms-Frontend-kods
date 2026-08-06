import { useEffect, useMemo } from 'react'
import { Bell, FileText, X } from 'lucide-react'

import {
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadNotificationCount,
  type InAppNotification,
} from '@/modules/notifications'
import { cn } from '@/shared/lib/cn'

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const formatRelativeTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const getNotificationCategory = (item: InAppNotification) =>
  item.metadata?.category || item.metadata?.typeLabel || 'Communication'

const getNotificationDetail = (item: InAppNotification) => {
  if (item.metadata?.requester) {
    return `Requester: ${item.metadata.requester}`
  }
  if (item.additionalNotes?.trim()) return item.additionalNotes.trim()
  return item.body
}

function NotificationIcon({ item }: { item: InAppNotification }) {
  const imageUrl = item.sender?.imageUrl || item.senderImageUrl
  const category = getNotificationCategory(item)
  const isModeration = /moderation|content|report/i.test(category)

  if (imageUrl) {
    return (
      <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/5">
        <img
          src={imageUrl}
          alt="Sender"
          className="size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  return (
    <div className="text-brand-text grid size-10 shrink-0 place-items-center rounded-full bg-white/5">
      {isModeration ? (
        <FileText className="size-4" aria-hidden="true" />
      ) : (
        <Bell className="size-4" aria-hidden="true" />
      )}
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
  onSelect: (id: string) => void
}) {
  const category = getNotificationCategory(item)
  const detail = getNotificationDetail(item)

  return (
    <li className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
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
              {formatRelativeTime(item.createdAt)}
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
  onSelect: (id: string) => void
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
  const notificationsQuery = useMyNotifications(open)
  const markReadMutation = useMarkNotificationRead()
  const notifications = notificationsQuery.data?.data ?? []
  const totalCount = notificationsQuery.data?.meta?.total ?? notifications.length

  const { todayItems, olderItems } = useMemo(() => {
    const today: InAppNotification[] = []
    const older: InAppNotification[] = []
    const now = new Date()

    notifications.forEach((item) => {
      const createdAt = new Date(item.createdAt)
      if (!Number.isNaN(createdAt.getTime()) && isSameDay(createdAt, now)) {
        today.push(item)
      } else {
        older.push(item)
      }
    })

    return { todayItems: today, olderItems: older }
  }, [notifications])

  const selectedId = useMemo(
    () => notifications.find((item) => !item.isRead)?.id ?? notifications[0]?.id ?? null,
    [notifications],
  )

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

  const handleSelect = (id: string) => {
    const item = notifications.find((entry) => entry.id === id)
    if (item && !item.isRead) {
      markReadMutation.mutate(id)
    }
  }

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} aria-hidden="true" />
      ) : null}

      <aside
        className={cn(
          'bg-brand-surface fixed inset-y-0 right-0 z-50 flex w-full max-w-[26rem] flex-col border-l border-white/10 shadow-[-18px_0_50px_rgba(0,0,0,0.45)] transition-transform duration-200',
          open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        aria-hidden={!open}
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
          {notificationsQuery.isLoading ? (
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
                In-app messages from Communication Management will show up here.
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
            </>
          )}
        </div>
      </aside>
    </>
  )
}

type NotificationTriggerProps = {
  open: boolean
  onOpen: () => void
}

export function NotificationTrigger({ open, onOpen }: NotificationTriggerProps) {
  const unreadQuery = useUnreadNotificationCount()
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
