import type {
  BackupSettings,
  ExpertSettings,
  FinanceTransactionalSettings,
  LockedAccountRow,
  NotificationSettings,
  PlatformSettings,
  SecuritySettings,
  ServiceSettings,
  VenueSettings,
} from '../types/settings'

export const platformDefaults: PlatformSettings = {
  applicationSettings: {
    applicationName: 'Web admin Panel',
    logoUrl: '',
    faviconUrl: '',
  },
  displayPreferences: {
    timezone: 'IST, +5:30, Kolkata, India',
    dateTimeFormat: 'DD/MM/YY',
    defaultCurrency: 'INR',
    language: 'English',
  },
  generalSettings: {
    autoRefreshInterval: '30 Seconds',
    defaultExportFormat: 'CSV',
    maintenanceMode: false,
    customErrorMessage: "System maintenance in progress. We'll be back shortly.",
    adminNotes: '',
    maintenanceStartAt: null,
    maintenanceEndAt: null,
    errorTemplates: [
      'We are currently experiencing technical difficulties. Please try again later.',
      "System maintenance in progress. We'll be back shortly.",
      'Service temporarily unavailable. Our team has been notified.',
    ],
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
    suspensionDurationDays: 7,
    notifySuperAdmin: true,
    notifyAffectedAdmin: false,
  },
  accountDeletion: {
    allowPermanentDeletion: false,
  },
  financial: {
    platformCommissionPercent: null,
    expertRevenueSharePercent: null,
    convenienceFeePercent: null,
    region: 'India',
    taxRate: null,
    currency: 'INR',
    taxType: 'GST',
    taxHandling: 'exclusive',
  },
}

export const venueDefaults: VenueSettings = {
  venueControls: {
    allowAddVenues: true,
    allowApproveVenues: true,
    allowDisableVenues: false,
  },
  bookingRules: {
    bookingWindowDays: 30,
    minBookingNoticeHours: 24,
    cancellationFeeType: 'percentage',
    cancellationFeePercent: 10,
    cancellationFeeCustomAmount: 0,
    conflictDetection: true,
    blackoutDates: true,
  },
  pricingControls: {
    hourlyRates: true,
    fullDayRates: true,
    weekendPricing: false,
    peakPricing: false,
  },
  financial: {
    platformCommissionPercent: null,
    expertRevenueSharePercent: null,
    convenienceFeePercent: null,
    region: 'India',
    taxRate: null,
    currency: 'INR',
    taxType: 'GST',
    taxHandling: 'exclusive',
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

export type HealthMetric = {
  title: string
  value: string
  trend?: { text: string; tone: 'positive' | 'negative' }
  hint?: string
  status?: string
}

export const healthMetricsMock: HealthMetric[] = [
  {
    title: 'System Uptime',
    value: '99.97%',
    trend: { text: '+6.7% vs last quarter', tone: 'positive' },
  },
  {
    title: 'Failed Transactions',
    value: '23',
    trend: { text: '-5.5% vs last quarter', tone: 'positive' },
  },
  {
    title: 'Compliance Flags',
    value: '05',
    trend: { text: '+8.2% vs last month', tone: 'positive' },
  },
  {
    title: 'Open Support Tickets',
    value: '47',
    trend: { text: '+12.5% vs last month', tone: 'positive' },
  },
  {
    title: 'Admin Actions (MTD)',
    value: '1,247',
    trend: { text: '+6.7% vs last quarter', tone: 'positive' },
  },
  {
    title: 'Critical Actions Logged',
    value: '23',
    trend: { text: '+8.2% vs last month', tone: 'positive' },
  },
  {
    title: 'Avg. Approval Time',
    value: '2.8 hrs',
    trend: { text: '+8.2% vs last month', tone: 'positive' },
  },
  { title: 'Impersonation Sessions', value: '47', hint: 'For user support' },
  {
    title: 'API Response Time',
    value: '127ms',
    trend: { text: '-18ms vs last quarter', tone: 'negative' },
  },
  {
    title: 'Error Rate',
    value: '0.12%',
    trend: { text: '-0.05% vs last quarter', tone: 'negative' },
  },
  {
    title: 'Database Query Time',
    value: '45ms',
    trend: { text: '-16ms vs last month', tone: 'negative' },
  },
  { title: 'Data Backup Success', value: '100%', status: 'All backups completed' },
  {
    title: 'Avg. Ticket Resolution Time',
    value: '4.2 hrs',
    trend: { text: '-1.2hrs vs last quarter', tone: 'negative' },
  },
  {
    title: 'First Response Time',
    value: '23 min',
    trend: { text: '-7 min vs last quarter', tone: 'negative' },
  },
  {
    title: 'Customer Satisfaction (CSAT)',
    value: '94%',
    trend: { text: '+3.2% vs last quarter', tone: 'positive' },
  },
]
