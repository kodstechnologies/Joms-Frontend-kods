import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  escalateExpertApplication,
  fetchEscalationAssignees,
  fetchExpertApplicationView,
  updateExpertBankingStatus,
  updateExpertKycStatus,
} from '../api/expert-application-api'
import { startEscalationReview } from '@/modules/my-tasks/api/my-tasks-api'
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
    },
  })
}

export const useEscalationAssignees = (permission = 'experts.*') =>
  useQuery({
    queryKey: ['expert-escalation-assignees', permission],
    queryFn: () => fetchEscalationAssignees(permission),
  })

export const useEscalateExpertApplication = (id?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      assigneeSubAdminId: string
      assigneeName?: string
      adminNote: string
      escalationTarget?: 'kyc' | 'banking' | 'application'
    }) => escalateExpertApplication(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-application-view', id] })
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useStartEscalationReviewOnView = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => startEscalationReview(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['expert-application-view', id] })
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
    },
  })
}
