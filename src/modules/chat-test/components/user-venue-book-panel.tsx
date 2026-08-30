import { useCallback, useEffect, useState } from 'react'
import {
  completeVenueBooking,
  createVenueBooking,
  getSpaceSlots,
  listBookableSpaces,
  listBookableVenues,
  listMyVenueBookings,
  payVenueBooking,
  type VenueBookableSpace,
  type VenueBookableVenue,
  type VenueBookingDetail,
  type VenueBookingSlot,
} from '../api/venue-booking.api'
import type { StaticChatUser } from '../config/static-users'
import { env } from '@/config/env'

type Props = {
  user: StaticChatUser
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

function money(n: number, currency = 'INR') {
  if (currency === 'INR') return `₹${Number(n || 0).toLocaleString('en-IN')}`
  return `${currency} ${n}`
}

export function UserVenueBookPanel({ user }: Props) {
  const token = user.accessToken
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [venues, setVenues] = useState<VenueBookableVenue[]>([])
  const [loadingVenues, setLoadingVenues] = useState(true)
  const [venueId, setVenueId] = useState('')

  const [spaces, setSpaces] = useState<VenueBookableSpace[]>([])
  const [loadingSpaces, setLoadingSpaces] = useState(false)
  const [spaceId, setSpaceId] = useState('')

  const [slotDate, setSlotDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [slots, setSlots] = useState<VenueBookingSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [booking, setBooking] = useState(false)
  const [paying, setPaying] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [pending, setPending] = useState<VenueBookingDetail | null>(null)
  const [mine, setMine] = useState<VenueBookingDetail[]>([])
  const [loadingMine, setLoadingMine] = useState(true)

  const selectedVenue = venues.find((v) => v.id === venueId) || null
  const selectedSpace = spaces.find((s) => s.id === spaceId) || null

  const refreshMine = useCallback(async () => {
    setLoadingMine(true)
    try {
      const result = await listMyVenueBookings(token, 1, 30)
      setMine(result.data)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoadingMine(false)
    }
  }, [token])

  const loadVenues = useCallback(async () => {
    setLoadingVenues(true)
    setError(null)
    try {
      const result = await listBookableVenues(token, 1, 50)
      setVenues(result.data)
      setError(null)
      setSuccess(`Loaded ${result.data.length} venues`)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoadingVenues(false)
    }
  }, [token])

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await listBookableVenues(token, 1, 50)
        if (!active) return
        setVenues(result.data)
        setSuccess(`Loaded ${result.data.length} venues`)
      } catch (err) {
        if (!active) return
        setError(errMessage(err))
      } finally {
        if (active) setLoadingVenues(false)
      }
    })()

    void (async () => {
      try {
        const result = await listMyVenueBookings(token, 1, 30)
        if (!active) return
        setMine(result.data)
      } catch (err) {
        if (!active) return
        setError(errMessage(err))
      } finally {
        if (active) setLoadingMine(false)
      }
    })()

    return () => {
      active = false
    }
  }, [token])

  const handleSelectVenue = async (id: string) => {
    setVenueId(id)
    setSpaceId('')
    setSpaces([])
    setSlots([])
    setPending(null)
    if (!id) return
    setLoadingSpaces(true)
    setError(null)
    try {
      const data = await listBookableSpaces(token, id)
      setSpaces(data.spaces || [])
      setSuccess(`Loaded ${data.spaces?.length || 0} spaces`)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoadingSpaces(false)
    }
  }

  const handleLoadSlots = async () => {
    if (!spaceId) {
      setError('Select a space first')
      return
    }
    setLoadingSlots(true)
    setError(null)
    setSlots([])
    try {
      const data = await getSpaceSlots(token, spaceId, {
        date: slotDate,
        durationMinutes,
      })
      setSlots(data.slots || [])
      setSuccess(`Loaded ${data.slots?.length || 0} slots for ${slotDate}`)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBookSlot = async (slot: VenueBookingSlot) => {
    if (!venueId || !spaceId) return
    setBooking(true)
    setError(null)
    try {
      const created = await createVenueBooking(token, {
        venueId,
        spaceId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        title: selectedSpace?.name ? `${selectedSpace.name} booking` : undefined,
      })
      setPending(created)
      setSuccess(`Reserved ${slot.startTime}–${slot.endTime} · payment pending — tap Dummy pay`)
      await refreshMine()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setBooking(false)
    }
  }

  const handleDummyPay = async () => {
    if (!pending?.id) return
    setPaying(true)
    setError(null)
    try {
      const paid = await payVenueBooking(token, pending.id)
      setPending(paid)
      setSuccess('Dummy pay OK — Mark completed below, then rate in Venue insights')
      await refreshMine()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setPaying(false)
    }
  }

  const handleComplete = async (bookingId: string) => {
    setCompletingId(bookingId)
    setError(null)
    try {
      const done = await completeVenueBooking(token, bookingId)
      if (pending?.id === bookingId) setPending(done)
      setSuccess('Booking completed — rate it in Venue insights below')
      await refreshMine()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setCompletingId(null)
    }
  }

  const canComplete = (b: VenueBookingDetail) =>
    b.paymentStatus === 'paid' && b.status !== 'cancelled' && b.projectStatus !== 'completed'

  return (
    <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-zinc-900/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium text-emerald-300">Book venue / space</h2>
          <p className="text-xs text-zinc-500">venue-service only · {env.venueApiBaseUrl}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadVenues()
            void refreshMine()
          }}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">Venue</span>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            value={venueId}
            disabled={loadingVenues}
            onChange={(e) => void handleSelectVenue(e.target.value)}
          >
            <option value="">{loadingVenues ? 'Loading…' : 'Select venue'}</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name || v.id}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">Space</span>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            value={spaceId}
            disabled={!venueId || loadingSpaces}
            onChange={(e) => {
              setSpaceId(e.target.value)
              setSlots([])
              setPending(null)
            }}
          >
            <option value="">{loadingSpaces ? 'Loading…' : 'Select space'}</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.approxPrice != null ? ` · ~${money(s.approxPrice)}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedVenue || selectedSpace ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500">Venue:</span> {selectedVenue?.name || '—'}
          </div>
          <div>
            <span className="text-zinc-500">Space:</span> {selectedSpace?.name || '—'}
            {selectedSpace?.spaceType ? ` (${selectedSpace.spaceType})` : ''}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">Date</span>
          <input
            type="date"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            value={slotDate}
            onChange={(e) => {
              setSlotDate(e.target.value)
              setSlots([])
            }}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">Duration (min)</span>
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            value={durationMinutes}
            onChange={(e) => {
              setDurationMinutes(Number(e.target.value))
              setSlots([])
            }}
          >
            {[30, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!spaceId || loadingSlots}
          onClick={() => void handleLoadSlots()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          {loadingSlots ? 'Loading…' : 'Load slots'}
        </button>
      </div>

      {slots.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs tracking-wide text-zinc-500 uppercase">Available slots</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={`${slot.startAt}-${slot.endAt}`}
                type="button"
                disabled={booking}
                onClick={() => void handleBookSlot(slot)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm hover:border-emerald-500/50 hover:bg-zinc-900 disabled:opacity-40"
              >
                <div className="font-medium text-zinc-100">
                  {slot.startTime} – {slot.endTime}
                </div>
                <div className="text-xs text-zinc-500">
                  {slot.durationMinutes} mins · {money(slot.price, slot.currency)}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {pending ? (
        <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="text-sm font-medium text-amber-200">Booking detail</div>
          <dl className="grid gap-1 text-sm text-zinc-300 sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Id</dt>
              <dd className="font-mono text-xs break-all">{pending.id}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Payment</dt>
              <dd className="capitalize">{pending.paymentStatus}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Venue</dt>
              <dd>{pending.venue?.name || pending.venue?.id || '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Space</dt>
              <dd>{pending.space?.name || pending.space?.id || '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">When</dt>
              <dd>
                {pending.timeLabel || '—'}
                {pending.startAt ? (
                  <span className="mt-0.5 block text-xs text-zinc-500">{pending.startAt}</span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Price</dt>
              <dd>{money(pending.price, pending.currency)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Status</dt>
              <dd>
                {pending.statusLabel || pending.projectStatus} · {pending.status}
              </dd>
            </div>
          </dl>
          {pending.paymentStatus === 'pending' ? (
            <button
              type="button"
              disabled={paying}
              onClick={() => void handleDummyPay()}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
            >
              {paying ? 'Paying…' : 'Dummy pay'}
            </button>
          ) : canComplete(pending) ? (
            <button
              type="button"
              disabled={completingId === pending.id}
              onClick={() => void handleComplete(pending.id)}
              className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-40"
            >
              {completingId === pending.id ? 'Completing…' : 'Mark completed'}
            </button>
          ) : (
            <div className="text-sm text-emerald-300">
              Completed — rate it in Venue insights below.
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-2 border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-zinc-200">My venue bookings</h3>
          {loadingMine ? <span className="text-xs text-zinc-500">Loading…</span> : null}
        </div>
        {mine.length === 0 ? (
          <p className="text-sm text-zinc-500">No bookings yet.</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm"
              >
                <div className="font-medium text-zinc-100">{b.title}</div>
                <div className="text-xs text-zinc-500">
                  {b.venue?.name || 'Venue'} · {b.space?.name || 'Space'} ·{' '}
                  {b.timeLabel || b.startAt} · {money(b.price, b.currency)} ·{' '}
                  <span className="capitalize">{b.paymentStatus}</span> · {b.statusLabel}
                </div>
                {canComplete(b) ? (
                  <button
                    type="button"
                    disabled={completingId === b.id}
                    onClick={() => void handleComplete(b.id)}
                    className="mt-2 rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-400 disabled:opacity-40"
                  >
                    {completingId === b.id ? 'Completing…' : 'Mark completed'}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
