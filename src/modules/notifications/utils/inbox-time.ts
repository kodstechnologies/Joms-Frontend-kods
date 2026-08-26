const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const formatInboxRelativeTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000))

  if (diffMinutes < 1) return 'Now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export const splitInboxByDay = <T extends { createdAt: string }>(items: T[]) => {
  const today: T[] = []
  const older: T[] = []
  const now = new Date()

  items.forEach((item) => {
    const createdAt = new Date(item.createdAt)
    if (!Number.isNaN(createdAt.getTime()) && isSameDay(createdAt, now)) {
      today.push(item)
    } else {
      older.push(item)
    }
  })

  return { todayItems: today, olderItems: older }
}
