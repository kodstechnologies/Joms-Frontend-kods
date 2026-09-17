import { useQuery } from '@tanstack/react-query'

import { settingsApiClient } from '@/shared/lib/axios'
import { firstDefinedBoolean, useAppRestrictions } from './use-app-restrictions'

export const EXPERT_PUBLIC_SETTINGS_KEY = ['expert-public-settings'] as const

export type ExpertPublicSettings = {
  allowNewAccounts: boolean
  maxDevicesPerUser: number
  phoneVerification: 'mandatory' | 'optional'
  kycMandatory: boolean
  accountDeletion: {
    allowPermanentDeletion: boolean
  }
}

const DEFAULT_EXPERT_PUBLIC_SETTINGS: ExpertPublicSettings = {
  allowNewAccounts: true,
  maxDevicesPerUser: 5,
  phoneVerification: 'mandatory',
  kycMandatory: true,
  accountDeletion: {
    allowPermanentDeletion: false,
  },
}

export const fetchExpertPublicSettings = async (): Promise<ExpertPublicSettings> => {
  const response = await settingsApiClient.get<{
    success: boolean
    data: ExpertPublicSettings
  }>('/settings/public/expert-account-creation')
  const data = response.data?.data
  return {
    ...DEFAULT_EXPERT_PUBLIC_SETTINGS,
    ...(data || {}),
    accountDeletion: {
      ...DEFAULT_EXPERT_PUBLIC_SETTINGS.accountDeletion,
      ...(data?.accountDeletion || {}),
    },
  }
}

export const useExpertPublicSettings = () => {
  return useQuery({
    queryKey: EXPERT_PUBLIC_SETTINGS_KEY,
    queryFn: fetchExpertPublicSettings,
    staleTime: 60_000,
    retry: 1,
  })
}

export const useExpertAccountControls = () => {
  const restrictions = useAppRestrictions()
  const publicSettings = useExpertPublicSettings()
  const isReady = restrictions.isSuccess || publicSettings.isSuccess
  const allowNewAccounts =
    firstDefinedBoolean(
      restrictions.data?.expert?.allowNewAccounts,
      publicSettings.data?.allowNewAccounts,
    ) ?? DEFAULT_EXPERT_PUBLIC_SETTINGS.allowNewAccounts

  return {
    isLoading: !isReady && (restrictions.isLoading || publicSettings.isLoading),
    isReady,
    allowNewAccounts: isReady ? allowNewAccounts : false,
    canCreateAccounts: isReady && allowNewAccounts,
  }
}
