export type SettingsModule =
  'platform' | 'security' | 'notifications' | 'finance' | 'backup' | 'expert' | 'venue' | 'service'

export type PlatformSettings = {
  applicationSettings: {
    applicationName: string
    logoUrl: string
    faviconUrl: string
  }
  displayPreferences: {
    timezone: string
    dateTimeFormat: string
    defaultCurrency: string
    language: string
  }
  generalSettings: {
    autoRefreshInterval: string
    defaultExportFormat: 'CSV' | 'PDF'
    maintenanceMode: boolean
    customErrorMessage: string
    adminNotes: string
    maintenanceStartAt: string | null
    maintenanceEndAt: string | null
    errorTemplates: string[]
    supportEmail: string
    supportPhone: string
  }
}

export type FinancialSettings = {
  platformCommissionPercent: number
  expertRevenueSharePercent: number
  convenienceFeePercent: number
  region: string
  taxRate: number | null
  currency: string
  taxType: string
}

export type SettingsLogAction = 'update' | 'reset'
export type SettingsLogStatus = 'success' | 'failed'

export type SettingsLog = {
  id: string
  action: SettingsLogAction
  module: SettingsModule
  status: SettingsLogStatus
  adminId: string | null
  performedBy: string
  ipAddress: string
  adminNote: string
  metadata: Record<string, unknown>
  createdAt: string
}

export type ExpertSettings = {
  accountCreation: {
    allowNewAccounts: boolean
    maxDevicesPerUser: number
    phoneVerification: 'mandatory' | 'optional' | 'disabled'
    reVerificationDays: number
    duplicateAccountDetection: boolean
    samePhoneNumber: boolean
    sameEmailId: boolean
    sameGovernmentId: boolean
    kycMandatory: boolean
  }
  autoSuspension: {
    enableAutoSuspension: boolean
    failedMfaAttempts: number
    failedLogins24h: number
    suspendOnNewDeviceLogin: boolean
    suspendOnUserReports: number
    suspensionDurationDays: number
    notifySuperAdmin: boolean
    notifyAffectedAdmin: boolean
  }
  accountDeletion: {
    allowPermanentDeletion: boolean
  }
  financial: FinancialSettings
}

export type VenueSettings = {
  venueControls: {
    venueDisableSuspend: boolean
  }
  bookingRules: {
    bookingWindowDays: number
    minBookingNoticeHours: number
    cancellationFeePercent: number
    conflictDetection: boolean
    blackoutDates: boolean
    maintenanceBlocks: boolean
  }
  pricingControls: {
    hourlyRates: boolean
    halfDayRates: boolean
    fullDayRates: boolean
    failedAttemptsAlert: boolean
    peakPricing: boolean
  }
  financial: FinancialSettings
}

export type ServiceSettings = {
  listingDetails: {
    allowNewServiceListings: boolean
    allowNewConsultationListings: boolean
  }
  pricingDetails: {
    minServiceListingPrice: number
    maxServiceListingPrice: number
    minConsultationListingPrice: number
    maxConsultationListingPrice: number
    maxListingDiscountPercent: number
    allowSinglePriceListing: boolean
    allowTierPriceListing: boolean
    allowCustomPriceListing: boolean
    displayAiPriceRecommendation: boolean
    allowUseOfEscrow: boolean
    payoutFrequency: {
      daily: boolean
      weekly: boolean
      fortnightly: boolean
      monthly: boolean
      custom: string
    }
    maxDisputePeriodDays: number
    maxConsultationFollowUpDays: number
  }
  proposalDetails: {
    createOneTimePaymentProposal: boolean
    createMilestoneBasedProposal: boolean
  }
  promotionalDetails: {
    promotionalBannersLimit: number
    secondaryBannerLimit: number
  }
}

export type SecurityQuestion = {
  id: string
  question: string
}

export type SecuritySettings = {
  sessionTimeout: {
    durationMinutes: number
  }
  passwordPolicy: {
    minimumLength: number
    passwordExpiryDays: number
    requireUppercase: boolean
    requireNumber: boolean
    requireLowercase: boolean
    requireSpecialChar: boolean
  }
  mfa: {
    requireForAllAdmins: boolean
    authenticatorApp: boolean
    smsOtp: boolean
    emailOtp: boolean
  }
  passwordReset: {
    emailOtp: boolean
    smsOtp: boolean
    securityQuestions: boolean
    maxResetAttempts: number
    blockReuseCount: number
    alertSuperAdminsOnSuspiciousResets: boolean
  }
  securityQuestionsConfig: {
    questions: SecurityQuestion[]
    requireForPasswordReset: boolean
    requireForCriticalOperations: boolean
    lockAccountAfterFailedAttempts: boolean
  }
  loginAlerts: boolean
}

export type NotificationSettings = {
  general: {
    inApp: boolean
    push: boolean
    email: boolean
    venue: boolean
    community: boolean
  }
  timeSensitive: {
    sms: boolean
    event: boolean
    networking: boolean
    membershipSubscription: boolean
    bulkEmail: boolean
    dataExport: boolean
  }
  critical: {
    accountSecurity: boolean
    paymentsTransaction: boolean
    reportsAbuseModeration: boolean
    userAccountSuspension: boolean
    rolePermissionModification: boolean
    paymentGatewayConfiguration: boolean
  }
  adminPanel: {
    coverageSupport: boolean
    permanentUserDeletion: boolean
    databaseOperations: boolean
    systemMaintenanceMode: boolean
    rolePermissionModification: boolean
  }
}

export type FinanceTransactionalSettings = {
  escrow: {
    enableEscrowSystem: boolean
  }
  expertsPayout: {
    daily: boolean
    weekly: boolean
    fortnightly: boolean
    monthly: boolean
    custom: string
  }
  paymentMethods: {
    creditCard: boolean
    debitCard: boolean
    paypal: boolean
    bankTransfer: boolean
    cryptocurrency: boolean
  }
  paymentGateways: {
    razorpay: boolean
    paymentRetryAttempts: number
    retryIntervalHours: number
  }
  membershipSuspension: {
    enableAutoSuspension: boolean
    suspendAfterNonPayment: boolean
    suspensionDuration: string
    notifyMemberOnSuspension: boolean
  }
}

export type BackupSettings = {
  automaticBackup: {
    enabled: boolean
    backupType: 'full' | 'partial'
    modules: {
      users: boolean
      events: boolean
      promo: boolean
      venue: boolean
      financialData: boolean
      settings: boolean
    }
    frequency: string
    backupTime: string
    retentionPeriod: string
    storageLocation: string
  }
}

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved'

export type IncidentRow = {
  id: string
  incidentId: string
  severity: IncidentSeverity
  module: string
  status: IncidentStatus
  assignee: string
  createdOn: string
}

export type BackupHistoryRow = {
  id: string
  name: string
  type: 'Automatic' | 'Manual'
  scope: 'Full System' | 'Partial'
  createdBy: string
  timestamp: string
  size: string
  status: 'Completed' | 'Pending' | 'Failed'
}

export type ModuleSettingsMap = {
  platform: PlatformSettings
  security: SecuritySettings
  notifications: NotificationSettings
  finance: FinanceTransactionalSettings
  backup: BackupSettings
  expert: ExpertSettings
  venue: VenueSettings
  service: ServiceSettings
}

export type SettingsResponse<T> = {
  module: SettingsModule
  config: T
  updatedAt: string | null
  updatedBy: string | null
}

export type LockedAccountRow = {
  id: string
  admin: string
  role: string
  reason: string
  lockedSince: string
  duration: string
  ipAddress?: string
  failedAttempts?: number
  username?: string
}

export type LoginTrailRow = {
  id: string
  date: string
  time: string
  ipAddress: string
  action: string
  status: 'success' | 'failed' | 'warning'
  location: string
  device: string
}

export type SettingsMetric = {
  title: string
  value: string
  trend?: { direction: 'up' | 'down'; percentage: number; label: string }
  hint?: string
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PolicyStatus = 'Active' | 'Draft' | 'Archived'

export type PolicyApplication = 'expert' | 'user' | 'venue' | 'service' | 'platform'

export type PolicyNotifyVia = {
  email: boolean
  inApp: boolean
  push: boolean
}

export type PolicyItem = {
  id: string
  slug?: string
  application?: PolicyApplication
  title: string
  status: PolicyStatus
  version: string
  effectiveDate: string
  lastUpdated: string
  content?: string
  author?: string
  changeSummary?: string
}

export type PolicyVersion = {
  id: string
  policyId: string
  version: string
  status: PolicyStatus
  effectiveDate: string
  effectiveAt?: string | null
  lastUpdated: string
  author: string
  changeSummary: string
  content: string
  requireReConsent?: boolean
  blockAppUsageUntilAccepted?: boolean
  notifyVia?: PolicyNotifyVia
}
