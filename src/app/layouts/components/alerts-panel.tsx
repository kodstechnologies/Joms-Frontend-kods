import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Siren, X } from 'lucide-react'

import {
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadNotificationCount,
  type InAppNotification,
} from '@/modules/notifications'
import { resolveAdminInboxNavigation } from '@/modules/notifications/utils/admin-inbox-navigation'
import { formatInboxRelativeTime, splitInboxByDay } from '@/modules/notifications/utils/inbox-time'
import { cn } from '@/shared/lib/cn'

function AlertAvatars({ item }: { item: InAppNotification }) {
  const avatars = item.metadata?.reporterAvatars
  if (!Array.isArray(avatars) || avatars.length === 0) return null

  return (
    <div className="mt-2 flex -space-x-2">
      {avatars.slice(0, 3).map((entry, index) => {
        const label = String(entry || 'S')
          .trim()
          .charAt(0)
          .toUpperCase()
        const tones = ['bg-pink-400', 'bg-amber-300', 'bg-sky-400']
        return (
          <span
            key={`${label}-${index}`}
            className={cn(
              'grid size-6 place-items-center rounded-full text-[10px] font-semibold text-zinc-950 ring-2 ring-black',
              tones[index % tones.length],
            )}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}

function AlertRow({
  item,
  onOpen,
}: {
  item: InAppNotification
  onOpen: (item: InAppNotification) => void
}) {
  return (
    <li className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex w-full items-stretch gap-0 px-0 py-0 text-left hover:bg-white/[0.03]"
      >
        <span className="bg-brand-accent w-1 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-body-md-semibold text-brand-text">Warning</p>
              <ExternalLink className="text-brand-muted size-3.5 shrink-0" aria-hidden="true" />
            </div>
            <span className="text-brand-muted text-body-sm shrink-0">
              {formatInboxRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="text-brand-text text-body-md mt-2 leading-relaxed">{item.body}</p>
          <AlertAvatars item={item} />
        </div>
      </button>
    </li>
  )
}

type AlertsPanelProps = {
  open: boolean
  onClose: () => void
}

export function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  const navigate = useNavigate()
  const alertsQuery = useMyNotifications(open, 'alert')
  const markReadMutation = useMarkNotificationRead()
  const alerts = useMemo(() => alertsQuery.data?.data ?? [], [alertsQuery.data?.data])
  const totalCount = alertsQuery.data?.meta?.total ?? alerts.length
  const { todayItems, olderItems } = useMemo(() => splitInboxByDay(alerts), [alerts])

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

  const handleOpen = (item: InAppNotification) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id)
    }
    const target = resolveAdminInboxNavigation(item)
    onClose()
    navigate(target.path, target.state ? { state: target.state } : undefined)
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
        aria-label="Alerts"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <h2 className="text-brand-text text-lg font-semibold tracking-tight">
            Alerts ({totalCount})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md text-brand-muted hover:text-brand-text focus-visible:ring-brand-accent/30 grid size-9 place-items-center transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Close alerts panel"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {alertsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="border-brand-accent size-8 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-brand-muted text-xs">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="text-brand-muted grid size-12 place-items-center rounded-full bg-white/5">
                <Siren className="size-5" aria-hidden="true" />
              </div>
              <p className="text-brand-text text-sm font-semibold">No alerts</p>
              <p className="text-brand-muted text-xs leading-relaxed">
                Repeated reports and payment failures will appear here.
              </p>
            </div>
          ) : (
            <>
              {todayItems.length ? (
                <section>
                  <p className="text-brand-muted text-body-sm-semibold px-5 pt-5 pb-2 tracking-[0.18em] uppercase">
                    Today
                  </p>
                  <ul>
                    {todayItems.map((item) => (
                      <AlertRow key={item.id} item={item} onOpen={handleOpen} />
                    ))}
                  </ul>
                </section>
              ) : null}
              {olderItems.length ? (
                <section>
                  <p className="text-brand-muted text-body-sm-semibold px-5 pt-5 pb-2 tracking-[0.18em] uppercase">
                    Older
                  </p>
                  <ul>
                    {olderItems.map((item) => (
                      <AlertRow key={item.id} item={item} onOpen={handleOpen} />
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </>
  )
}

type AlertsTriggerProps = {
  open: boolean
  onOpen: () => void
}

export function AlertsTrigger({ open, onOpen }: AlertsTriggerProps) {
  const unreadQuery = useUnreadNotificationCount('alert')
  const count = unreadQuery.data ?? 0

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Alerts, ${count} unread` : 'Alerts'}
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
      <Siren className="size-5" />
      {count > 0 ? (
        <span className="bg-brand-accent absolute top-1.5 right-1.5 size-2 rounded-full" />
      ) : null}
    </button>
  )
}
