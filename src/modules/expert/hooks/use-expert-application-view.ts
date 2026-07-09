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
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
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
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
    },
  })
}

export const useEscalationAssignees = (permission = 'experts.*') =>
  useSharedEscalationAssignees(permission)

export const useEscalateExpertApplication = (id?: string) =>
  useEscalatePartnerApplication(id)

export const useStartEscalationReviewOnView = (id?: string) =>
  useStartAdminEscalationReview('partner', id)
