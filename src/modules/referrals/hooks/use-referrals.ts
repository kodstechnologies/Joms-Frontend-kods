import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createBulkExpertInvites,
  createExpertInvite,
  deleteExpertInvite,
  fetchExpertInvites,
  fetchReferralStats,
  resendExpertInvite,
  type ExpertInviteListParams,
} from '../api/referral-api'
import type { BulkExpertInvitePayload, ExpertInvitePayload } from '../types/referral'

const invalidateReferrals = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
  queryClient.invalidateQueries({ queryKey: ['expert-invites'] })
}

export const useReferralStats = () =>
  useQuery({
    queryKey: ['referral-stats'],
    queryFn: fetchReferralStats,
  })

export const useExpertInvites = (params?: ExpertInviteListParams) =>
  useQuery({
    queryKey: ['expert-invites', params],
    queryFn: () => fetchExpertInvites(params),
  })

export const useCreateExpertInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExpertInvitePayload) => createExpertInvite(payload),
    onSuccess: () => invalidateReferrals(queryClient),
  })
}

export const useCreateBulkExpertInvites = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BulkExpertInvitePayload) => createBulkExpertInvites(payload),
    onSuccess: () => invalidateReferrals(queryClient),
  })
}

export const useDeleteExpertInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExpertInvite(id),
    onSuccess: () => invalidateReferrals(queryClient),
  })
}

export const useResendExpertInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resendExpertInvite(id),
    onSuccess: () => invalidateReferrals(queryClient),
  })
}
