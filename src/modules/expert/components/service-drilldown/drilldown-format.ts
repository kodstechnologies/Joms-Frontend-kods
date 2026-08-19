export const DASH = '—'

export const formatCurrency = (value?: number | null, currency = 'INR', fractionDigits = 0) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return DASH
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value))
}

export const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return DASH
  return new Intl.NumberFormat('en-IN').format(Number(value))
}

export const formatPercent = (value?: number | null, fractionDigits = 1) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return DASH
  return `${Number(value).toFixed(fractionDigits)}%`
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatDateTimeIst = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return `${date.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })} IST`
}

export const formatTimelineStamp = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  const day = date.getDate()
  const month = date.toLocaleString('en-GB', { month: 'short' })
  const year = date.getFullYear()
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return `${day} ${month} ${year} - ${time}`
}

export const formatMessageTime = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export const formatMessageDate = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
}

export const formatOrdinalDate = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th'
  const month = date.toLocaleString('en-GB', { month: 'short' })
  return `${day}${suffix} ${month} ${date.getFullYear()}`
}

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return formatDate(value)

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatDate(value)
}

export const formatDate = (value?: string | null) => {
  if (!value) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const titleCase = (value?: string | null) => {
  if (!value) return DASH
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
