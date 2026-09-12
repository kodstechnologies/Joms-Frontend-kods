const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export function normalizePanNumber(value: string): string {
  return value.trim().toUpperCase()
}

export function normalizeGstNumber(value: string): string {
  return value.trim().toUpperCase()
}

export function validatePanNumber(value: string): string | null {
  const pan = normalizePanNumber(value)
  if (!pan) return 'PAN number is required.'
  if (!PAN_PATTERN.test(pan)) return 'Invalid PAN number format (e.g. ABCDE1234F).'
  return null
}

export function validateGstNumber(value: string): string | null {
  const gst = normalizeGstNumber(value)
  if (!gst) return 'GST number is required.'
  if (!GST_PATTERN.test(gst)) return 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5).'
  return null
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    new URL(normalized)
    return true
  } catch {
    return false
  }
}
