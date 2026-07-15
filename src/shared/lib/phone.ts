export const MOBILE_NUMBER_PATTERN = /^[0-9]{10}$/

export const sanitizeMobileNumber = (value: string) => value.replace(/\D/g, '').slice(0, 10)

export const validateMobileNumber = (value: string): string | null => {
  const phone = value.trim()
  if (!phone) return 'Phone number is required.'
  if (!MOBILE_NUMBER_PATTERN.test(phone)) {
    return 'Phone number must be a valid 10-digit number.'
  }
  return null
}
