import type {
  ExpertSettings,
  LockedAccountRow,
  PlatformSettings,
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

export const lockedAccountsMock: LockedAccountRow[] = [
  {
    id: '1',
    user: 'John Doe',
    email: 'john.doe@example.com',
    suspendedSince: 'Feb 6, 2026, 09:34 AM',
    autoLiftAt: 'Feb 11, 2026, 09:34 AM',
    status: 'Suspended',
  },
  {
    id: '2',
    user: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    suspendedSince: 'Feb 5, 2026, 02:10 PM',
    autoLiftAt: 'Feb 10, 2026, 02:10 PM',
    status: 'Suspended',
  },
]

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
