import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { env } from '@/config/env'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { fetchSettings } from '@/modules/settings/api/settings-api'
import { settingsKeys } from '@/modules/settings/hooks/use-settings'
import type { SecuritySettings } from '@/modules/settings/types/settings'
import { securityDefaults } from '@/modules/settings/defaults/settings.defaults'
import {
  DEFAULT_PASSWORD_POLICY,
  DEFAULT_SESSION_TIMEOUT_MINUTES,
} from '@/modules/settings/utils/password-policy'

type PublicSecurityPolicy = {
  sessionTimeout: SecuritySettings['sessionTimeout']
  passwordPolicy: SecuritySettings['passwordPolicy']
  mfa?: SecuritySettings['mfa'] & { requireForAllAdmins?: boolean }
}

function normalizeMfaPolicy(
  mfa: PublicSecurityPolicy['mfa'] | SecuritySettings['mfa'] | undefined,
): SecuritySettings['mfa'] {
  const source = mfa || securityDefaults.mfa
  const legacyRequireForAllAdmins = (source as { requireForAllAdmins?: boolean })
    .requireForAllAdmins
  return {
    requireForAllSubAdmins:
      typeof source.requireForAllSubAdmins === 'boolean'
        ? source.requireForAllSubAdmins
        : typeof legacyRequireForAllAdmins === 'boolean'
          ? legacyRequireForAllAdmins
          : securityDefaults.mfa.requireForAllSubAdmins,
    authenticatorApp: source.authenticatorApp ?? securityDefaults.mfa.authenticatorApp,
    smsOtp: source.smsOtp ?? securityDefaults.mfa.smsOtp,
    emailOtp: source.emailOtp ?? securityDefaults.mfa.emailOtp,
  }
}

async function fetchPublicSecurityPolicy(): Promise<
  PublicSecurityPolicy & { mfa: SecuritySettings['mfa'] }
> {
  const response = await axios.get<{
    success: boolean
    data: PublicSecurityPolicy
  }>(`${env.settingsApiBaseUrl}/settings/public/security-policy`, {
    timeout: 10000,
  })
  return {
    sessionTimeout: {
      durationMinutes:
        response.data.data?.sessionTimeout?.durationMinutes ?? DEFAULT_SESSION_TIMEOUT_MINUTES,
    },
    passwordPolicy: {
      ...DEFAULT_PASSWORD_POLICY,
      ...(response.data.data?.passwordPolicy || {}),
    },
    mfa: normalizeMfaPolicy(response.data.data?.mfa),
  }
}

export function useSecurityPolicy() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)

  const authedQuery = useQuery({
    queryKey: settingsKeys.module('security'),
    queryFn: () => fetchSettings('security'),
    enabled: Boolean(isAuthenticated && token),
    staleTime: 60_000,
    retry: 1,
  })

  const publicQuery = useQuery({
    queryKey: ['settings', 'public', 'security-policy'],
    queryFn: fetchPublicSecurityPolicy,
    enabled: !isAuthenticated || !token || authedQuery.isError,
    staleTime: 60_000,
    retry: 1,
  })

  const config = (authedQuery.data?.config || publicQuery.data) as
    Partial<SecuritySettings> | PublicSecurityPolicy | undefined

  const passwordPolicy = {
    ...DEFAULT_PASSWORD_POLICY,
    ...(config && 'passwordPolicy' in config ? config.passwordPolicy : {}),
  }

  const sessionTimeoutMinutes =
    (config && 'sessionTimeout' in config ? config.sessionTimeout?.durationMinutes : undefined) ??
    DEFAULT_SESSION_TIMEOUT_MINUTES

  const mfa = normalizeMfaPolicy(
    config && 'mfa' in config ? (config.mfa as SecuritySettings['mfa']) : undefined,
  )

  return {
    passwordPolicy,
    sessionTimeoutMinutes,
    mfa,
    isLoading: authedQuery.isLoading || publicQuery.isLoading,
  }
}
