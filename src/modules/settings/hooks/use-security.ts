import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchLockedAccounts, fetchLoginTrails, unlockAccount } from '../api/security-api'

export const securityKeys = {
  all: ['settings', 'security'] as const,
  lockedAccounts: (params?: object) => [...securityKeys.all, 'locked-accounts', params] as const,
  loginTrails: (params?: object) => [...securityKeys.all, 'login-trails', params] as const,
}

export const useLockedAccounts = (params?: { page?: number; limit?: number; search?: string }) =>
  useQuery({
    queryKey: securityKeys.lockedAccounts(params),
    queryFn: () => fetchLockedAccounts(params),
  })

export const useUnlockAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unlockAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: securityKeys.all })
    },
  })
}

export const useLoginTrails = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: securityKeys.loginTrails(params),
    queryFn: () => fetchLoginTrails(params),
  })
