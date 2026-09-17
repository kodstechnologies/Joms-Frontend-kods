import { useQuery } from '@tanstack/react-query'

import { settingsApiClient } from '@/shared/lib/axios'

export const APP_RESTRICTIONS_QUERY_KEY = ['app-restrictions'] as const

export const RESTRICTION_MESSAGES = {
  expertCreate: 'Creating experts is turned off in Expert Application settings',
  venueCreate: 'Creating venues is turned off in Venue Management settings',
  serviceCreate: 'Creating new service listings is disabled by admin settings',
  consultationCreate: 'Creating new consultation listings is disabled by admin settings',
  listingsCreate: 'Creating new listings is disabled by admin settings',
} as const

export type AppExpertRestrictions = {
  allowNewAccounts: boolean
  kycMandatory: boolean
  phoneVerification: 'mandatory' | 'optional'
  maxDevicesPerUser: number
  allowPermanentDeletion: boolean
}

export type AppServiceRestrictions = {
  allowNewServiceListings: boolean
  allowNewConsultationListings: boolean
  allowSinglePriceListing: boolean
  allowTierPriceListing: boolean
  allowCustomPriceListing: boolean
  minServiceListingPrice: number
  maxServiceListingPrice: number
  minConsultationListingPrice: number
  maxConsultationListingPrice: number
  maxListingDiscountPercent: number
  displayAiPriceRecommendation: boolean
  allowUseOfEscrow: boolean
  createOneTimePaymentProposal: boolean
  createMilestoneBasedProposal: boolean
}

export type AppVenueRestrictions = {
  allowAddVenues: boolean
  allowApproveVenues: boolean
  allowDisableVenues: boolean
  hourlyRates: boolean
  fullDayRates: boolean
  weekendPricing: boolean
  peakPricing: boolean
  bookingWindowDays: number
  minBookingNoticeHours: number
  cancellationFeeType: string
  cancellationFeePercent: number
  cancellationFeeCustomAmount: number
  conflictDetection: boolean
  blackoutDates: boolean
}

export type AppRestrictions = {
  expert?: AppExpertRestrictions
  service?: AppServiceRestrictions
  venue?: AppVenueRestrictions
}

export const fetchAppRestrictions = async (): Promise<AppRestrictions> => {
  const response = await settingsApiClient.get<{
    success: boolean
    data: AppRestrictions
  }>('/settings/public/app-restrictions')
  return response.data?.data || {}
}

export const useAppRestrictions = () => {
  return useQuery({
    queryKey: APP_RESTRICTIONS_QUERY_KEY,
    queryFn: fetchAppRestrictions,
    staleTime: 30_000,
    retry: 1,
  })
}

export const firstDefinedBoolean = (...values: Array<boolean | undefined>) =>
  values.find((value) => typeof value === 'boolean')
