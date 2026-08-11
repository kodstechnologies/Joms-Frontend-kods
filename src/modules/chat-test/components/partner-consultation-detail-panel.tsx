import { useEffect, useMemo, useState } from 'react'
import {
  getConsultationBooking,
  joinConsultationBooking,
  linkConsultationBookingThread,
  testStartConsultationJoinWindow,
  type ConsultationBooking,
  type ConsultationProjectCard,
} from '../api/consultation-booking.api'

type Props = {
  token: string
  project: ConsultationProjectCard
  onChanged?: () => void
  onError?: (message: string | null) => void
  onSuccess?: (message: string) => void
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function msUntil(iso: string) {
  return new Date(iso).getTime() - Date.now()
}

function countdownLabel(ms: number) {
  if (ms <= 0) return 'now'
  const totalSec = Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function jitsiMeetUrl(join: Record<string, unknown> | null | undefined) {
  if (!join) return null
  const server = String(join.serverURL || 'https://meet.jit.si').replace(/\/$/, '')
  const room = String(join.room || '')
  if (!room) return null
  return `${server}/${room}`
}

function FlowStep({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2 py-2 text-center text-[10px] font-medium ${
        done
          ? 'bg-emerald-500/15 text-emerald-300'
          : active
            ? 'bg-amber-400/15 text-amber-200'
            : 'bg-zinc-900 text-zinc-500'
      }`}
    >
      {label}
    </div>
  )
}

export function PartnerConsultationDetailPanel({
  token,
  project,
  onChanged,
  onError,
  onSuccess,
}: Props) {
  const [detail, setDetail] = useState<ConsultationBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [threadIdInput, setThreadIdInput] = useState('')
  const [joinPayload, setJoinPayload] = useState<Record<string, unknown> | null>(null)
  const [tick, setTick] = useState(0)

  const applyDetail = (data: ConsultationBooking) => {
    setDetail(data)
    setThreadIdInput(data.navigation?.threadId || data.threadId || '')
    setJoinPayload(data.canJoin && data.join ? data.join : null)
  }

  const load = async () => {
    setLoading(true)
    onError?.(null)
    try {
      const data = await getConsultationBooking(token, project.consultationBookingId)
      applyDetail(data)
    } catch (err) {
      onError?.(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await getConsultationBooking(token, project.consultationBookingId)
        if (!active) return
        applyDetail(data)
      } catch (err) {
        if (!active) return
        onError?.(errMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when project/token changes
  }, [project.consultationBookingId, token])

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const untilStart = detail ? msUntil(detail.startAt) : 0
  const untilEnd = detail ? msUntil(detail.endAt) : 0
  // tick forces re-render for countdown
  void tick

  const meetUrl = useMemo(
    () => jitsiMeetUrl(joinPayload || detail?.join),
    [joinPayload, detail?.join],
  )

  const screenHint =
    detail?.navigation?.screenHint || detail?.screenHint || project.navigation.screenHint

  const run = async (fn: () => Promise<void>, okMsg: string) => {
    setActionLoading(true)
    onError?.(null)
    try {
      await fn()
      onSuccess?.(okMsg)
      await load()
      onChanged?.()
    } catch (err) {
      onError?.(errMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && !detail) {
    return <p className="text-sm text-zinc-500">Loading consultation detail…</p>
  }

  if (!detail) {
    return <p className="text-sm text-zinc-500">Could not load booking detail</p>
  }

  const canJoin = Boolean(detail.canJoin)
  const isUpcoming = untilStart > 0
  const isLive = untilStart <= 0 && untilEnd >= 0
  const isPast = untilEnd < 0

  return (
    <div className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] text-zinc-500">Request detail · Consultation</p>
          <h3 className="text-lg font-semibold text-zinc-50">{detail.title}</h3>
          <p className="mt-1 text-xs text-zinc-400">
            {detail.category || 'Consultation'} · {detail.durationMinutes ?? '?'} min · ₹
            {detail.price.toLocaleString('en-IN')}
          </p>
        </div>
        <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
          {(screenHint || '').replaceAll('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <FlowStep label="1. Request" done active={isUpcoming && !canJoin} />
        <FlowStep label="2. Join" done={canJoin || isLive} active={canJoin || isLive} />
        <FlowStep label="3. Done" done={isPast && !canJoin} active={isPast && !canJoin} />
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Client</p>
        <p className="mt-1 text-sm font-medium text-zinc-100">
          {detail.client?.name || project.client.username}
        </p>
        <p className="text-xs text-zinc-500">
          {detail.client?.phone || project.client.phone_e164 || '—'}
          {detail.client?.id ? ` · ${detail.client.id}` : ''}
        </p>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Session</p>
          <p className="mt-1 text-sm text-zinc-200">{formatWhen(detail.startAt)}</p>
          <p className="text-xs text-zinc-500">
            until {new Date(detail.endAt).toLocaleTimeString()} · {detail.paymentStatus}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Join window</p>
          <p className="mt-1 text-sm text-zinc-200">
            {canJoin
              ? `Open · ends in ${countdownLabel(untilEnd)}`
              : isUpcoming
                ? `Opens in ${countdownLabel(untilStart)}`
                : isPast
                  ? 'Ended'
                  : 'Locked'}
          </p>
          <p className="text-xs text-zinc-500">
            canJoin={String(canJoin)} · status {detail.projectStatus || project.projectStatus}
          </p>
        </div>
      </section>

      {detail.sessionOutline ? (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Session outline</p>
          <p className="mt-1 text-xs whitespace-pre-wrap text-zinc-400">{detail.sessionOutline}</p>
        </section>
      ) : null}

      <section className="space-y-2">
        <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Message / thread</p>
        {detail.navigation?.threadId || detail.threadId ? (
          <p className="text-xs text-sky-300">
            threadId: {detail.navigation?.threadId || detail.threadId}
          </p>
        ) : (
          <p className="text-xs text-zinc-500">No thread yet — link one or re-open after pay</p>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            value={threadIdInput}
            onChange={(e) => setThreadIdInput(e.target.value)}
            placeholder="Chat threadId"
            className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs"
          />
          <button
            type="button"
            disabled={actionLoading || !threadIdInput.trim()}
            onClick={() =>
              void run(async () => {
                await linkConsultationBookingThread(
                  token,
                  project.consultationBookingId,
                  threadIdInput.trim(),
                )
              }, 'Thread linked')
            }
            className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-50"
          >
            Link thread
          </button>
        </div>
      </section>

      <section className="space-y-3 border-t border-zinc-800 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-zinc-200">Join consultation</h4>
          <button
            type="button"
            disabled={loading || actionLoading}
            onClick={() => void load()}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            Refresh
          </button>
        </div>

        {!canJoin ? (
          <div className="space-y-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
            <p className="text-xs text-violet-200">
              Join is locked until the slot window. For testing, shift this booking to start now.
            </p>
            <button
              type="button"
              disabled={actionLoading || detail.paymentStatus !== 'paid'}
              onClick={() =>
                void run(async () => {
                  const updated = await testStartConsultationJoinWindow(
                    token,
                    project.consultationBookingId,
                  )
                  setDetail(updated)
                  if (updated.join) setJoinPayload(updated.join)
                }, 'Join window opened — you can Join now')
              }
              className="w-full rounded-lg bg-violet-500 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {actionLoading ? 'Opening…' : 'Start join window (test)'}
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={actionLoading || !canJoin}
            onClick={() =>
              void run(async () => {
                const join = await joinConsultationBooking(token, project.consultationBookingId)
                setJoinPayload(join.join)
              }, 'Join payload ready')
            }
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-medium text-zinc-950 disabled:opacity-50"
          >
            {canJoin ? 'Join consultation' : 'Join locked'}
          </button>
          {meetUrl ? (
            <a
              href={meetUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-emerald-500/50 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10"
            >
              Open Jitsi in browser
            </a>
          ) : null}
        </div>

        {joinPayload ? (
          <div className="space-y-1">
            <p className="text-[10px] tracking-wide text-zinc-500 uppercase">
              Flutter join payload
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-[10px] text-emerald-200">
              {JSON.stringify(joinPayload, null, 2)}
            </pre>
            {meetUrl ? (
              <p className="text-[10px] break-all text-zinc-500">
                Room URL: <span className="text-sky-300">{meetUrl}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
