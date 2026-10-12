import type { SecuritySettings } from '../types/settings'

export type PasswordPolicy = SecuritySettings['passwordPolicy']

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minimumLength: 8,
  passwordExpiryDays: 90,
  requireUppercase: true,
  requireNumber: true,
  requireLowercase: true,
  requireSpecialChar: true,
}

export const DEFAULT_SESSION_TIMEOUT_MINUTES = 30

const SPECIAL_CHAR_REGEX = /[!@#$%^&*]/

// The length rule is always listed. The other rules appear only when that switch is on.
export function describePasswordPolicy(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
  const rules = [`Password must be at least ${policy.minimumLength} characters long.`]
  if (policy.requireUppercase) rules.push('Must include an uppercase letter (A-Z).')
  if (policy.requireLowercase) rules.push('Must include a lowercase letter (a-z).')
  if (policy.requireNumber) rules.push('Must include a number (0-9).')
  if (policy.requireSpecialChar) {
    rules.push('Must include a special character (!@#$%^&*).')
  }
  return rules
}

// Checks the password against the security settings. A missing length is treated as 8. Only the listed special characters count.
export function validatePasswordAgainstPolicy(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
) {
  const value = String(password || '')
  const errors: string[] = []

  if (value.length < Number(policy.minimumLength || 8)) {
    errors.push(`Password must be at least ${policy.minimumLength} characters long.`)
  }
  if (policy.requireUppercase && !/[A-Z]/.test(value)) {
    errors.push('Password must include an uppercase letter (A-Z).')
  }
  if (policy.requireLowercase && !/[a-z]/.test(value)) {
    errors.push('Password must include a lowercase letter (a-z).')
  }
  if (policy.requireNumber && !/[0-9]/.test(value)) {
    errors.push('Password must include a number (0-9).')
  }
  if (policy.requireSpecialChar && !SPECIAL_CHAR_REGEX.test(value)) {
    errors.push('Password must include a special character (!@#$%^&*).')
  }

  return {
    valid: errors.length === 0,
    errors,
    message: errors[0] ?? null,
  }
}
