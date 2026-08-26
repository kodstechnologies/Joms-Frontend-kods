export const formatReferralDate = (value?: string | null) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export const formatReferralDateTime = (value?: string | null) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
}

export const formatReferralDateRange = (start?: string | null, end?: string | null) => {
  if (!start) return { range: '—', days: '—' }

  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000)

  const startLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(startDate)

  const endLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(endDate)

  const days = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    range: `${startLabel}- ${endLabel}`,
    days: `${days} Days`,
  }
}

export const getReferralStatusClassName = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'status-badge-accepted'
    case 'pending':
      return 'status-badge-pending'
    case 'rejected':
      return 'status-badge-expired'
    case 'expired':
      return 'status-badge-expired'
    default:
      return 'status-badge-default'
  }
}

export const getReferralStatusLabel = (status: string, statusLabel?: string | null) => {
  if (statusLabel) return statusLabel
  switch (status) {
    case 'accepted':
      return 'Successful'
    case 'pending':
      return 'Invited'
    case 'rejected':
      return 'Cancelled'
    case 'expired':
      return 'Expired'
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'
  }
}

export const formatInviteDetailDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th'

  const month = new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date)
  const time = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${day}${suffix} ${month}, ${time}`
}

export const getInvitedByLabel = (invitedBy?: string) => {
  if (!invitedBy || invitedBy.toLowerCase() === 'admin') return 'Platform'
  return invitedBy
}
