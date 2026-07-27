import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/lib/cn'

type ScheduleMaintenanceModalProps = {
  open: boolean
  initialStartAt?: string | null
  initialEndAt?: string | null
  onClose: () => void
  onSubmit: (payload: { startAt: string; endAt: string }) => void
}

const HOURS = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
]

const MINS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateInputValue(iso?: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toHourLabel(iso?: string | null) {
  if (!iso) return '7 PM'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '7 PM'
  const hours = date.getHours()
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12} ${suffix}`
}

function toMinuteValue(iso?: string | null) {
  if (!iso) return '00'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '00'
  return pad(date.getMinutes())
}

function hourLabelTo24(label: string) {
  const [rawHour, meridian] = label.split(' ')
  let hour = Number(rawHour)
  if (meridian === 'AM') {
    if (hour === 12) hour = 0
  } else if (hour !== 12) {
    hour += 12
  }
  return hour
}

function buildIso(dateValue: string, hourLabel: string, minute: string) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, day, hourLabelTo24(hourLabel), Number(minute), 0, 0)
  return date.toISOString()
}

function formatDisplayTime(hourLabel: string, minute: string) {
  const [hour, meridian] = hourLabel.split(' ')
  return `${pad(Number(hour))}:${minute} ${meridian}`
}

function todayInputValue() {
  return toDateInputValue(new Date().toISOString())
}

function ScheduleMaintenanceModalContent({
  initialStartAt,
  initialEndAt,
  onClose,
  onSubmit,
}: Omit<ScheduleMaintenanceModalProps, 'open'>) {
  const [startDate, setStartDate] = useState(
    () => toDateInputValue(initialStartAt) || todayInputValue(),
  )
  const [endDate, setEndDate] = useState(() => toDateInputValue(initialEndAt) || todayInputValue())
  const [startHour, setStartHour] = useState(() => toHourLabel(initialStartAt))
  const [endHour, setEndHour] = useState(() => toHourLabel(initialEndAt) || '8 PM')
  const [startMinute, setStartMinute] = useState(() => toMinuteValue(initialStartAt))
  const [endMinute, setEndMinute] = useState(() => toMinuteValue(initialEndAt))
  const [picking, setPicking] = useState<'start' | 'end' | null>('start')
  const [error, setError] = useState('')

  const activeHour = picking === 'end' ? endHour : startHour
  const activeMinute = picking === 'end' ? endMinute : startMinute

  const preview = useMemo(
    () => ({
      start: formatDisplayTime(startHour, startMinute),
      end: formatDisplayTime(endHour, endMinute),
    }),
    [startHour, startMinute, endHour, endMinute],
  )

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      setError('Please select start and end dates')
      return
    }

    const startAt = buildIso(startDate, startHour, startMinute)
    const endAt = buildIso(endDate, endHour, endMinute)

    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setError('End date & time must be after start date & time')
      return
    }

    onSubmit({ startAt, endAt })
  }

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell w-full max-w-[720px]">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h4 text-brand-text">Schedule Maintenance</h2>
            <p className="text-body-sm text-muted mt-1">Enter Start date & End Date and time</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-body-sm text-muted">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-brand-surface h-11 w-full rounded-lg border border-white/10 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-body-sm text-muted">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-brand-surface h-11 w-full rounded-lg border border-white/10 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPicking('start')}
                className={cn(
                  'rounded-lg border px-3 py-3 text-left transition-colors',
                  picking === 'start'
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-white/10 bg-black/20',
                )}
              >
                <p className="text-body-sm text-muted">Start Time</p>
                <p className="text-body-md-semibold text-brand-text mt-1">{preview.start}</p>
              </button>
              <button
                type="button"
                onClick={() => setPicking('end')}
                className={cn(
                  'rounded-lg border px-3 py-3 text-left transition-colors',
                  picking === 'end'
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-white/10 bg-black/20',
                )}
              >
                <p className="text-body-sm text-muted">End Time</p>
                <p className="text-body-md-semibold text-brand-text mt-1">{preview.end}</p>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="max-h-56 overflow-y-auto pr-1">
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      if (picking === 'end') setEndHour(hour)
                      else setStartHour(hour)
                    }}
                    className={cn(
                      'mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm',
                      activeHour === hour
                        ? 'bg-brand-accent text-black'
                        : 'text-brand-text/80 hover:bg-white/5',
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
              <div className="max-h-56 overflow-y-auto pr-1">
                {MINS.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => {
                      if (picking === 'end') setEndMinute(minute)
                      else setStartMinute(minute)
                    }}
                    className={cn(
                      'mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm',
                      activeMinute === minute
                        ? 'bg-brand-accent text-black'
                        : 'text-brand-text/80 hover:bg-white/5',
                    )}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? <p className="text-brand-danger text-sm md:col-span-2">{error}</p> : null}
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            onClick={() => {
              setStartDate(todayInputValue())
              setEndDate(todayInputValue())
              setStartHour('7 PM')
              setEndHour('8 PM')
              setStartMinute('00')
              setEndMinute('00')
              setError('')
            }}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Reset
          </button>
          <button type="button" onClick={handleSubmit} className="ui-modal-btn ui-modal-btn-gold">
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function ScheduleMaintenanceModal({
  open,
  initialStartAt,
  initialEndAt,
  onClose,
  onSubmit,
}: ScheduleMaintenanceModalProps) {
  if (!open) return null

  return (
    <ScheduleMaintenanceModalContent
      key={`${initialStartAt ?? 'start'}-${initialEndAt ?? 'end'}`}
      initialStartAt={initialStartAt}
      initialEndAt={initialEndAt}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
