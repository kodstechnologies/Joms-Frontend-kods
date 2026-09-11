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

export const REFERRALS_MODULE_KEY = 'referrals'

export const REFERRALS_DASHBOARD_METRICS_CATALOG: ReferralDashboardMetricCatalogItem[] = [
  {
    id: 'total-referrals',
    label: 'Total Referrals Generated',
    type: 'Count',
    description: 'Total referral records created',
    defaultActive: true,
  },
  {
    id: 'user-to-user-referrals',
    label: 'User-to-User Referrals',
    type: 'Count',
    description: 'Referrals initiated by existing users',
    defaultActive: true,
  },
  {
    id: 'platform-referred-users',
    label: 'Platform Referred Users',
    type: 'Count',
    description: 'Users invited directly by the platform',
    defaultActive: true,
  },
  {
    id: 'platform-referred-experts',
    label: 'Platform Referred Experts',
    type: 'Count',
    description: 'Experts invited directly by the platform',
    defaultActive: true,
  },
  {
    id: 'successful-referrals',
    label: 'Successful Referrals',
    type: 'Count',
    description: 'Referrals resulting in completed signup',
    defaultActive: true,
  },
  {
    id: 'acceptance-rate',
    label: 'Referral Acceptance Rate',
    type: 'Percentage',
    description: 'Successful signups over invitations sent',
    defaultActive: true,
  },
  {
    id: 'platform-success-rate',
    label: 'Platform Referral Success Rate',
    type: 'Percentage',
    description: 'Successful platform referrals over platform issued',
    defaultActive: true,
  },
  {
    id: 'retention-rate',
    label: 'Referral Retention Rate',
    type: 'Percentage',
    description: 'Active referred users after retention period',
    defaultActive: true,
  },
  {
    id: 'expiry-rate',
    label: 'Referral Expiry Rate',
    type: 'Percentage',
    description: 'Referral codes expired without use',
    defaultActive: true,
  },
  {
    id: 'top-source',
    label: 'Top Referral Source',
    type: 'Text',
    description: 'Best-performing referral source',
    defaultActive: true,
  },
  {
    id: 'goals-completed',
    label: 'Total Referral Goals Completed',
    type: 'Count',
    description: 'Total referral milestones achieved',
    defaultActive: true,
  },
  {
    id: 'memberships-unlocked',
    label: 'Memberships Unlocked',
    type: 'Count',
    description: 'Memberships/rewards unlocked via referrals',
    defaultActive: false,
  },
  {
    id: 'avg-referrals',
    label: 'Average Referrals per Referrer',
    type: 'Average',
    description: 'Average successful referrals per referring user',
    defaultActive: true,
  },
  {
    id: 'avg-days-to-goal',
    label: 'Average Days to Reach Goal',
    type: 'Average',
    description: 'Average time to complete referral milestone',
    defaultActive: false,
  },
  {
    id: 'signups-via-code',
    label: 'Signups via Referral Code',
    type: 'Count',
    description: 'Successful signups using referral codes',
    defaultActive: true,
  },
  {
    id: 'pending-rewards',
    label: 'Pending Rewards',
    type: 'Count',
    description: 'Rewards earned but not yet distributed',
    defaultActive: false,
  },
  {
    id: 'rewards-distributed',
    label: 'Rewards Distributed',
    type: 'Count',
    description: 'Rewards successfully issued',
    defaultActive: false,
  },
  {
    id: 'reward-distribution-rate',
    label: 'Reward Distribution Rate',
    type: 'Percentage',
    description: 'Distributed rewards over total earned rewards',
    defaultActive: false,
  },
]

export const REFERRALS_TABLE_COLUMNS_CATALOG: ReferralTableColumnCatalogItem[] = [
  {
    id: 'referral-id',
    label: 'Referral ID',
    type: 'Text',
    description: 'Unique referral identifier',
    defaultVisible: true,
  },
  {
    id: 'referral-code',
    label: 'Referral Code',
    type: 'Text',
    description: 'Referral code used',
    defaultVisible: true,
  },
  {
    id: 'referrer-name',
    label: 'Referrer Name',
    type: 'Text',
    description: 'User/Expert who referred',
    defaultVisible: true,
  },
  {
    id: 'referrer-user-id',
    label: 'Referrer User ID',
    type: 'Text',
    description: "Referring user's unique ID",
    defaultVisible: false,
  },
  {
    id: 'referrer-type',
    label: 'Referrer Type',
    type: 'Status',
    description: 'User, Expert, or Platform',
    defaultVisible: false,
  },
  {
    id: 'referred-user-name',
    label: 'Referred User Name',
    type: 'Text',
    description: "Invited person's name",
    defaultVisible: true,
  },
  {
    id: 'referred-user-id',
    label: 'Referred User ID',
    type: 'Text',
    description: 'Linked user ID after signup',
    defaultVisible: false,
  },
  {
    id: 'referred-entity-type',
    label: 'Referred Entity Type',
    type: 'Status',
    description: 'User or Expert',
    defaultVisible: true,
  },
  {
    id: 'source-type',
    label: 'Source Type',
    type: 'Status',
    description: 'Referral source type',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Referral lifecycle status',
    defaultVisible: true,
  },
  {
    id: 'goal-progress',
    label: 'Goal Progress',
    type: 'Percentage',
    description: 'Referral milestone progress 0–100%',
    defaultVisible: true,
  },
  {
    id: 'reward-status',
    label: 'Reward Status',
    type: 'Status',
    description: 'Pending, Eligible, Issued, or Cancelled',
    defaultVisible: false,
  },
  {
    id: 'referred-at',
    label: 'Referred At',
    type: 'Date',
    description: 'Invitation timestamp',
    defaultVisible: true,
  },
  {
    id: 'signup-date',
    label: 'Signup Date',
    type: 'Date',
    description: 'When the referred partner account was created',
    defaultVisible: false,
  },
  {
    id: 'goal-completed-at',
    label: 'Goal Completed At',
    type: 'Date',
    description: 'Referral goal completion time',
    defaultVisible: false,
  },
  {
    id: 'referral-expiry-date',
    label: 'Referral Expiry Date',
    type: 'Date',
    description: 'Referral expiry timestamp',
    defaultVisible: false,
  },
  {
    id: 'last-activity',
    label: 'Last Activity',
    type: 'Date',
    description: 'Latest activity on referral',
    defaultVisible: false,
  },
]

export const DEFAULT_REFERRALS_VISIBLE_COLUMN_IDS = REFERRALS_TABLE_COLUMNS_CATALOG.filter(
  (c) => c.defaultVisible,
).map((c) => c.id)

export const DEFAULT_REFERRALS_ACTIVE_METRIC_IDS = REFERRALS_DASHBOARD_METRICS_CATALOG.filter(
  (m) => m.defaultActive,
).map((m) => m.id)

export const REFERRALS_MAX_ACTIVE_METRICS = REFERRALS_DASHBOARD_METRICS_CATALOG.length
