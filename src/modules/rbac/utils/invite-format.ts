export const formatInviteTimestamp = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  const time = date
    .toLocaleString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s/g, '')
    .toUpperCase()
  const day = date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
  return `${time} ${day}`
}

export const resolveInviteLink = (invite?: {
  inviteLink?: string | null
  inviteId?: string
  email?: string
}) => {
  const fromApi = String(invite?.inviteLink || '').trim()
  if (fromApi) return fromApi

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  if (!origin) return ''

  const url = new URL('/auth/login', origin)
  if (invite?.email) url.searchParams.set('email', invite.email)
  if (invite?.inviteId) url.searchParams.set('invite', invite.inviteId)
  return url.toString()
}

export const copyInviteLink = async (invite?: {
  inviteLink?: string | null
  inviteId?: string
  email?: string
}) => {
  const link = resolveInviteLink(invite)
  if (!link) {
    throw new Error('Invitation link is unavailable')
  }
  await navigator.clipboard.writeText(link)
  return link
}
