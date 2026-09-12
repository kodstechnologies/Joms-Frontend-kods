import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  activateMembership,
  createMembership,
  deactivateMembership,
  deleteMembership,
  fetchMembershipById,
  fetchMembershipFeatures,
  fetchMemberships,
  fetchMembershipStats,
  fetchMembershipVersions,
  pauseMembership,
  resumeMembership,
  setMembershipValidity,
  updateMembership,
} from '../api/membership-api'
import type {
  CreateMembershipPayload,
  DeleteMembershipPayload,
  MembershipStatus,
  MembershipType,
  PauseMembershipPayload,
  ResumeMembershipPayload,
  SetValidityPayload,
} from '../types/membership'

export const useMemberships = (params?: {
  type?: MembershipType
  status?: MembershipStatus
  search?: string
  page?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: ['memberships', params],
    queryFn: () => fetchMemberships(params),
  })
}

export const useMembershipStats = (type: MembershipType = 'expert') => {
  return useQuery({
    queryKey: ['membership-stats', type],
    queryFn: () => fetchMembershipStats(type),
  })
}

export const useMembership = (id: string) => {
  return useQuery({
    queryKey: ['membership', id],
    queryFn: () => fetchMembershipById(id),
    enabled: !!id,
  })
}

export const useMembershipFeatures = (id: string, enabled = false) => {
  return useQuery({
    queryKey: ['membership-features', id],
    queryFn: () => fetchMembershipFeatures(id),
    enabled: enabled && !!id,
  })
}

export const useMembershipVersions = (id: string, enabled = false) => {
  return useQuery({
    queryKey: ['membership-versions', id],
    queryFn: () => fetchMembershipVersions(id),
    enabled: enabled && !!id,
  })
}

const invalidateMembershipQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['memberships'] })
  queryClient.invalidateQueries({ queryKey: ['membership-stats'] })
  queryClient.invalidateQueries({ queryKey: ['membership'] })
}

export const useCreateMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMembershipPayload) => createMembership(payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const useUpdateMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateMembershipPayload> }) =>
      updateMembership(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const usePauseMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PauseMembershipPayload }) =>
      pauseMembership(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const useResumeMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResumeMembershipPayload }) =>
      resumeMembership(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const useDeactivateMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResumeMembershipPayload }) =>
      deactivateMembership(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const useActivateMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResumeMembershipPayload }) =>
      activateMembership(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const useSetMembershipValidity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetValidityPayload }) =>
      setMembershipValidity(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}

export const useDeleteMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DeleteMembershipPayload }) =>
      deleteMembership(id, payload),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  })
}
