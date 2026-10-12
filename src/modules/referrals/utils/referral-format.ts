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

// A missing end date is treated as 45 days after the start. The span is never shown as less than one day.
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

// An accepted status, a success label, or any signup date or referred user counts as used.
export const isReferralUsed = (
  invite?: {
    status?: string | null
    statusLabel?: string | null
    acceptedAt?: string | null
    signupDate?: string | null
    partnerSignupAt?: string | null
    referredUserId?: string | null
  } | null,
) => {
  if (!invite) return false
  if (invite.status === 'accepted') return true
  if (invite.statusLabel && /success/i.test(invite.statusLabel)) return true
  return Boolean(
    invite.acceptedAt || invite.signupDate || invite.partnerSignupAt || invite.referredUserId,
  )
}

// A rejected invite uses the same badge as an expired one.
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

// A stored label is shown as it is. Otherwise accepted is Successful, pending is Invited, and rejected is Cancelled.
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

// The day gets st, nd, rd, or th. The 11th, 12th, and 13th stay th.
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

// An invite from an admin, or one with no name, is shown as the platform.
export const getInvitedByLabel = (invitedBy?: string) => {
  if (!invitedBy || invitedBy.toLowerCase() === 'admin') return 'Platform'
  return invitedBy
}
