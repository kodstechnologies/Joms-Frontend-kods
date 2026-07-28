import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPolicy,
  createPolicyVersion,
  fetchPolicies,
  fetchPolicy,
  fetchPolicyVersions,
  publishPolicy,
  updatePolicy,
} from '../api/policies-api'
import type { PolicyApplication, PolicyStatus } from '../types/settings'

export const policyKeys = {
  all: ['settings', 'policies'] as const,
  list: () => [...policyKeys.all, 'list'] as const,
  detail: (slug: string) => [...policyKeys.all, 'detail', slug] as const,
  versions: (slug: string) => [...policyKeys.all, 'versions', slug] as const,
}

export const usePolicies = (application?: PolicyApplication) =>
  useQuery({
    queryKey: [...policyKeys.list(), application ?? 'all'] as const,
    queryFn: () => fetchPolicies(application),
  })

export const usePolicy = (slug: string) =>
  useQuery({
    queryKey: policyKeys.detail(slug),
    queryFn: () => fetchPolicy(slug),
    enabled: Boolean(slug),
  })

export const usePolicyVersions = (slug: string) =>
  useQuery({
    queryKey: policyKeys.versions(slug),
    queryFn: () => fetchPolicyVersions(slug),
    enabled: Boolean(slug),
  })

export const useCreatePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: policyKeys.all })
    },
  })
}

export const useUpdatePolicy = (slug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { content?: string; changeSummary?: string; author?: string }) =>
      updatePolicy(slug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: policyKeys.all })
    },
  })
}

export const useCreatePolicyVersion = (slug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      version: string
      status?: PolicyStatus
      effectiveDate?: string
      effectiveAt?: string | null
      author?: string
      changeSummary?: string
      content?: string
      requireReConsent?: boolean
      blockAppUsageUntilAccepted?: boolean
      notifyVia?: import('../types/settings').PolicyNotifyVia
    }) => createPolicyVersion(slug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: policyKeys.all })
    },
  })
}

export const usePublishPolicy = (slug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: string) => publishPolicy(slug, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: policyKeys.all })
    },
  })
}
