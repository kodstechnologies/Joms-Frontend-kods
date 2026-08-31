import { useEffect, useState } from 'react'

export function useLiveClock(tickMs = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  return now
}

type TimezoneInfo = {
  iana: string
  abbr: string
}

export function resolveTimezone(timezoneLabel: string): TimezoneInfo {
  const label = timezoneLabel.toLowerCase()

  if (label.includes('kolkata') || label.includes('ist') || label.includes('+5:30')) {
    return { iana: 'Asia/Kolkata', abbr: 'IST' }
  }
  if (label.includes('new york') || label.includes('est') || label.includes('-5:00')) {
    return { iana: 'America/New_York', abbr: 'EST' }
  }
  if (label.includes('utc')) {
    return { iana: 'UTC', abbr: 'UTC' }
  }

  return { iana: 'Asia/Kolkata', abbr: 'IST' }
}

function pad(value: number, size = 2) {
  return String(value).padStart(size, '0')
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

export function formatDisplayClock(
  date: Date,
  dateTimeFormat?: string | null,
  timezoneLabel?: string | null,
): string {
  const { iana, abbr } = resolveTimezone(timezoneLabel || 'IST, +5:30, Kolkata, India')
  const parts = getZonedParts(date, iana)
  const format = dateTimeFormat?.trim() || 'DD/MM/YY'

  let datePart: string
  if (format === 'MM/DD/YY') {
    datePart = `${parts.month}/${parts.day}/${parts.year}`
  } else if (format === 'YYYY-MM-DD') {
    datePart = `${parts.year}-${parts.month}-${parts.day}`
  } else {
    // DD/MM/YY (and default): day-first with full year, matching topbar design.
    datePart = `${parts.day}/${parts.month}/${parts.year}`
  }

  const timePart = `${pad(Number(parts.hour))}:${pad(Number(parts.minute))}.${pad(Number(parts.second))} ${abbr}`
  return `${datePart} | ${timePart}`
}
