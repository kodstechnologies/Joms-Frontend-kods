export const MOBILE_NUMBER_PATTERN = /^[0-9]{10}$/
const SCIENTIFIC_PHONE_PATTERN = /^[+-]?\d+(?:\.\d+)?[eE][+-]?\d+$/

// Only digits are kept, and the number is cut at 10 digits.
export const sanitizeMobileNumber = (value: string) => value.replace(/\D/g, '').slice(0, 10)

const unwrapExcelTextFormula = (value: string) => {
  let raw = value.trim()
  if (raw.startsWith("'")) raw = raw.slice(1).trim()
  const formula = raw.match(/^="([^"]+)"$/)
  if (formula) return formula[1]
  return raw
}

// An Excel formula or a scientific number is turned back into digits. A leading 0 or 91 is dropped so 10 digits remain.
export const normalizeImportedMobileNumber = (value: string): string => {
  const raw = unwrapExcelTextFormula(String(value || ''))
  if (!raw) return ''

  const compact = raw.replace(/\s+/g, '')
  if (SCIENTIFIC_PHONE_PATTERN.test(compact)) {
    const parsed = Number(compact)
    if (!Number.isFinite(parsed)) return ''
    const rounded = String(Math.round(Math.abs(parsed)))
    if (rounded.length === 10) return rounded
    return normalizeImportedMobileNumber(rounded)
  }

  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  if (digits.startsWith('91') && digits.length >= 12) return digits.slice(-10)
  if (digits.length > 10) return digits.slice(-10)
  return digits
}

// Detects a phone that Excel stored as a scientific number, including one wrapped in a text formula.
export const isScientificPhoneValue = (value: string) =>
  SCIENTIFIC_PHONE_PATTERN.test(unwrapExcelTextFormula(String(value || '')).replace(/\s+/g, ''))

// The number is required and must be exactly 10 digits.
export const validateMobileNumber = (value: string): string | null => {
  const phone = value.trim()
  if (!phone) return 'Phone number is required.'
  if (!MOBILE_NUMBER_PATTERN.test(phone)) {
    return 'Phone number must be a valid 10-digit number.'
  }
  return null
}
