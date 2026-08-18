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
