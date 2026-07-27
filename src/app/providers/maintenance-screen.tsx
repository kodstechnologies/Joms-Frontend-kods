import { useMaintenance } from '@/app/providers/use-maintenance'

function formatWindow(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) return null
  const start = startsAt ? new Date(startsAt).toLocaleString() : 'now'
  const end = endsAt ? new Date(endsAt).toLocaleString() : 'until further notice'
  return `${start} → ${end}`
}

export function MaintenanceScreen() {
  const { status } = useMaintenance()
  const windowLabel = formatWindow(status.startsAt, status.endsAt)

  return (
    <div className="bg-brand-bg text-brand-text flex min-h-dvh items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="text-body-sm text-muted mb-2 tracking-wide uppercase">Maintenance Mode</p>
        <h1 className="text-h3 text-brand-text">{status.applicationName}</h1>
        <p className="text-body-md text-brand-text/80 mt-4 leading-relaxed">{status.message}</p>
        {status.adminNotes ? (
          <p className="text-body-sm text-muted mt-4 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
            {status.adminNotes}
          </p>
        ) : null}
        {windowLabel ? (
          <p className="text-body-sm text-muted mt-5">Scheduled window: {windowLabel}</p>
        ) : null}
        <p className="text-body-sm text-muted mt-6">
          Login and admin APIs are temporarily unavailable. Please try again later.
        </p>
      </div>
    </div>
  )
}
