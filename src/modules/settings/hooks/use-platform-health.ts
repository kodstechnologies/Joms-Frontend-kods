import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  fetchPlatformHealthDashboard,
  fetchPlatformHealthInfrastructure,
  fetchPlatformHealthMetrics,
  fetchPlatformHealthOperations,
  fetchPlatformHealthPlatformTrends,
  fetchPlatformHealthSecurityCompliance,
  fetchPlatformHealthSystemPerformance,
} from '../api/platform-health.api'
import type { PlatformHealthFilters } from '../types/platform-health'

const SECTION_STALE_TIME = 30_000
const SECTION_REFETCH_INTERVAL = 60_000

export const platformHealthQueryKeys = {
  all: ['platform-health'] as const,
  dashboard: (filters: PlatformHealthFilters) => ['platform-health', 'dashboard', filters] as const,
  metrics: (filters: PlatformHealthFilters) => ['platform-health', 'metrics', filters] as const,
  platformTrends: (filters: PlatformHealthFilters) =>
    ['platform-health', 'platform-trends', filters] as const,
  systemPerformance: (filters: PlatformHealthFilters) =>
    ['platform-health', 'system-performance', filters] as const,
  securityCompliance: (filters: PlatformHealthFilters) =>
    ['platform-health', 'security-compliance', filters] as const,
  infrastructure: (filters: PlatformHealthFilters) =>
    ['platform-health', 'infrastructure', filters] as const,
  operations: (filters: PlatformHealthFilters) =>
    ['platform-health', 'operations', filters] as const,
}

export const usePlatformHealthDashboard = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.dashboard(filters),
    queryFn: () => fetchPlatformHealthDashboard(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthMetrics = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.metrics(filters),
    queryFn: () => fetchPlatformHealthMetrics(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthPlatformTrends = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.platformTrends(filters),
    queryFn: () => fetchPlatformHealthPlatformTrends(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthSystemPerformance = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.systemPerformance(filters),
    queryFn: () => fetchPlatformHealthSystemPerformance(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthSecurityCompliance = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.securityCompliance(filters),
    queryFn: () => fetchPlatformHealthSecurityCompliance(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthInfrastructure = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.infrastructure(filters),
    queryFn: () => fetchPlatformHealthInfrastructure(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthOperations = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.operations(filters),
    queryFn: () => fetchPlatformHealthOperations(filters),
    staleTime: SECTION_STALE_TIME,
    refetchInterval: SECTION_REFETCH_INTERVAL,
    retry: 2,
  })
}

export const usePlatformHealthSections = (
  filters: PlatformHealthFilters = {},
  infrastructureFilters: PlatformHealthFilters = filters,
) => {
  const queryClient = useQueryClient()

  const metricsQuery = usePlatformHealthMetrics(filters)
  const platformTrendsQuery = usePlatformHealthPlatformTrends(filters)
  const systemPerformanceQuery = usePlatformHealthSystemPerformance(filters)
  const securityComplianceQuery = usePlatformHealthSecurityCompliance(filters)
  const infrastructureQuery = usePlatformHealthInfrastructure(infrastructureFilters)
  const operationsQuery = usePlatformHealthOperations(filters)

  const refetchAll = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: platformHealthQueryKeys.all })
  }, [queryClient])

  return {
    metricsQuery,
    platformTrendsQuery,
    systemPerformanceQuery,
    securityComplianceQuery,
    infrastructureQuery,
    operationsQuery,
    refetchAll,
  }
}
