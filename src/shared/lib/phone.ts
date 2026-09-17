export const MOBILE_NUMBER_PATTERN = /^[0-9]{10}$/

export const sanitizeMobileNumber = (value: string) => value.replace(/\D/g, '').slice(0, 10)

/** Normalize pasted/imported numbers such as +91 98765 43210 or 09876543210. */
export const normalizeImportedMobileNumber = (value: string) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  if (digits.startsWith('91') && digits.length >= 12) return digits.slice(-10)
  if (digits.length > 10) return digits.slice(-10)
  return digits
}

export const validateMobileNumber = (value: string): string | null => {
  const phone = value.trim()
  if (!phone) return 'Phone number is required.'
  if (!MOBILE_NUMBER_PATTERN.test(phone)) {
    return 'Phone number must be a valid 10-digit number.'
  }
  return null
}
