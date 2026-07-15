import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchExpertApplicationView,
  updateExpertBankingStatus,
  updateExpertKycStatus,
} from '../api/expert-application-api'
import {
  useEscalatePartnerApplication,
  useEscalationAssignees as useSharedEscalationAssignees,
  useStartAdminEscalationReview,
} from '@/modules/my-tasks/hooks/use-admin-escalation'
import type { BankingDecisionPayload, KycDecisionPayload } from '../type/expert-application-view'

export const useExpertApplicationView = (id?: string) =>
  useQuery({
    queryKey: ['expert-application-view', id],
    queryFn: () => fetchExpertApplicationView(id as string),
    enabled: Boolean(id),
  })

const invalidateExpertApplicationQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  partnerId?: string,
) => {
  if (partnerId) {
    void queryClient.invalidateQueries({
      queryKey: ['expert-application-view', partnerId],
    })
    void queryClient.refetchQueries({
      queryKey: ['expert-application-view', partnerId],
    })
  } else {
    void queryClient.invalidateQueries({ queryKey: ['expert-application-view'] })
  }
  void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
  void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
  void queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
  void queryClient.invalidateQueries({ queryKey: ['experts'] })
}

export const useUpdateExpertKycStatus = (kycId?: string, partnerId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: KycDecisionPayload) => updateExpertKycStatus(kycId as string, payload),
    onSuccess: () => {
      invalidateExpertApplicationQueries(queryClient, partnerId)
    },
  })
}

export const useUpdateExpertBankingStatus = (bankingId?: string, partnerId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BankingDecisionPayload) =>
      updateExpertBankingStatus(bankingId as string, payload),
    onSuccess: () => {
      invalidateExpertApplicationQueries(queryClient, partnerId)
    },
  })
}

export const useEscalationAssignees = (permission = 'experts.*') =>
  useSharedEscalationAssignees(permission)

export const useEscalateExpertApplication = (id?: string) => useEscalatePartnerApplication(id)

export const useStartEscalationReviewOnView = (id?: string) =>
  useStartAdminEscalationReview('partner', id)
