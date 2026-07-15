export const displayExpertValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && value.trim() === '') return 'N/A'
  return String(value)
}

export const formatListingExpertId = (id?: string | null) => {
  if (!id?.trim()) return 'N/A'
  return `EXP-${id.slice(-4).toUpperCase()}`
}

export const formatApplicationExpertId = (id?: string | null) => {
  if (!id?.trim()) return 'N/A'
  return `#EXP${id.slice(-4).toUpperCase()}`
}

export const formatExpertDateTime = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
