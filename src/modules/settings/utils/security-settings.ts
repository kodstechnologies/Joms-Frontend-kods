import { securityDefaults } from '@/modules/settings/defaults/settings.defaults'
import type { SecuritySettings } from '@/modules/settings/types/settings'

type LegacyMfa = SecuritySettings['mfa'] & { requireForAllAdmins?: boolean }

export function normalizeSecuritySettings(config: SecuritySettings): SecuritySettings {
  const mfa = config.mfa as LegacyMfa

  const normalizedMfa = {
    requireForAllSubAdmins:
      typeof mfa.requireForAllSubAdmins === 'boolean'
        ? mfa.requireForAllSubAdmins
        : typeof mfa.requireForAllAdmins === 'boolean'
          ? mfa.requireForAllAdmins
          : securityDefaults.mfa.requireForAllSubAdmins,
    authenticatorApp: mfa.authenticatorApp ?? securityDefaults.mfa.authenticatorApp,
    smsOtp: mfa.smsOtp ?? securityDefaults.mfa.smsOtp,
    emailOtp: mfa.emailOtp ?? securityDefaults.mfa.emailOtp,
  }

  if (countEnabledMfaMethods(normalizedMfa) === 0) {
    normalizedMfa.emailOtp = true
  }

  return {
    ...config,
    mfa: normalizedMfa,
  }
}

export const MFA_METHOD_KEYS = ['authenticatorApp', 'smsOtp', 'emailOtp'] as const

export function countEnabledMfaMethods(mfa: SecuritySettings['mfa']) {
  return MFA_METHOD_KEYS.filter((key) => mfa[key]).length
}
