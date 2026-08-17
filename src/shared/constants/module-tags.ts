export const MODULE_TAG_OPTIONS = [
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

export type ModuleTag = (typeof MODULE_TAG_OPTIONS)[number]
