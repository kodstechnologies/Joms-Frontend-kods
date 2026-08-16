import { useQuery } from '@tanstack/react-query'
import { settingsApiClient } from '@/shared/lib/axios'

export type VenueManagementControls = {
  allowAddVenues: boolean
  allowApproveVenues: boolean
  allowDisableVenues: boolean
}

export type VenueBookingRulesSettings = {
  bookingWindowDays: number
  minBookingNoticeHours: number
  cancellationFeeType: 'percentage' | 'no_fee' | 'custom'
  cancellationFeePercent: number
  cancellationFeeCustomAmount: number
  conflictDetection: boolean
  blackoutDates: boolean
}

export type VenuePricingControlsSettings = {
  hourlyRates: boolean
  fullDayRates: boolean
  weekendPricing: boolean
  peakPricing: boolean
}

export type VenueFinancialSettings = {
  platformCommissionPercent: number | null
  expertRevenueSharePercent: number | null
  convenienceFeePercent: number | null
  region: string
  taxRate: number | null
  currency: string
  taxType: string
}

export type VenuePublicSettings = {
  venueControls: VenueManagementControls
  bookingRules: VenueBookingRulesSettings
  pricingControls: VenuePricingControlsSettings
  financial: VenueFinancialSettings
}

const DEFAULT_VENUE_PUBLIC_SETTINGS: VenuePublicSettings = {
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
  },
}

export const fetchVenuePublicSettings = async (): Promise<VenuePublicSettings> => {
  const response = await settingsApiClient.get<{
    success: boolean
    data: VenuePublicSettings
  }>('/settings/public/venue-booking-rules')
  const data = response.data?.data
  return {
    venueControls: {
      ...DEFAULT_VENUE_PUBLIC_SETTINGS.venueControls,
      ...(data?.venueControls || {}),
    },
    bookingRules: {
      ...DEFAULT_VENUE_PUBLIC_SETTINGS.bookingRules,
      ...(data?.bookingRules || {}),
    },
    pricingControls: {
      ...DEFAULT_VENUE_PUBLIC_SETTINGS.pricingControls,
      ...(data?.pricingControls || {}),
    },
    financial: {
      ...DEFAULT_VENUE_PUBLIC_SETTINGS.financial,
      ...(data?.financial || {}),
    },
  }
}

export const useVenuePublicSettings = () => {
  return useQuery({
    queryKey: ['venue-public-settings'],
    queryFn: fetchVenuePublicSettings,
    staleTime: 60_000,
    retry: 1,
  })
}

export const useVenueManagementControls = () => {
  const query = useVenuePublicSettings()
  const controls = query.data?.venueControls ?? DEFAULT_VENUE_PUBLIC_SETTINGS.venueControls
  return {
    ...query,
    controls,
    allowAddVenues: controls.allowAddVenues,
    allowApproveVenues: controls.allowApproveVenues,
    allowDisableVenues: controls.allowDisableVenues,
  }
}

export const useVenueBookingRules = () => {
  const query = useVenuePublicSettings()
  const bookingRules = query.data?.bookingRules ?? DEFAULT_VENUE_PUBLIC_SETTINGS.bookingRules
  return { ...query, bookingRules }
}

export const useVenuePricingControls = () => {
  const query = useVenuePublicSettings()
  const pricingControls =
    query.data?.pricingControls ?? DEFAULT_VENUE_PUBLIC_SETTINGS.pricingControls
  return { ...query, pricingControls }
}

export const resolveRefundPercentageFromSettings = (
  bookingRules: VenueBookingRulesSettings,
): string => {
  if (bookingRules.cancellationFeeType === 'no_fee') return '100'
  if (bookingRules.cancellationFeeType === 'custom') return '0'
  const fee = Math.max(0, Math.min(100, Number(bookingRules.cancellationFeePercent) || 0))
  return String(Math.max(0, 100 - fee))
}
