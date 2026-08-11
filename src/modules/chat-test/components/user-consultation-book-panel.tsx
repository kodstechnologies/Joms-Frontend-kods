import { useMemo, useState } from 'react'
import {
  createConsultationBooking,
  getConsultationSlots,
  payConsultationBooking,
  testSetupConsultationBooking,
  type ConsultationBooking,
  type ConsultationSlot,
} from '../api/consultation-booking.api'
import type { PartnerOffering } from '../api/quotation.api'

const PARTNER_SESSION_KEY = 'joms_dev_partner_chat'

type Props = {
  token: string
  consultation: PartnerOffering
  onBooked?: () => void
  onSetupComplete?: (updated: PartnerOffering) => void
  onError?: (message: string | null) => void
  onSuccess?: (message: string) => void
}

function loadPartnerToken() {
  try {
    const raw =
      localStorage.getItem(PARTNER_SESSION_KEY) || sessionStorage.getItem(PARTNER_SESSION_KEY)
    if (!raw) return ''
    const parsed = JSON.parse(raw) as { accessToken?: string }
    return parsed.accessToken || ''
  } catch {
    return ''
  }
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

function outlineBullets(text: string) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean)
}

function pricingLabel(option: NonNullable<PartnerOffering['pricingOptions']>[number]) {
  const mins = option.durationMinutes
  if (option.pricingType === 'free') return `${mins}mins (Free)`
  return `${mins}mins (₹${option.price.toLocaleString('en-IN')})`
}

function modeLabel(mode: string | null | undefined) {
  if (mode === 'audio') return 'Audio call'
  if (mode === 'video') return 'Video call'
  if (mode === 'chat') return 'Chat'
  return mode || '—'
}

const DEFAULT_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function UserConsultationBookPanel({
  token,
  consultation,
  onBooked,
  onSetupComplete,
  onError,
  onSuccess,
}: Props) {
  const [item, setItem] = useState(consultation)
  const [partnerToken, setPartnerToken] = useState(loadPartnerToken)
  const [setupLoading, setSetupLoading] = useState(false)
  const [availFrom, setAvailFrom] = useState('09:00')
  const [availTo, setAvailTo] = useState('21:00')

  const pricingOptions = useMemo(() => item.pricingOptions || [], [item.pricingOptions])

  const [durationMinutes, setDurationMinutes] = useState(
    () => pricingOptions[0]?.durationMinutes ?? 30,
  )
  const [slotDate, setSlotDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [slots, setSlots] = useState<ConsultationSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [paying, setPaying] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<ConsultationBooking | null>(null)
  const [pendingSlotLabel, setPendingSlotLabel] = useState('')

  const canBookApi = item.mode === 'audio' && item.status === 'live'

  const selectedPricing = pricingOptions.find((o) => o.durationMinutes === durationMinutes)

  const selectDuration = (minutes: number) => {
    setDurationMinutes(minutes)
    setSlots([])
  }

  const changeSlotDate = (value: string) => {
    setSlotDate(value)
    setSlots([])
  }

  const handleEnableBooking = async () => {
    if (!partnerToken.trim()) {
      onError?.('Paste partner JWT from partner chat-test login (or log in on /dev/chat-partner)')
      return
    }
    setSetupLoading(true)
    onError?.(null)
    try {
      const weeklyAvailability = DEFAULT_DAYS.map((day) => ({
        day,
        from: availFrom,
        to: availTo,
      }))
      await testSetupConsultationBooking(partnerToken.trim(), item._id, { weeklyAvailability })
      const updated: PartnerOffering = { ...item, status: 'live', mode: 'audio' }
      setItem(updated)
      onSetupComplete?.(updated)
      onSuccess?.('Consultation is live with test availability — load slots and book')
    } catch (err) {
      onError?.(errMessage(err))
    } finally {
      setSetupLoading(false)
    }
  }

  const handleLoadSlots = async () => {
    setLoadingSlots(true)
    onError?.(null)
    setSlots([])
    try {
      const data = await getConsultationSlots(token, item._id, {
        date: slotDate,
        durationMinutes,
      })
      setSlots(data.slots || [])
      onSuccess?.(`Loaded ${data.slots?.length || 0} slots for ${slotDate}`)
    } catch (err) {
      onError?.(errMessage(err))
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBookSlot = async (slot: ConsultationSlot) => {
    if (!canBookApi) {
      onError?.('Run “Enable booking” first (needs live + availability)')
      return
    }
    setBooking(true)
    onError?.(null)
    try {
      const created = await createConsultationBooking(token, {
        consultationId: item._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        durationMinutes: slot.durationMinutes,
      })
      setPendingBooking(created)
      setPendingSlotLabel(`${slot.startTime} – ${slot.endTime}`)
      onSuccess?.(
        `Slot reserved (${slot.startTime}–${slot.endTime}) · payment pending — tap Dummy pay`,
      )
    } catch (err) {
      onError?.(errMessage(err))
    } finally {
      setBooking(false)
    }
  }

  const handleDummyPay = async () => {
    if (!pendingBooking?._id) return
    setPaying(true)
    onError?.(null)
    try {
      const label = pendingSlotLabel
      const paid = await payConsultationBooking(token, pendingBooking._id)
      setPendingBooking(null)
      setPendingSlotLabel('')
      onSuccess?.(`Dummy paid · ${paid.title || item.title} · ${label || 'consultation booked'}`)
      onBooked?.()
    } catch (err) {
      onError?.(errMessage(err))
    } finally {
      setPaying(false)
    }
  }

  const topics = item.topics?.length ? item.topics : item.category ? [item.category] : []

  return (
    <div className="space-y-5 rounded-xl border border-zinc-700 bg-zinc-950/90 p-4">
      {!canBookApi ? (
        <section className="space-y-3 rounded-lg border border-violet-500/40 bg-violet-500/5 p-3">
          <div>
            <h4 className="text-sm font-medium text-violet-200">Test setup — enable booking</h4>
            <p className="mt-1 text-xs text-zinc-400">
              Booking failed because status is <strong>{item.status}</strong> (needs{' '}
              <strong>live</strong>). Use the partner JWT to mark live + set availability in one
              click.
            </p>
          </div>
          <label className="block space-y-1 text-xs">
            <span className="tracking-wide text-zinc-500 uppercase">Partner JWT</span>
            <textarea
              className="min-h-16 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-[11px]"
              value={partnerToken}
              onChange={(e) => setPartnerToken(e.target.value)}
              placeholder="From partner panel login, or joms_dev_partner_chat in localStorage"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="space-y-1 text-xs">
              <span className="tracking-wide text-zinc-500 uppercase">Available from</span>
              <input
                type="time"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={availFrom}
                onChange={(e) => setAvailFrom(e.target.value.slice(0, 5))}
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="tracking-wide text-zinc-500 uppercase">Available to</span>
              <input
                type="time"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={availTo}
                onChange={(e) => setAvailTo(e.target.value.slice(0, 5))}
              />
            </label>
          </div>
          <p className="text-[10px] text-zinc-500">
            Sets Mon–Sun {availFrom}–{availTo} IST, mode audio, status live.
          </p>
          <button
            type="button"
            disabled={setupLoading}
            onClick={() => void handleEnableBooking()}
            className="w-full rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {setupLoading ? 'Setting up…' : 'Enable booking (live + availability)'}
          </button>
        </section>
      ) : (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
          Ready to book · status <strong>live</strong> · mode <strong>{item.mode}</strong>
        </p>
      )}

      <div>
        <p className="text-[11px] text-zinc-500">Preview · book a consultation slot</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50">{item.title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{item.category || 'Consultation'}</p>
        {topics.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-600 px-3 py-1 text-xs text-zinc-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {item.sessionOutline ? (
        <section className="border-t border-zinc-800 pt-4">
          <h4 className="text-sm font-medium text-zinc-200">Session outline</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
            {outlineBullets(item.sessionOutline).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.whoItsFor ? (
        <section className="border-t border-zinc-800 pt-4">
          <h4 className="text-sm font-medium text-zinc-200">Who is it for?</h4>
          <p className="mt-2 text-sm text-zinc-400">{item.whoItsFor}</p>
        </section>
      ) : null}

      {item.preSessionRequirement ? (
        <section className="border-t border-zinc-800 pt-4">
          <h4 className="text-sm font-medium text-zinc-200">Pre-session requirement</h4>
          <p className="mt-2 text-sm text-zinc-400">{item.preSessionRequirement}</p>
        </section>
      ) : null}

      {item.postSessionMessage ? (
        <section className="border-t border-zinc-800 pt-4">
          <h4 className="text-sm font-medium text-zinc-200">Post-session message</h4>
          <p className="mt-2 text-sm text-zinc-400 italic">{item.postSessionMessage}</p>
        </section>
      ) : null}

      <section className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-4">
        <div className="rounded-lg bg-zinc-900 px-2 py-3 text-center">
          <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Mode</p>
          <p className="mt-1 text-xs text-zinc-200">{modeLabel(item.mode)}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 px-2 py-3 text-center">
          <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Language</p>
          <p className="mt-1 text-xs text-zinc-200">
            {item.languages?.length ? item.languages.join(', ') : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-900 px-2 py-3 text-center">
          <p className="text-[10px] tracking-wide text-zinc-500 uppercase">Follow ups</p>
          <p className="mt-1 text-xs text-zinc-200">
            {item.followUpDays != null ? `${item.followUpDays} days` : '—'}
          </p>
        </div>
      </section>

      <section className="border-t border-zinc-800 pt-4">
        <h4 className="text-sm font-medium text-zinc-200">Duration &amp; pricing</h4>
        {pricingOptions.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {pricingOptions.map((option) => {
              const active = option.durationMinutes === durationMinutes
              return (
                <button
                  key={option.durationMinutes}
                  type="button"
                  onClick={() => selectDuration(option.durationMinutes)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                      : 'border-zinc-600 text-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  {pricingLabel(option)}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">No pricing options on this consultation</p>
        )}
        {selectedPricing ? (
          <p className="mt-2 text-xs text-zinc-500">
            Selected: {pricingLabel(selectedPricing)} · status {item.status}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 border-t border-zinc-800 pt-4">
        <h4 className="text-sm font-medium text-zinc-200">Pick a slot</h4>

        {pendingBooking ? (
          <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-xs font-medium text-amber-200">Payment pending</p>
            <p className="text-sm text-zinc-200">{pendingBooking.title || item.title}</p>
            <p className="text-xs text-zinc-400">
              {pendingSlotLabel || 'Selected slot'} ·{' '}
              {pendingBooking.durationMinutes ?? durationMinutes} min · ₹
              {pendingBooking.price?.toLocaleString('en-IN') ?? '—'}
            </p>
            <p className="text-[10px] text-zinc-500">
              Booking id <span className="font-mono text-zinc-400">{pendingBooking._id}</span>
            </p>
            <button
              type="button"
              disabled={paying}
              onClick={() => void handleDummyPay()}
              className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-zinc-950 disabled:opacity-50"
            >
              {paying
                ? 'Paying…'
                : `Dummy pay ₹${pendingBooking.price?.toLocaleString('en-IN') ?? '0'}`}
            </button>
            <p className="text-[10px] text-zinc-500">
              Calls <span className="font-mono">POST /consultation-bookings/:id/pay</span>
            </p>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="space-y-1 text-xs">
            <span className="tracking-wide text-zinc-500 uppercase">Date</span>
            <input
              type="date"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={slotDate}
              onChange={(e) => changeSlotDate(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              disabled={loadingSlots || !pricingOptions.length}
              onClick={() => void handleLoadSlots()}
              className="w-full rounded-lg border border-zinc-500 px-4 py-2 text-sm text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              {loadingSlots ? 'Loading…' : 'Load slots'}
            </button>
          </div>
        </div>

        <ul className="max-h-48 space-y-2 overflow-auto">
          {slots.map((slot) => (
            <li key={slot.startAt}>
              <button
                type="button"
                disabled={booking || !canBookApi}
                onClick={() => void handleBookSlot(slot)}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-left text-sm transition hover:border-zinc-500 disabled:opacity-50"
              >
                <span className="text-zinc-100">
                  {slot.startTime} – {slot.endTime}
                </span>
                <span className="text-xs text-zinc-400">
                  {slot.durationMinutes} min · ₹{slot.price.toLocaleString('en-IN')}
                  {!canBookApi ? ' · enable booking first' : ' · reserve slot'}
                </span>
              </button>
            </li>
          ))}
          {!slots.length && !loadingSlots ? (
            <li className="rounded-lg border border-dashed border-zinc-800 py-6 text-center text-xs text-zinc-500">
              {canBookApi
                ? 'Choose a date and load available slots'
                : 'Enable booking above, then load slots'}
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  )
}
