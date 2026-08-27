export function readJwtExpiryMs(token: string): number | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='))
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function isAccessTokenUnusable(token?: string | null) {
  if (!token || !token.includes('.')) return true
  const expiresAt = readJwtExpiryMs(token)
  if (expiresAt == null) return false
  return expiresAt <= Date.now() + 5000
}
