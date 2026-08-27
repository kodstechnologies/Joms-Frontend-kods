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

/** Fallback when API has not loaded. Dashboard never uses null — always 0 / "—". */
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
  membershipsUnlocked: 0,
  averageReferralsPerUser: 0,
  averageDaysToReachGoal: 0,
  signupsViaReferralCode: 0,
  pendingRewards: 0,
  rewardsDistributed: 0,
  rewardDistributionRate: 0,
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
  options?: { appendDays?: boolean },
): string {
  // null / undefined / empty → em dash (cannot compute or not tracked)
  if (value === undefined || value === null || value === '') {
    return '—'
  }
  if (format === 'string') {
    const text = String(value).trim()
    return text || '—'
  }
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  // Real zeros render as 0 / 0%
  if (format === 'integer') return value.toLocaleString('en-US')
  if (format === 'percentage') return `${value}%`
  const decimal = value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })
  if (options?.appendDays) return `${decimal} Days`
  return decimal
}

export function mergeReferralMetrics(partial?: Partial<ReferralMetrics> | null): ReferralMetrics {
  const merged = {
    ...REFERRAL_METRICS_SEED,
    ...(partial ?? {}),
  } as ReferralMetrics
  // Coerce any lingering nulls from older API payloads to seed defaults (0 / "—")
  for (const key of Object.keys(REFERRAL_METRICS_SEED) as Array<keyof ReferralMetricsValues>) {
    if (merged[key] === null || merged[key] === undefined) {
      ;(merged as ReferralMetricsValues)[key] = REFERRAL_METRICS_SEED[key] as never
    }
  }
  return merged
}
