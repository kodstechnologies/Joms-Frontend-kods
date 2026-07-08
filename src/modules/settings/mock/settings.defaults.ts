import type {
  BackupSettings,
  ExpertSettings,
  FinanceTransactionalSettings,
  LockedAccountRow,
  LoginTrailRow,
  NotificationSettings,
  PlatformSettings,
  SecuritySettings,
  ServiceSettings,
  VenueSettings,
} from '../types/settings'

export const platformDefaults: PlatformSettings = {
  applicationSettings: {
    applicationName: 'Web admin Panel',
  },
  displayPreferences: {
    timezone: 'IST, +5:30, Kolkata, India',
    dateTimeFormat: 'DD/MM/YY',
    defaultCurrency: '$ USD',
    language: 'English',
  },
  generalSettings: {
    autoRefreshInterval: '30 Seconds',
    defaultExportFormat: 'CSV',
    maintenanceMode: false,
    customErrorMessage: "System maintenance in progress. We'll be back shortly.",
    supportEmail: 'support@joms.com',
    supportPhone: '+91 1234567890',
  },
}

export const expertDefaults: ExpertSettings = {
  accountCreation: {
    allowNewAccounts: true,
    maxDevicesPerUser: 5,
    phoneVerification: 'mandatory',
    reVerificationDays: 365,
    duplicateAccountDetection: true,
    samePhoneNumber: true,
    sameEmailId: true,
    sameGovernmentId: true,
    kycMandatory: true,
  },
  autoSuspension: {
    enableAutoSuspension: true,
    failedMfaAttempts: 5,
    failedLogins24h: 5,
    suspendOnNewDeviceLogin: true,
    suspendOnUserReports: 5,
    suspensionDurationDays: 5,
    notifySuperAdmin: true,
    notifyAffectedAdmin: false,
  },
  accountDeletion: {
    allowPermanentDeletion: false,
  },
  financial: {
    platformCommissionPercent: 15,
    expertRevenueSharePercent: 85,
    convenienceFeePercent: 2.5,
    region: 'India',
    taxRate: null,
    currency: 'INR',
    taxType: 'GST',
  },
}

export const venueDefaults: VenueSettings = {
  venueControls: {
    venueDisableSuspend: false,
  },
  bookingRules: {
    bookingWindowDays: 90,
    minBookingNoticeHours: 24,
    cancellationFeePercent: 10,
    conflictDetection: false,
    blackoutDates: false,
    maintenanceBlocks: false,
  },
  pricingControls: {
    hourlyRates: true,
    halfDayRates: true,
    fullDayRates: true,
    failedAttemptsAlert: true,
    peakPricing: true,
  },
  financial: {
    platformCommissionPercent: 15,
    expertRevenueSharePercent: 85,
    convenienceFeePercent: 2.5,
    region: 'India',
    taxRate: null,
    currency: 'INR',
    taxType: 'GST',
  },
}

export const serviceDefaults: ServiceSettings = {
  listingDetails: {
    allowNewServiceListings: true,
    allowNewConsultationListings: true,
  },
  pricingDetails: {
    minServiceListingPrice: 2000,
    maxServiceListingPrice: 1000000,
    minConsultationListingPrice: 2000,
    maxConsultationListingPrice: 100000,
    maxListingDiscountPercent: 30,
    allowSinglePriceListing: true,
    allowTierPriceListing: true,
    allowCustomPriceListing: true,
    displayAiPriceRecommendation: true,
    allowUseOfEscrow: true,
    payoutFrequency: {
      daily: true,
      weekly: false,
      fortnightly: false,
      monthly: false,
      custom: '',
    },
    maxDisputePeriodDays: 2,
    maxConsultationFollowUpDays: 10,
  },
  proposalDetails: {
    createOneTimePaymentProposal: true,
    createMilestoneBasedProposal: true,
  },
  promotionalDetails: {
    promotionalBannersLimit: 2,
    secondaryBannerLimit: 2,
  },
}

export const securityDefaults: SecuritySettings = {
  sessionTimeout: {
    durationMinutes: 30,
  },
  passwordPolicy: {
    minimumLength: 8,
    passwordExpiryDays: 90,
    requireUppercase: true,
    requireNumber: true,
    requireLowercase: true,
    requireSpecialChar: true,
  },
  mfa: {
    requireForAllAdmins: true,
    authenticatorApp: true,
    smsOtp: true,
    emailOtp: true,
  },
  passwordReset: {
    emailOtp: true,
    smsOtp: true,
    securityQuestions: true,
    maxResetAttempts: 3,
    blockReuseCount: 5,
    alertSuperAdminsOnSuspiciousResets: true,
  },
  securityQuestionsConfig: {
    questions: [
      { id: 'sq-1', question: 'What was the name of your first pet?' },
      { id: 'sq-2', question: 'In what city were you born?' },
      { id: 'sq-3', question: "What is your mother's maiden name?" },
    ],
    requireForPasswordReset: true,
    requireForCriticalOperations: true,
    lockAccountAfterFailedAttempts: true,
  },
  loginAlerts: true,
}

export const notificationsDefaults: NotificationSettings = {
  general: {
    inApp: true,
    push: true,
    email: true,
    venue: true,
    community: true,
  },
  timeSensitive: {
    sms: true,
    event: true,
    networking: true,
    membershipSubscription: true,
    bulkEmail: true,
    dataExport: true,
  },
  critical: {
    accountSecurity: true,
    paymentsTransaction: true,
    reportsAbuseModeration: true,
    userAccountSuspension: true,
    rolePermissionModification: true,
    paymentGatewayConfiguration: true,
  },
  adminPanel: {
    coverageSupport: true,
    permanentUserDeletion: true,
    databaseOperations: true,
    systemMaintenanceMode: true,
    rolePermissionModification: true,
  },
}

export const financeDefaults: FinanceTransactionalSettings = {
  escrow: {
    enableEscrowSystem: false,
  },
  expertsPayout: {
    daily: true,
    weekly: false,
    fortnightly: false,
    monthly: false,
    custom: '',
  },
  paymentMethods: {
    creditCard: true,
    debitCard: true,
    paypal: true,
    bankTransfer: true,
    cryptocurrency: true,
  },
  paymentGateways: {
    razorpay: true,
    paymentRetryAttempts: 3,
    retryIntervalHours: 24,
  },
  membershipSuspension: {
    enableAutoSuspension: true,
    suspendAfterNonPayment: true,
    suspensionDuration: 'Lift Suspension post payment',
    notifyMemberOnSuspension: true,
  },
}

export const backupDefaults: BackupSettings = {
  automaticBackup: {
    enabled: true,
    backupType: 'partial',
    modules: {
      users: true,
      events: true,
      promo: true,
      venue: true,
      financialData: true,
      settings: true,
    },
    frequency: 'Daily',
    backupTime: '02:30 PM',
    retentionPeriod: '30 Days',
    storageLocation: 'Cloud Storage',
  },
}

export const lockedAccountsMock: LockedAccountRow[] = [
  {
    id: '1',
    admin: 'Sarah Smith',
    role: 'Admin',
    reason: 'Too many failed login attempts',
    lockedSince: '2026-02-05 09:15:00',
    duration: '3 hours 45 mins',
    ipAddress: '10.0.0.24',
    failedAttempts: 7,
    username: 'sarah.smith',
  },
  {
    id: '2',
    admin: 'John Doe',
    role: 'Content Manager',
    reason: 'Suspicious activity detected',
    lockedSince: '2026-02-06 14:22:00',
    duration: '1 hour 12 mins',
    ipAddress: '192.168.0.55',
    failedAttempts: 5,
    username: 'john.doe',
  },
]

export const loginTrailsMock: LoginTrailRow[] = Array.from({ length: 20 }, (_, index) => {
  const statuses: LoginTrailRow['status'][] = ['success', 'failed', 'warning']
  const status = statuses[index % 3]
  return {
    id: `trail-${index + 1}`,
    date: '2026-02-07',
    time: `${String(9 + (index % 10)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`,
    ipAddress: `192.168.${index % 5}.${(index * 13) % 255}`,
    action: status === 'failed' ? 'Failed Login' : status === 'warning' ? 'MFA Challenge' : 'Login',
    status,
    location: index % 2 === 0 ? 'Mumbai, India' : 'Delhi, India',
    device: index % 3 === 0 ? 'Chrome / Windows' : index % 3 === 1 ? 'Safari / macOS' : 'Firefox / Linux',
  }
})

export const healthMetricsMock = [
  { title: 'System Uptime', value: '99.97%', change: '+6.7%', up: true },
  { title: 'Failed Transactions', value: '1,247', change: '-2.1%', up: false },
  { title: 'Compliance Flags', value: '38', change: '+1.2%', up: true },
  { title: 'Open Support Tickets', value: '214', change: '+4.5%', up: true },
  { title: 'Admin Actions (MTD)', value: '892', change: '+3.1%', up: true },
  { title: 'Critical Actions Logged', value: '12', change: '-0.8%', up: false },
  { title: 'Avg. Approval Time', value: '2.4h', change: '-5.2%', up: false },
  { title: 'API Response Time', value: '148ms', change: '+1.1%', up: true },
]
