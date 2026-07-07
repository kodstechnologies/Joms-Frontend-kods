export type SettingsModule = 'platform' | 'expert' | 'venue' | 'service'

export type PlatformSettings = {
  applicationSettings: {
    applicationName: string
  }
  displayPreferences: {
    timezone: string
    dateTimeFormat: string
    defaultCurrency: string
    language: string
  }
  generalSettings: {
    autoRefreshInterval: string
    defaultExportFormat: string
    maintenanceMode: boolean
    customErrorMessage: string
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

export type ModuleSettingsMap = {
  platform: PlatformSettings
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
  user: string
  email: string
  suspendedSince: string
  autoLiftAt: string
  status: string
}
