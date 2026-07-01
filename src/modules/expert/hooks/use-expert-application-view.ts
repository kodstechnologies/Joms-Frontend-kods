import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchExpertApplicationView,
  updateExpertBankingStatus,
  updateExpertKycStatus,
} from '../api/expert-application-api'
import type {
  BankingDecisionPayload,
  KycDecisionPayload,
} from '../type/expert-application-view'

export const useExpertApplicationView = (id?: string) =>
  useQuery({
    queryKey: ['expert-application-view', id],
    queryFn: () => fetchExpertApplicationView(id as string),
    enabled: Boolean(id),
  })

export const useUpdateExpertKycStatus = (id?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: KycDecisionPayload) =>
      updateExpertKycStatus(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-application-view', id] })
    },
  })
}

export const useUpdateExpertBankingStatus = (id?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BankingDecisionPayload) =>
      updateExpertBankingStatus(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-application-view', id] })
    },
  })
}
