import axios from 'axios'

export const MAX_UPLOAD_FILE_SIZE_MB = 100
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024

export const FILE_TOO_LARGE_MESSAGE = `Image size is too large. Maximum upload size is ${MAX_UPLOAD_FILE_SIZE_MB}MB.`

const readMessage = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data

    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = readMessage((data as { message?: unknown }).message)
      if (message) return message
    }

    if (typeof data === 'string' && data.trim()) {
      const trimmed = data.trim()
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed) as { message?: unknown }
          const message = readMessage(parsed.message)
          if (message) return message
        } catch {
          return FILE_TOO_LARGE_MESSAGE
        }
      }
      if (!trimmed.startsWith('<')) {
        return trimmed
      }
    }

    if (status === 413) {
      return FILE_TOO_LARGE_MESSAGE
    }

    if (
      error.code === 'ERR_NETWORK' &&
      /upload|multipart/i.test(String(error.config?.headers?.['Content-Type'] || ''))
    ) {
      return FILE_TOO_LARGE_MESSAGE
    }

    if (error.code === 'ERR_NETWORK' || (error as { isOffline?: boolean }).isOffline) {
      if ((error as { isOffline?: boolean }).isOffline || navigator.onLine === false) {
        return 'You are offline. Check your connection and try again.'
      }
    }

    return fallback
  }

  const shaped = error as { response?: { data?: { message?: unknown } } }
  const shapedMessage = readMessage(shaped?.response?.data?.message)
  if (shapedMessage) return shapedMessage

  if (error instanceof Error && error.message.trim()) {
    if (/status code 413/i.test(error.message)) {
      return FILE_TOO_LARGE_MESSAGE
    }
    if (/^request failed with status code \d+$/i.test(error.message.trim())) {
      return fallback
    }
    return error.message
  }

  return fallback
}

export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  return getApiErrorMessage(error, fallback)
}

export function assertFileWithinUploadLimit(file: File) {
  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error(FILE_TOO_LARGE_MESSAGE)
  }
}
