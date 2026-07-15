import { useEffect, useMemo } from 'react'
import { Bell, CalendarDays, FileText, UserRound, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type NotificationCategory = 'user' | 'events' | 'moderation'

type NotificationItem = {
  id: string
  category: NotificationCategory
  title: string
  message: string
  requester: string
  createdAt: string
  group: 'today' | 'older'
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: 'user',
    title: 'User Management',
    message: 'Application Review Requested',
    requester: 'Admin',
    createdAt: '5 hr ago',
    group: 'today',
  },
  {
    id: '2',
    category: 'events',
    title: 'Events',
    message: 'Event Host Application Review',
    requester: 'Manager',
    createdAt: '5 hr ago',
    group: 'today',
  },
  {
    id: '3',
    category: 'moderation',
    title: 'Content Moderation',
    message: 'Content Flagged for Review',
    requester: 'Admin',
    createdAt: '5 hr ago',
    group: 'today',
  },
  {
    id: '4',
    category: 'user',
    title: 'User Management',
    message: 'Application Review Requested',
    requester: 'Admin',
    createdAt: '1 day ago',
    group: 'older',
  },
  {
    id: '5',
    category: 'events',
    title: 'Events',
    message: 'Event Host Application Review',
    requester: 'Manager',
    createdAt: '1 day ago',
    group: 'older',
  },
]

const CATEGORY_ICONS: Record<NotificationCategory, typeof Bell> = {
  user: UserRound,
  events: CalendarDays,
  moderation: FileText,
}

function NotificationIcon({ category }: { category: NotificationCategory }) {
  const Icon = CATEGORY_ICONS[category]

  return (
    <div className="text-brand-stroke grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
      <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
    </div>
  )
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <li className="border-b border-white/10 last:border-b-0">
      <div className="flex gap-3.5 px-5 py-4">
        <NotificationIcon category={item.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-brand-text text-[15px] leading-snug font-semibold">{item.title}</p>
            <span className="text-brand-muted shrink-0 pt-0.5 text-xs">{item.createdAt}</span>
          </div>
          <p className="text-brand-muted mt-1 text-sm leading-relaxed">{item.message}</p>
          <p className="text-brand-muted mt-1 text-sm leading-relaxed">
            Requester: {item.requester}
          </p>
        </div>
      </div>
    </li>
  )
}

function NotificationSection({ label, items }: { label: string; items: NotificationItem[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <p className="text-brand-muted px-5 pt-5 pb-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
        {label}
      </p>
      <ul>
        {items.map((item) => (
          <NotificationRow key={item.id} item={item} />
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
  const notifications = INITIAL_NOTIFICATIONS
  const totalCount = notifications.length

  const todayItems = useMemo(
    () => notifications.filter((item) => item.group === 'today'),
    [notifications],
  )

  const olderItems = useMemo(
    () => notifications.filter((item) => item.group === 'older'),
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

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} aria-hidden="true" />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[26rem] flex-col border-l border-white/10 bg-[#121212] shadow-[-18px_0_50px_rgba(0,0,0,0.45)] transition-transform duration-200',
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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="text-brand-muted grid size-12 place-items-center rounded-full bg-white/5">
                <Bell className="size-5" aria-hidden="true" />
              </div>
              <p className="text-brand-text text-sm font-semibold">No notifications</p>
              <p className="text-brand-muted text-xs leading-relaxed">
                New activity from operations will show up here.
              </p>
            </div>
          ) : (
            <>
              <NotificationSection label="Today" items={todayItems} />
              <NotificationSection label="Older" items={olderItems} />
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
  count?: number
}

export function NotificationTrigger({
  open,
  onOpen,
  count = INITIAL_NOTIFICATIONS.length,
}: NotificationTriggerProps) {
  return (
    <button
      type="button"
      aria-label={count > 0 ? `Notifications, ${count} items` : 'Notifications'}
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
