import { securityDefaults } from '@/modules/settings/config/settings.config'
import type { SecuritySettings } from '@/modules/settings/types/settings'

type LegacyMfa = SecuritySettings['mfa'] & { requireForAllAdmins?: boolean }

export const MFA_METHOD_KEYS = ['authenticatorApp', 'smsOtp', 'emailOtp'] as const

export type MfaMethodKey = (typeof MFA_METHOD_KEYS)[number]

// When more than one method is switched on, email is the one that is kept.
export function selectedMfaMethod(mfa: Pick<SecuritySettings['mfa'], MfaMethodKey>): MfaMethodKey {
  const enabled = MFA_METHOD_KEYS.filter((key) => mfa[key])
  if (enabled.length === 1) return enabled[0]
  return 'emailOtp'
}

// Only the chosen method stays on. The other two are switched off.
export function selectSingleMfaMethod(
  method: MfaMethodKey,
): Pick<SecuritySettings['mfa'], MfaMethodKey> {
  return {
    authenticatorApp: method === 'authenticatorApp',
    smsOtp: method === 'smsOtp',
    emailOtp: method === 'emailOtp',
  }
}

// An older all-admins switch is read as the sub-admin switch. More than one method is reduced to a single method.
export function normalizeSecuritySettings(config: SecuritySettings): SecuritySettings {
  const mfa = config.mfa as LegacyMfa

  const requireForAllSubAdmins =
    typeof mfa.requireForAllSubAdmins === 'boolean'
      ? mfa.requireForAllSubAdmins
      : typeof mfa.requireForAllAdmins === 'boolean'
        ? mfa.requireForAllAdmins
        : securityDefaults.mfa.requireForAllSubAdmins

  const methodFlags = {
    authenticatorApp: mfa.authenticatorApp ?? securityDefaults.mfa.authenticatorApp,
    smsOtp: mfa.smsOtp ?? securityDefaults.mfa.smsOtp,
    emailOtp: mfa.emailOtp ?? securityDefaults.mfa.emailOtp,
  }

  return {
    ...config,
    mfa: {
      requireForAllSubAdmins,
      ...selectSingleMfaMethod(selectedMfaMethod(methodFlags)),
    },
  }
}

export function countEnabledMfaMethods(mfa: SecuritySettings['mfa']) {
  return MFA_METHOD_KEYS.filter((key) => mfa[key]).length
}
