import { useEffect, useMemo } from 'react'
import { AlertTriangle, Bell, ExternalLink, X } from 'lucide-react'

import { INITIAL_ALERTS, type AlertItem } from '@/app/layouts/mock/alerts.mock'
import { cn } from '@/shared/lib/cn'

function AlertAvatars({ initials }: { initials: string[] }) {
  return (
    <div className="mt-2.5 flex items-center">
      {initials.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={cn(
            'text-body-sm-semibold border-brand-surface text-brand-text grid size-7 place-items-center rounded-full border-2',
            index === 0 ? 'bg-brand-teal' : 'bg-brand-accent',
            index > 0 && '-ml-2',
          )}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}

function AlertRow({ item }: { item: AlertItem }) {
  const isWarning = item.severity === 'warning'

  return (
    <li className="border-b border-white/10 last:border-b-0">
      <div
        className={cn(
          'relative flex gap-3 px-5 py-4',
          isWarning && 'border-l-brand-accent bg-brand-accent/[0.04] border-l-[3px]',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              {isWarning ? (
                <AlertTriangle
                  className="text-brand-accent size-3.5 shrink-0"
                  aria-hidden="true"
                  strokeWidth={2}
                />
              ) : (
                <Bell className="text-brand-muted size-3.5 shrink-0" aria-hidden="true" />
              )}
              <p
                className={cn(
                  'text-body-md-semibold leading-snug',
                  isWarning ? 'text-brand-accent' : 'text-brand-text',
                )}
              >
                {isWarning ? 'Warning' : 'Info'}
              </p>
              <ExternalLink
                className="text-brand-muted size-3.5 shrink-0 opacity-70"
                aria-hidden="true"
              />
            </div>
            <span className="text-brand-muted text-body-sm shrink-0 pt-0.5">{item.createdAt}</span>
          </div>

          <p className="text-body-md-semibold text-brand-text mt-2 leading-snug">{item.title}</p>
          <p className="text-brand-muted text-body-md mt-1 leading-relaxed">{item.message}</p>

          {item.avatars?.length ? <AlertAvatars initials={item.avatars} /> : null}
        </div>
      </div>
    </li>
  )
}

function AlertSection({ label, items }: { label: string; items: AlertItem[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <p className="text-brand-muted text-body-sm-semibold px-5 pt-5 pb-2 tracking-[0.18em] uppercase">
        {label}
      </p>
      <ul>
        {items.map((item) => (
          <AlertRow key={item.id} item={item} />
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
  const alerts = INITIAL_ALERTS
  const totalCount = alerts.length

  const todayItems = useMemo(() => alerts.filter((item) => item.group === 'today'), [alerts])

  const olderItems = useMemo(() => alerts.filter((item) => item.group === 'older'), [alerts])

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
          'bg-brand-surface fixed inset-y-0 right-0 z-50 flex w-full max-w-[26rem] flex-col border-l border-white/10 shadow-[-18px_0_50px_rgba(0,0,0,0.45)] transition-transform duration-200',
          open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Alerts"
        aria-hidden={!open}
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
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="text-brand-muted grid size-12 place-items-center rounded-full bg-white/5">
                <Bell className="size-5" aria-hidden="true" />
              </div>
              <p className="text-brand-text text-sm font-semibold">No alerts</p>
              <p className="text-brand-muted text-xs leading-relaxed">
                Platform warnings and payment gateway issues will show up here.
              </p>
            </div>
          ) : (
            <>
              <AlertSection label="Today" items={todayItems} />
              <AlertSection label="Older" items={olderItems} />
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
  count = INITIAL_ALERTS.length,
}: NotificationTriggerProps) {
  return (
    <button
      type="button"
      aria-label={count > 0 ? `Alerts, ${count} items` : 'Alerts'}
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
