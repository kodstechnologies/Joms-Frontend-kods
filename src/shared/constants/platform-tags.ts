export const PLATFORM_TAGS = [
  'VIP',
  'Fraud Risk',
  'Compliance',
  'High Value',
  'Priority',
  'Legal',
  'Finance Hold',
  'Escalated',
  'Verified',
  'KYC Pending',
] as const

export type PlatformTag = (typeof PLATFORM_TAGS)[number]
