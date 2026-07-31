import type { ReferralMetrics } from '../types/referral'

/**
 * Referral dashboard UI metrics — exact card set from the Referral Management design.
 * Live values come from API; unavailable / user-side metrics stay 0.
 */

export type ReferralMetricFormat = 'integer' | 'percentage' | 'decimal' | 'string'

export type ReferralMetricsValues = Omit<ReferralMetrics, 'counts'>

export type ReferralMetricDefinition = {
  id: string
  key: keyof ReferralMetricsValues
  label: string
  description: string
  format: ReferralMetricFormat
  registryType: 'Count' | 'Percentage' | 'Average' | 'Text'
}

/** Fallback zeros when API has not loaded. */
export const REFERRAL_METRICS_SEED: ReferralMetricsValues = {
  totalReferralsGenerated: 0,
  userToUserShareRate: 0,
  adminSendSuccessRate: 0,
  referralAcceptanceRate: 0,
  onboardingRate: 0,
  conversionRate: 0,
  referralExpiryRate: 0,
  topSourcePerformance: '—',
  totalGoalsCompleted: 0,
  membershipsUnlocked: 0,
  averageReferralsPerUser: 0,
  averageDaysToReachGoal: 0,
}

/** MoM trend — not computed yet; UI always shows 0% vs last month. */
export const REFERRAL_METRIC_TREND_PERCENT = 0

export const REFERRAL_REWARD_UNLOCK_RULE = {
  goalEvents: ['signup', 'kyc', 'first_booking', 'membership_purchase'] as const,
  unlockAnyOf: ['first_booking', 'membership_purchase'] as const,
  retentionPeriodDays: 30,
}

/** Exactly 12 cards — same labels as the design (no extras). */
export const REFERRAL_METRIC_DEFINITIONS: ReferralMetricDefinition[] = [
  {
    id: 'total-referrals',
    key: 'totalReferralsGenerated',
    label: 'Total Referrals Generated',
    description: 'Total referral records created',
    format: 'integer',
    registryType: 'Count',
  },
  {
    id: 'user-share-rate',
    key: 'userToUserShareRate',
    label: 'User-to-User Share Rate',
    description: 'Share rate for user-to-user referrals',
    format: 'percentage',
    registryType: 'Percentage',
  },
  {
    id: 'admin-send-success',
    key: 'adminSendSuccessRate',
    label: 'Admin Send Success Rate',
    description: 'Successful admin invite deliveries',
    format: 'percentage',
    registryType: 'Percentage',
  },
  {
    id: 'acceptance-rate',
    key: 'referralAcceptanceRate',
    label: 'Referral Acceptance Rate',
    description: 'Referral invitation conversion',
    format: 'percentage',
    registryType: 'Percentage',
  },
  {
    id: 'onboarding-rate',
    key: 'onboardingRate',
    label: 'Onboarding Rate',
    description: 'Referred users who completed onboarding',
    format: 'percentage',
    registryType: 'Percentage',
  },
  {
    id: 'conversion-rate',
    key: 'conversionRate',
    label: 'Conversion Rate',
    description: 'Referral conversion rate',
    format: 'percentage',
    registryType: 'Percentage',
  },
  {
    id: 'expiry-rate',
    key: 'referralExpiryRate',
    label: 'Referral Expiry Rate',
    description: 'Referral codes expired without use',
    format: 'percentage',
    registryType: 'Percentage',
  },
  {
    id: 'top-source',
    key: 'topSourcePerformance',
    label: 'Top Source Performance',
    description: 'Best-performing referral source',
    format: 'string',
    registryType: 'Text',
  },
  {
    id: 'goals-completed',
    key: 'totalGoalsCompleted',
    label: 'Total Goals Completed (10/10)',
    description: 'Total referral milestones achieved',
    format: 'integer',
    registryType: 'Count',
  },
  {
    id: 'memberships-unlocked',
    key: 'membershipsUnlocked',
    label: 'Memberships unlocked',
    description: 'Memberships unlocked via referrals',
    format: 'integer',
    registryType: 'Count',
  },
  {
    id: 'avg-referrals',
    key: 'averageReferralsPerUser',
    label: 'Average referrals per user',
    description: 'Average successful referrals per referring user',
    format: 'decimal',
    registryType: 'Average',
  },
  {
    id: 'avg-days-to-goal',
    key: 'averageDaysToReachGoal',
    label: 'Average days to reach goal',
    description: 'Average time to complete referral milestone',
    format: 'decimal',
    registryType: 'Average',
  },
]

export function formatReferralMetricValue(
  format: ReferralMetricFormat,
  value: number | string | undefined | null,
): string {
  if (value === undefined || value === null) return format === 'string' ? '—' : '0'
  if (format === 'string') return String(value || '—')
  if (typeof value !== 'number' || Number.isNaN(value)) return '0'
  if (format === 'integer') return value.toLocaleString('en-US')
  if (format === 'percentage') return `${value}%`
  return value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 0 })
}

export function mergeReferralMetrics(
  partial?: Partial<ReferralMetricsValues> | null,
): ReferralMetricsValues {
  return { ...REFERRAL_METRICS_SEED, ...(partial ?? {}) }
}
