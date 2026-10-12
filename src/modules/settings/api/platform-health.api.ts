import { settingsApiClient } from '@/shared/lib/axios'
import {
  normalizePlatformHealthDashboard,
  normalizePlatformHealthMetrics,
  normalizePlatformHealthPlatformTrends,
  normalizePlatformHealthSystemPerformance,
  normalizePlatformHealthSecurityCompliance,
  normalizePlatformHealthInfrastructure,
  normalizePlatformHealthOperations,
} from '../utils/normalize-platform-health-dashboard'
import type {
  PlatformHealthDashboard,
  PlatformHealthFilters,
  PlatformHealthInfraRow,
  PlatformHealthMetric,
} from '../types/platform-health'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

const buildParams = (filters: PlatformHealthFilters): Record<string, string> => {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value)
    }
  }
  return params
}

export type PlatformHealthMetricsSection = {
  metrics: PlatformHealthMetric[]
  summary: PlatformHealthDashboard['summary']
  filters: PlatformHealthDashboard['filters']
}

export type PlatformHealthPlatformTrendsSection = {
  healthTrend: PlatformHealthDashboard['charts']['healthTrend']
  apiTraffic: PlatformHealthDashboard['charts']['apiTraffic']
  platformTrends: PlatformHealthDashboard['charts']['platformTrends']
}

export type PlatformHealthSystemPerformanceSection = {
  performance: PlatformHealthDashboard['charts']['performance']
  systemPerformance24h: PlatformHealthDashboard['charts']['systemPerformance24h']
}

export type PlatformHealthSecurityComplianceSection = {
  securityCompliance: PlatformHealthDashboard['charts']['securityCompliance']
}

export type PlatformHealthInfrastructureSection = {
  infrastructure: PlatformHealthInfraRow[]
}

export type PlatformHealthOperationsSection = {
  backupTrend: PlatformHealthDashboard['charts']['backupTrend']
  incidentTimeline: PlatformHealthDashboard['charts']['incidentTimeline']
  errorDistribution: PlatformHealthDashboard['charts']['errorDistribution']
  infrastructureUtilization: PlatformHealthDashboard['charts']['infrastructureUtilization']
}

export const fetchPlatformHealthDashboard = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthDashboard> => {
  const res = await settingsApiClient.get<ApiEnvelope<PlatformHealthDashboard>>(
    '/settings/platform-health/dashboard',
    { params: buildParams(filters) },
  )
  return normalizePlatformHealthDashboard(res.data.data)
}

export const fetchPlatformHealthMetrics = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthMetricsSection> => {
  const res = await settingsApiClient.get<ApiEnvelope<PlatformHealthMetricsSection>>(
    '/settings/platform-health/metrics',
    { params: buildParams(filters) },
  )
  return normalizePlatformHealthMetrics(res.data.data)
}

export const fetchPlatformHealthPlatformTrends = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthPlatformTrendsSection> => {
  const res = await settingsApiClient.get<
    ApiEnvelope<{
      healthTrend: PlatformHealthDashboard['charts']['healthTrend']
      apiTraffic: PlatformHealthDashboard['charts']['apiTraffic']
    }>
  >('/settings/platform-health/platform-trends', { params: buildParams(filters) })
  return normalizePlatformHealthPlatformTrends(res.data.data)
}

export const fetchPlatformHealthSystemPerformance = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthSystemPerformanceSection> => {
  const res = await settingsApiClient.get<
    ApiEnvelope<{ performance: PlatformHealthDashboard['charts']['performance'] }>
  >('/settings/platform-health/system-performance', { params: buildParams(filters) })
  return normalizePlatformHealthSystemPerformance(res.data.data)
}

export const fetchPlatformHealthSecurityCompliance = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthSecurityComplianceSection> => {
  const res = await settingsApiClient.get<
    ApiEnvelope<{
      securityCompliance: PlatformHealthDashboard['charts']['securityCompliance']
    }>
  >('/settings/platform-health/security-compliance', { params: buildParams(filters) })
  return normalizePlatformHealthSecurityCompliance(res.data.data)
}

export const fetchPlatformHealthInfrastructure = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthInfrastructureSection> => {
  const res = await settingsApiClient.get<ApiEnvelope<PlatformHealthInfrastructureSection>>(
    '/settings/platform-health/infrastructure',
    { params: buildParams(filters) },
  )
  return normalizePlatformHealthInfrastructure(res.data.data)
}

export const fetchPlatformHealthOperations = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthOperationsSection> => {
  const res = await settingsApiClient.get<ApiEnvelope<PlatformHealthOperationsSection>>(
    '/settings/platform-health/operations',
    { params: buildParams(filters) },
  )
  return normalizePlatformHealthOperations(res.data.data)
}
