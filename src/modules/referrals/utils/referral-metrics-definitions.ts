import type { ReferralMetrics } from '../types/referral'
import { REFERRALS_DASHBOARD_METRICS_CATALOG } from '../config/referral-management-table-columns.config'

export type ReferralMetricFormat = 'integer' | 'percentage' | 'decimal' | 'string'

export type ReferralMetricsValues = Omit<
  ReferralMetrics,
  'counts' | 'trends' | 'vsLastMonthPercent'
>

export type ReferralMetricDefinition = {
  id: string
  key: keyof ReferralMetricsValues
  label: string
  description: string
  format: ReferralMetricFormat
  registryType: 'Count' | 'Percentage' | 'Average' | 'Text'
}

/** Fallback when API has not loaded. null → UI shows — for untracked metrics. */
export const REFERRAL_METRICS_SEED: ReferralMetricsValues = {
  totalReferralsGenerated: 0,
  userToUserReferrals: 0,
  platformReferredUsers: 0,
  platformReferredExperts: 0,
  successfulReferrals: 0,
  referralAcceptanceRate: 0,
  platformReferralSuccessRate: 0,
  referralRetentionRate: 0,
  referralExpiryRate: 0,
  topReferralSource: '—',
  totalReferralGoalsCompleted: 0,
  membershipsUnlocked: null,
  averageReferralsPerUser: 0,
  averageDaysToReachGoal: null,
  signupsViaReferralCode: 0,
  pendingRewards: null,
  rewardsDistributed: null,
  rewardDistributionRate: null,
}

export const REFERRAL_METRIC_TREND_PERCENT = 0

export const REFERRAL_REWARD_UNLOCK_RULE = {
  goalEvents: ['signup', 'kyc', 'first_booking', 'membership_purchase'] as const,
  unlockAnyOf: ['first_booking', 'membership_purchase'] as const,
  retentionPeriodDays: 30,
}

const KEY_BY_ID: Record<string, keyof ReferralMetricsValues> = {
  'total-referrals': 'totalReferralsGenerated',
  'user-to-user-referrals': 'userToUserReferrals',
  'platform-referred-users': 'platformReferredUsers',
  'platform-referred-experts': 'platformReferredExperts',
  'successful-referrals': 'successfulReferrals',
  'acceptance-rate': 'referralAcceptanceRate',
  'platform-success-rate': 'platformReferralSuccessRate',
  'retention-rate': 'referralRetentionRate',
  'expiry-rate': 'referralExpiryRate',
  'top-source': 'topReferralSource',
  'goals-completed': 'totalReferralGoalsCompleted',
  'memberships-unlocked': 'membershipsUnlocked',
  'avg-referrals': 'averageReferralsPerUser',
  'avg-days-to-goal': 'averageDaysToReachGoal',
  'signups-via-code': 'signupsViaReferralCode',
  'pending-rewards': 'pendingRewards',
  'rewards-distributed': 'rewardsDistributed',
  'reward-distribution-rate': 'rewardDistributionRate',
}

const FORMAT_BY_TYPE: Record<string, ReferralMetricFormat> = {
  Count: 'integer',
  Percentage: 'percentage',
  Average: 'decimal',
  Text: 'string',
}

/** Built from catalog so Manage Metrics and dashboard cards stay aligned. */
export const REFERRAL_METRIC_DEFINITIONS: ReferralMetricDefinition[] =
  REFERRALS_DASHBOARD_METRICS_CATALOG.map((item) => ({
    id: item.id,
    key: KEY_BY_ID[item.id],
    label: item.label,
    description: item.description,
    format: FORMAT_BY_TYPE[item.type] || 'integer',
    registryType: item.type as ReferralMetricDefinition['registryType'],
  })).filter((item) => Boolean(item.key))

export function formatReferralMetricValue(
  format: ReferralMetricFormat,
  value: number | string | undefined | null,
): string {
  if (value === undefined || value === null || value === '') {
    return '—'
  }
  if (format === 'string') return String(value || '—')
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  if (format === 'integer') return value.toLocaleString('en-US')
  if (format === 'percentage') return `${value}%`
  return value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 0 })
}

export function mergeReferralMetrics(partial?: Partial<ReferralMetrics> | null): ReferralMetrics {
  return {
    ...REFERRAL_METRICS_SEED,
    ...(partial ?? {}),
  } as ReferralMetrics
}
