import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/lib/cn'

type ScheduleMaintenanceModalProps = {
  open: boolean
  initialStartAt?: string | null
  initialEndAt?: string | null
  onClose: () => void
  onSubmit: (payload: { startAt: string; endAt: string }) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

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

function toHourLabelFromDate(date: Date) {
  const hours = date.getHours()
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12} ${suffix}`
}

function toMinuteFromDate(date: Date) {
  return pad(date.getMinutes())
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseIsoDate(iso?: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date
}

/** Default schedule window: start = now, end = now + 1 hour */
function getDefaultSchedule() {
  const start = new Date()
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
    startHour: toHourLabelFromDate(start),
    endHour: toHourLabelFromDate(end),
    startMinute: toMinuteFromDate(start),
    endMinute: toMinuteFromDate(end),
  }
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

function formatDisplayDate(dateValue: string) {
  if (!dateValue) return ''
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = (firstDay.getDay() + 6) % 7
  const days: Array<number | null> = Array.from({ length: startPadding }, () => null)

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(day)
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

function dateFromParts(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function TimePickerPanel({
  activeHour,
  activeMinute,
  onHourChange,
  onMinuteChange,
}: {
  activeHour: string
  activeMinute: string
  onHourChange: (hour: string) => void
  onMinuteChange: (minute: string) => void
}) {
  const hourListRef = useRef<HTMLDivElement>(null)
  const minuteListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hourEl = hourListRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    const minuteEl = minuteListRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    hourEl?.scrollIntoView({ block: 'center' })
    minuteEl?.scrollIntoView({ block: 'center' })
  }, [activeHour, activeMinute])

  return (
    <div className="sm-time-picker">
      <div className="sm-time-picker-head">
        <span>Hours</span>
        <span>Mins</span>
      </div>
      <div className="sm-time-picker-body">
        <div className="sm-time-list" ref={hourListRef}>
          {HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              data-active={activeHour === hour ? 'true' : undefined}
              onClick={() => onHourChange(hour)}
              className={cn('sm-time-option', activeHour === hour && 'sm-time-option-active')}
            >
              {hour}
            </button>
          ))}
        </div>
        <div className="sm-time-list" ref={minuteListRef}>
          {MINS.map((minute) => (
            <button
              key={minute}
              type="button"
              data-active={activeMinute === minute ? 'true' : undefined}
              onClick={() => onMinuteChange(minute)}
              className={cn('sm-time-option', activeMinute === minute && 'sm-time-option-active')}
            >
              {minute}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScheduleMaintenanceModalContent({
  initialStartAt,
  initialEndAt,
  onClose,
  onSubmit,
}: Omit<ScheduleMaintenanceModalProps, 'open'>) {
  const defaults = getDefaultSchedule()
  const initialStart = parseIsoDate(initialStartAt)
  const initialEnd = parseIsoDate(initialEndAt)

  const initialStartDate = initialStart ? toDateInputValue(initialStart) : defaults.startDate
  const initialEndDate = initialEnd ? toDateInputValue(initialEnd) : defaults.endDate
  const parsedStart = new Date(`${initialStartDate}T00:00:00`)

  const [viewYear, setViewYear] = useState(() => parsedStart.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => parsedStart.getMonth())
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [startHour, setStartHour] = useState(() =>
    initialStart ? toHourLabelFromDate(initialStart) : defaults.startHour,
  )
  const [endHour, setEndHour] = useState(() =>
    initialEnd ? toHourLabelFromDate(initialEnd) : defaults.endHour,
  )
  const [startMinute, setStartMinute] = useState(() =>
    initialStart ? toMinuteFromDate(initialStart) : defaults.startMinute,
  )
  const [endMinute, setEndMinute] = useState(() =>
    initialEnd ? toMinuteFromDate(initialEnd) : defaults.endMinute,
  )
  const [picking, setPicking] = useState<'start' | 'end'>('start')
  const [error, setError] = useState('')

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const rangeStart = startDate && endDate ? (startDate <= endDate ? startDate : endDate) : startDate
  const rangeEnd = startDate && endDate ? (startDate <= endDate ? endDate : startDate) : ''

  const preview = useMemo(
    () => ({
      start: formatDisplayTime(startHour, startMinute),
      end: formatDisplayTime(endHour, endMinute),
    }),
    [startHour, startMinute, endHour, endMinute],
  )

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const handleDayClick = (day: number) => {
    const nextDate = dateFromParts(viewYear, viewMonth, day)

    if (!startDate || (startDate && endDate)) {
      setStartDate(nextDate)
      setEndDate('')
      setError('')
      return
    }

    if (nextDate < startDate) {
      setEndDate(startDate)
      setStartDate(nextDate)
    } else {
      setEndDate(nextDate)
    }
    setError('')
  }

  const getDayClassName = (day: number) => {
    const dateStr = dateFromParts(viewYear, viewMonth, day)
    const isStart = Boolean(rangeStart && dateStr === rangeStart)
    const isEnd = Boolean(rangeEnd && dateStr === rangeEnd)
    const inRange = Boolean(rangeStart && rangeEnd) && dateStr > rangeStart && dateStr < rangeEnd

    if (isStart && isEnd) return 'is-single'
    if (isStart) return 'is-start'
    if (isEnd) return 'is-end'
    if (inRange) return 'is-in-range'
    return ''
  }

  const handleSubmit = () => {
    const resolvedEndDate = endDate || startDate

    if (!startDate || !resolvedEndDate) {
      setError('Please select start and end dates')
      return
    }

    const startAt = buildIso(startDate, startHour, startMinute)
    const endAt = buildIso(resolvedEndDate, endHour, endMinute)

    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setError('End date & time must be after start date & time')
      return
    }

    onSubmit({ startAt, endAt })
  }

  const handleReset = () => {
    const next = getDefaultSchedule()
    const now = new Date()
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    setStartDate(next.startDate)
    setEndDate(next.endDate)
    setStartHour(next.startHour)
    setEndHour(next.endHour)
    setStartMinute(next.startMinute)
    setEndMinute(next.endMinute)
    setPicking('start')
    setError('')
  }

  return createPortal(
    <div className="sm-modal-overlay">
      <div className="sm-modal" role="dialog" aria-modal="true" aria-labelledby="sm-modal-title">
        <div className="sm-modal-header">
          <div>
            <h2 id="sm-modal-title" className="sm-modal-title">
              Schedule Maintenance
            </h2>
            <p className="sm-modal-subtitle">Enter Start date & End Date and time</p>
          </div>
          <button type="button" onClick={onClose} className="sm-modal-close" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="sm-modal-body">
          <div className="sm-modal-grid">
            {/* Left: calendar + date fields */}
            <div className="sm-left">
              <div className="sm-calendar">
                <div className="sm-calendar-nav">
                  <button
                    type="button"
                    className="sm-calendar-nav-btn"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <p className="sm-calendar-month">
                    {MONTHS[viewMonth]} {viewYear}
                  </p>
                  <button
                    type="button"
                    className="sm-calendar-nav-btn"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <div className="sm-calendar-weekdays">
                  {WEEKDAYS.map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>

                <div className="sm-calendar-days">
                  {calendarDays.map((day, index) =>
                    day == null ? (
                      <span key={`empty-${index}`} className="sm-day is-empty" />
                    ) : (
                      <button
                        key={`${viewYear}-${viewMonth}-${day}`}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={cn('sm-day', getDayClassName(day))}
                      >
                        {day}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="sm-date-fields">
                <label className="sm-field">
                  <span className="sm-field-label">Start Date</span>
                  <span className="sm-field-box">
                    <span>{formatDisplayDate(startDate)}</span>
                    <Clock className="size-4 opacity-50" aria-hidden />
                  </span>
                </label>
                <label className="sm-field">
                  <span className="sm-field-label">End Date</span>
                  <span className="sm-field-box">
                    <span>{formatDisplayDate(endDate || startDate)}</span>
                    <Clock className="size-4 opacity-50" aria-hidden />
                  </span>
                </label>
              </div>
            </div>

            {/* Right: time triggers + hours/mins picker */}
            <div className="sm-right">
              <div className="sm-time-triggers">
                <div className="sm-field">
                  <span className="sm-field-label">Start Time</span>
                  <button
                    type="button"
                    onClick={() => setPicking('start')}
                    className={cn('sm-time-box', picking === 'start' && 'is-active')}
                  >
                    <span>{preview.start}</span>
                    <Clock className="size-4 opacity-50" aria-hidden />
                  </button>
                </div>
                <div className="sm-field">
                  <span className="sm-field-label">End Time</span>
                  <button
                    type="button"
                    onClick={() => setPicking('end')}
                    className={cn('sm-time-box', picking === 'end' && 'is-active')}
                  >
                    <span>{preview.end}</span>
                    <Clock className="size-4 opacity-50" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="sm-picker-wrap">
                {picking === 'start' ? (
                  <TimePickerPanel
                    activeHour={startHour}
                    activeMinute={startMinute}
                    onHourChange={setStartHour}
                    onMinuteChange={setStartMinute}
                  />
                ) : (
                  <TimePickerPanel
                    activeHour={endHour}
                    activeMinute={endMinute}
                    onHourChange={setEndHour}
                    onMinuteChange={setEndMinute}
                  />
                )}
              </div>

              <div className="sm-actions">
                <button type="button" onClick={handleReset} className="sm-btn sm-btn-reset">
                  Reset
                </button>
                <button type="button" onClick={handleSubmit} className="sm-btn sm-btn-submit">
                  Submit
                </button>
              </div>
            </div>
          </div>

          {error ? <p className="sm-error">{error}</p> : null}
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
      key={`${initialStartAt ?? 'now-start'}-${initialEndAt ?? 'now-end'}-${open}`}
      initialStartAt={initialStartAt}
      initialEndAt={initialEndAt}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
