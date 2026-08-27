/**
 * Referral Management — dashboard metric + table column catalogs.
 * Keep ids kebab-case to match Manage Metrics / ui-preferences.
 */

export type ReferralTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export type ReferralDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): ReferralTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultActive = false,
): ReferralDashboardMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const REFERRALS_MODULE_KEY = 'referrals'
export const REFERRALS_MAX_ACTIVE_METRICS = 18

export const REFERRALS_DASHBOARD_METRICS_CATALOG: ReferralDashboardMetricCatalogItem[] = [
  metric(
    'total-referrals',
    'Total Referrals Generated',
    'Count',
    'Total referral records created',
    true,
  ),
  metric(
    'user-to-user-referrals',
    'User-to-User Referrals',
    'Count',
    'Referrals initiated by existing users',
    true,
  ),
  metric(
    'platform-referred-users',
    'Platform Referred Users',
    'Count',
    'Users invited directly by the platform',
    true,
  ),
  metric(
    'platform-referred-experts',
    'Platform Referred Experts',
    'Count',
    'Experts invited directly by the platform',
    true,
  ),
  metric(
    'successful-referrals',
    'Successful Referrals',
    'Count',
    'Referrals resulting in completed signup',
    true,
  ),
  metric(
    'acceptance-rate',
    'Referral Acceptance Rate',
    'Percentage',
    'Successful signups over invitations sent',
    true,
  ),
  metric(
    'platform-success-rate',
    'Platform Referral Success Rate',
    'Percentage',
    'Successful platform referrals over platform issued',
    true,
  ),
  metric(
    'retention-rate',
    'Referral Retention Rate',
    'Percentage',
    'Active referred users after retention period',
    true,
  ),
  metric(
    'expiry-rate',
    'Referral Expiry Rate',
    'Percentage',
    'Referral codes expired without use',
    true,
  ),
  metric('top-source', 'Top Referral Source', 'Text', 'Best-performing referral source', true),
  metric(
    'goals-completed',
    'Total Referral Goals Completed',
    'Count',
    'Total referral milestones achieved',
    true,
  ),
  metric(
    'memberships-unlocked',
    'Memberships Unlocked',
    'Count',
    'Memberships/rewards unlocked via referrals',
  ),
  metric(
    'avg-referrals',
    'Average Referrals per Referrer',
    'Average',
    'Average successful referrals per referring user',
    true,
  ),
  metric(
    'avg-days-to-goal',
    'Average Days to Reach Goal',
    'Average',
    'Average time to complete referral milestone',
  ),
  metric(
    'signups-via-code',
    'Signups via Referral Code',
    'Count',
    'Successful signups using referral codes',
    true,
  ),
  metric('pending-rewards', 'Pending Rewards', 'Count', 'Rewards earned but not yet distributed'),
  metric('rewards-distributed', 'Rewards Distributed', 'Count', 'Rewards successfully issued'),
  metric(
    'reward-distribution-rate',
    'Reward Distribution Rate',
    'Percentage',
    'Distributed rewards over total earned rewards',
  ),
]

export const REFERRALS_TABLE_COLUMNS_CATALOG: ReferralTableColumnCatalogItem[] = [
  col('referral-id', 'Referral ID', 'Text', 'Unique referral identifier', true),
  col('referral-code', 'Referral Code', 'Text', 'Referral code used', true),
  col('referrer-name', 'Referrer Name', 'Text', 'User/Expert who referred', true),
  col('referrer-user-id', 'Referrer User ID', 'Text', "Referring user's unique ID"),
  col('referrer-type', 'Referrer Type', 'Status', 'User, Expert, or Platform'),
  col('referred-user-name', 'Referred User Name', 'Text', "Invited person's name", true),
  col('referred-user-id', 'Referred User ID', 'Text', 'Linked user ID after signup'),
  col('referred-entity-type', 'Referred Entity Type', 'Status', 'User or Expert', true),
  col('source-type', 'Source Type', 'Status', 'Referral source type', true),
  col('status', 'Status', 'Status', 'Referral lifecycle status', true),
  col('goal-progress', 'Goal Progress', 'Percentage', 'Referral milestone progress 0–100%', true),
  col('reward-status', 'Reward Status', 'Status', 'Pending, Eligible, Issued, or Cancelled'),
  col('referred-at', 'Referred At', 'Date', 'Invitation timestamp', true),
  col('signup-date', 'Signup Date', 'Date', 'When the referred partner account was created'),
  col('goal-completed-at', 'Goal Completed At', 'Date', 'Referral goal completion time'),
  col('referral-expiry-date', 'Referral Expiry Date', 'Date', 'Referral expiry timestamp'),
  col('last-activity', 'Last Activity', 'Date', 'Latest activity on referral'),
]

export const DEFAULT_REFERRALS_VISIBLE_COLUMN_IDS = REFERRALS_TABLE_COLUMNS_CATALOG.filter(
  (c) => c.defaultVisible,
).map((c) => c.id)

export const DEFAULT_REFERRALS_ACTIVE_METRIC_IDS = REFERRALS_DASHBOARD_METRICS_CATALOG.filter(
  (m) => m.defaultActive,
).map((m) => m.id)
