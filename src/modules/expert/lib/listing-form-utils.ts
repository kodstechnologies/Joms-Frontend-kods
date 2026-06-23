import axios from 'axios'

export const parsePrice = (value: string) => {
  const numeric = value.replace(/[^\d.]/g, '')
  const parsed = Number.parseFloat(numeric)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const normalizeTimelineUnit = (unit: string) => unit.toLowerCase().replace(/s$/, '')

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}

export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const

export const CONSULTATION_MODES = [
  { label: 'Audio', value: 'audio' },
  { label: 'Video', value: 'video' },
  { label: 'Chat', value: 'chat' },
] as const
