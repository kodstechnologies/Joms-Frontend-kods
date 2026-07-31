import { useMemo, useState } from 'react'
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

function toDateInputValue(iso?: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toHourLabel(iso?: string | null, fallback = '7 PM') {
  if (!iso) return fallback
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return fallback
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

function todayInputValue() {
  return toDateInputValue(new Date().toISOString())
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
  return (
    <div className="schedule-maintenance-time-picker">
      <div className="schedule-maintenance-time-picker-header">
        <span className="schedule-maintenance-time-picker-header-cell">Hours</span>
        <span className="schedule-maintenance-time-picker-header-divider" aria-hidden />
        <span className="schedule-maintenance-time-picker-header-cell">Mins</span>
      </div>
      <div className="schedule-maintenance-time-picker-body">
        <div className="schedule-maintenance-time-list">
          {HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              onClick={() => onHourChange(hour)}
              className={cn(
                'schedule-maintenance-time-option',
                activeHour === hour && 'schedule-maintenance-time-option-active',
              )}
            >
              {hour}
            </button>
          ))}
        </div>
        <span className="schedule-maintenance-time-picker-body-divider" aria-hidden />
        <div className="schedule-maintenance-time-list">
          {MINS.map((minute) => (
            <button
              key={minute}
              type="button"
              onClick={() => onMinuteChange(minute)}
              className={cn(
                'schedule-maintenance-time-option',
                activeMinute === minute && 'schedule-maintenance-time-option-active',
              )}
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
  const initialStartDate = toDateInputValue(initialStartAt) || todayInputValue()
  const initialEndDate = toDateInputValue(initialEndAt) || todayInputValue()
  const parsedStart = new Date(`${initialStartDate}T00:00:00`)

  const [viewYear, setViewYear] = useState(() => parsedStart.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => parsedStart.getMonth())
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [startHour, setStartHour] = useState(() => toHourLabel(initialStartAt))
  const [endHour, setEndHour] = useState(() => toHourLabel(initialEndAt, '8 PM'))
  const [startMinute, setStartMinute] = useState(() => toMinuteValue(initialStartAt))
  const [endMinute, setEndMinute] = useState(() => toMinuteValue(initialEndAt))
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

    if (isStart && isEnd) return 'schedule-maintenance-calendar-day-range-single'
    if (isStart) return 'schedule-maintenance-calendar-day-range-start'
    if (isEnd) return 'schedule-maintenance-calendar-day-range-end'
    if (inRange) return 'schedule-maintenance-calendar-day-in-range'
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
    const today = todayInputValue()
    setViewYear(new Date().getFullYear())
    setViewMonth(new Date().getMonth())
    setStartDate(today)
    setEndDate(today)
    setStartHour('7 PM')
    setEndHour('8 PM')
    setStartMinute('00')
    setEndMinute('00')
    setPicking('start')
    setError('')
  }

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell schedule-maintenance-modal-shell">
        <div className="ui-modal-header schedule-maintenance-modal-header">
          <div>
            <h2 className="schedule-maintenance-modal-title">Schedule Maintenance</h2>
            <p className="schedule-maintenance-modal-subtitle">
              Enter Start date & End Date and time
            </p>
          </div>
          <button type="button" onClick={onClose} className="schedule-maintenance-modal-close">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body schedule-maintenance-modal-body">
          <div className="schedule-maintenance-layout">
            <div className="schedule-maintenance-section">
              <div className="schedule-maintenance-calendar">
                <div className="schedule-maintenance-calendar-nav">
                  <button
                    type="button"
                    className="schedule-maintenance-calendar-nav-btn"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <p className="schedule-maintenance-calendar-month">
                    {MONTHS[viewMonth]} {viewYear}
                  </p>
                  <button
                    type="button"
                    className="schedule-maintenance-calendar-nav-btn"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <div className="schedule-maintenance-calendar-weekdays">
                  {WEEKDAYS.map((weekday) => (
                    <span key={weekday} className="schedule-maintenance-calendar-weekday">
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className="schedule-maintenance-calendar-days">
                  {calendarDays.map((day, index) =>
                    day == null ? (
                      <span
                        key={`empty-${index}`}
                        className="schedule-maintenance-calendar-day schedule-maintenance-calendar-day-empty"
                      />
                    ) : (
                      <button
                        key={`${viewYear}-${viewMonth}-${day}`}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={cn('schedule-maintenance-calendar-day', getDayClassName(day))}
                      >
                        {day}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <span className="schedule-maintenance-field-label">
                  Select Start Date & End Date
                </span>
                <div className="schedule-maintenance-field-grid">
                  <div>
                    <span className="schedule-maintenance-field-label">Start Date</span>
                    <div className="schedule-maintenance-field-wrap">
                      <input
                        type="text"
                        readOnly
                        value={formatDisplayDate(startDate)}
                        className="schedule-maintenance-field"
                      />
                      <Clock className="schedule-maintenance-field-icon" aria-hidden />
                    </div>
                  </div>
                  <div>
                    <span className="schedule-maintenance-field-label">End Date</span>
                    <div className="schedule-maintenance-field-wrap">
                      <input
                        type="text"
                        readOnly
                        value={formatDisplayDate(endDate || startDate)}
                        className="schedule-maintenance-field"
                      />
                      <Clock className="schedule-maintenance-field-icon" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="schedule-maintenance-divider" aria-hidden />

            <div className="schedule-maintenance-section schedule-maintenance-section-right">
              <div className="schedule-maintenance-time-row">
                <div className="schedule-maintenance-time-field">
                  <span className="schedule-maintenance-field-label">Start Time</span>
                  <button
                    type="button"
                    onClick={() => setPicking('start')}
                    className={cn(
                      'schedule-maintenance-time-trigger',
                      picking === 'start' && 'schedule-maintenance-time-trigger-active',
                    )}
                  >
                    {preview.start}
                    <Clock className="schedule-maintenance-field-icon" />
                  </button>
                  {picking === 'start' ? (
                    <TimePickerPanel
                      activeHour={startHour}
                      activeMinute={startMinute}
                      onHourChange={setStartHour}
                      onMinuteChange={setStartMinute}
                    />
                  ) : null}
                </div>
                <div className="schedule-maintenance-time-field">
                  <span className="schedule-maintenance-field-label">End Time</span>
                  <button
                    type="button"
                    onClick={() => setPicking('end')}
                    className={cn(
                      'schedule-maintenance-time-trigger',
                      picking === 'end' && 'schedule-maintenance-time-trigger-active',
                    )}
                  >
                    {preview.end}
                    <Clock className="schedule-maintenance-field-icon" />
                  </button>
                  {picking === 'end' ? (
                    <TimePickerPanel
                      activeHour={endHour}
                      activeMinute={endMinute}
                      onHourChange={setEndHour}
                      onMinuteChange={setEndMinute}
                    />
                  ) : null}
                </div>
              </div>

              <div className="schedule-maintenance-actions">
                <button
                  type="button"
                  onClick={handleReset}
                  className="schedule-maintenance-action-btn schedule-maintenance-reset-btn"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="schedule-maintenance-action-btn schedule-maintenance-submit-btn"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {error ? <p className="schedule-maintenance-error">{error}</p> : null}
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
