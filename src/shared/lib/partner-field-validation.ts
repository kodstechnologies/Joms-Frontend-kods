const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const AADHAAR_PATTERN = /^[2-9][0-9]{11}$/
const PASSPORT_PATTERN = /^[A-Z][0-9]{7}$/
const DRIVING_LICENSE_PATTERN = /^[A-Z]{2}[0-9]{13}$/
const VOTER_ID_PATTERN = /^[A-Z]{3}[0-9]{7}$/

export const GOVERNMENT_ID_TYPES = [
  'Aadhaar',
  'PAN',
  'Passport',
  'Driving License',
  'Voter ID',
] as const

export type GovernmentIdType = (typeof GOVERNMENT_ID_TYPES)[number]

export const GOVERNMENT_ID_META: Record<
  GovernmentIdType,
  { placeholder: string; formatHint: string; maxLength: number; inputMode?: 'numeric' | 'text' }
> = {
  Aadhaar: {
    placeholder: '234567890123',
    formatHint: '12 digits, cannot start with 0 or 1',
    maxLength: 12,
    inputMode: 'numeric',
  },
  PAN: {
    placeholder: 'ABCDE1234F',
    formatHint: 'Format: ABCDE1234F',
    maxLength: 10,
  },
  Passport: {
    placeholder: 'A1234567',
    formatHint: '1 letter followed by 7 digits (e.g. A1234567)',
    maxLength: 8,
  },
  'Driving License': {
    placeholder: 'MH1420110012345',
    formatHint: '2-letter state code + 13 digits (e.g. MH1420110012345)',
    maxLength: 15,
  },
  'Voter ID': {
    placeholder: 'ABC1234567',
    formatHint: '3 letters followed by 7 digits (e.g. ABC1234567)',
    maxLength: 10,
  },
}

const ID_TYPE_ALIASES: Record<string, GovernmentIdType> = {
  aadhaar: 'Aadhaar',
  aadhar: 'Aadhaar',
  pan: 'PAN',
  passport: 'Passport',
  'driving license': 'Driving License',
  'driving licence': 'Driving License',
  dl: 'Driving License',
  'voter id': 'Voter ID',
  voterid: 'Voter ID',
  epic: 'Voter ID',
}

export function isGovernmentIdType(value: string): value is GovernmentIdType {
  return (GOVERNMENT_ID_TYPES as readonly string[]).includes(value)
}

export function getGovernmentIdMeta(idType: string) {
  const type = normalizeGovernmentIdType(idType)
  return type ? GOVERNMENT_ID_META[type] : null
}

export function normalizeGovernmentIdType(value: string): GovernmentIdType | '' {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (isGovernmentIdType(trimmed)) return trimmed
  return ID_TYPE_ALIASES[trimmed.toLowerCase()] || ''
}

export function normalizePanNumber(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

export function normalizeGstNumber(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

export function sanitizePanInput(value: string): string {
  return normalizePanNumber(value).slice(0, 10)
}

export function sanitizeGstInput(value: string): string {
  return normalizeGstNumber(value).slice(0, 15)
}

export function normalizeGovernmentIdNumber(idType: string, value: string): string {
  const type = normalizeGovernmentIdType(idType)
  const raw = value.trim()
  switch (type) {
    case 'Aadhaar':
      return raw.replace(/\D/g, '').slice(0, 12)
    case 'PAN':
      return sanitizePanInput(raw)
    case 'Passport':
      return raw
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, 8)
    case 'Driving License':
      return raw
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, 15)
    case 'Voter ID':
      return raw
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, 10)
    default:
      return raw
  }
}

export function sanitizeGovernmentIdInput(idType: string, value: string): string {
  return normalizeGovernmentIdNumber(idType, value)
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

export function validateGovernmentIdType(value: string): string | null {
  if (!value.trim()) return 'ID type is required.'
  if (!normalizeGovernmentIdType(value)) {
    return 'Please select a valid ID type (Aadhaar, PAN, Passport, Driving License, or Voter ID).'
  }
  return null
}

export function validateGovernmentIdNumber(idType: string, value: string): string | null {
  const type = normalizeGovernmentIdType(idType)
  if (!type) {
    return value.trim()
      ? 'Select a valid ID type to validate the ID number.'
      : 'ID number is required.'
  }

  const normalized = normalizeGovernmentIdNumber(type, value)
  if (!normalized) return 'ID number is required.'

  switch (type) {
    case 'Aadhaar':
      if (!AADHAAR_PATTERN.test(normalized)) {
        return 'Invalid Aadhaar number. Enter 12 digits starting with 2-9.'
      }
      break
    case 'PAN':
      if (!PAN_PATTERN.test(normalized)) {
        return 'Invalid PAN number format (e.g. ABCDE1234F).'
      }
      break
    case 'Passport':
      if (!PASSPORT_PATTERN.test(normalized)) {
        return 'Invalid Passport number format (e.g. A1234567).'
      }
      break
    case 'Driving License':
      if (!DRIVING_LICENSE_PATTERN.test(normalized)) {
        return 'Invalid Driving License format (e.g. MH1420110012345).'
      }
      break
    case 'Voter ID':
      if (!VOTER_ID_PATTERN.test(normalized)) {
        return 'Invalid Voter ID format (e.g. ABC1234567).'
      }
      break
  }

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
