import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { env } from '@/config/env'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { fetchSettings } from '@/modules/settings/api/settings-api'
import { settingsKeys } from '@/modules/settings/hooks/use-settings'
import type { SecuritySettings } from '@/modules/settings/types/settings'
import {
  DEFAULT_PASSWORD_POLICY,
  DEFAULT_SESSION_TIMEOUT_MINUTES,
} from '@/modules/settings/utils/password-policy'

type PublicSecurityPolicy = {
  sessionTimeout: SecuritySettings['sessionTimeout']
  passwordPolicy: SecuritySettings['passwordPolicy']
}

async function fetchPublicSecurityPolicy(): Promise<PublicSecurityPolicy> {
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
  }
}

/**
 * Prefer authenticated settings when logged in (reflects draft-saved values);
 * fall back to public policy endpoint for password forms before/without auth context.
 */
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

  return {
    passwordPolicy,
    sessionTimeoutMinutes,
    isLoading: authedQuery.isLoading || publicQuery.isLoading,
  }
}
