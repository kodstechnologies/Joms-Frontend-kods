import { useQuery } from '@tanstack/react-query'
import { settingsApiClient } from '@/shared/lib/axios'
import type { ServiceSettings } from '../types/settings'
import { serviceDefaults } from '../config/settings.config'
import { firstDefinedBoolean, useAppRestrictions } from './use-app-restrictions'

export type ServicePublicSettings = ServiceSettings

export const fetchServicePublicSettings = async (): Promise<ServicePublicSettings> => {
  const response = await settingsApiClient.get<{
    success: boolean
    data: ServicePublicSettings
  }>('/settings/public/service-marketplace-rules')
  const data = response.data?.data
  return {
    listingDetails: {
      ...serviceDefaults.listingDetails,
      ...(data?.listingDetails || {}),
    },
    pricingDetails: {
      ...serviceDefaults.pricingDetails,
      ...(data?.pricingDetails || {}),
      payoutFrequency: {
        ...serviceDefaults.pricingDetails.payoutFrequency,
        ...(data?.pricingDetails?.payoutFrequency || {}),
      },
    },
    proposalDetails: {
      ...serviceDefaults.proposalDetails,
      ...(data?.proposalDetails || {}),
    },
    promotionalDetails: {
      ...serviceDefaults.promotionalDetails,
      ...(data?.promotionalDetails || {}),
    },
  }
}

export const useServicePublicSettings = () => {
  return useQuery({
    queryKey: ['service-public-settings'],
    queryFn: fetchServicePublicSettings,
    staleTime: 60_000,
    retry: 1,
  })
}

export const useServiceListingControls = () => {
  const query = useServicePublicSettings()
  const restrictions = useAppRestrictions()
  const isReady = restrictions.isSuccess || query.isSuccess
  const listing = query.data?.listingDetails ?? serviceDefaults.listingDetails
  const pricing = query.data?.pricingDetails ?? serviceDefaults.pricingDetails
  const proposals = query.data?.proposalDetails ?? serviceDefaults.proposalDetails
  const allowNewServiceListings =
    firstDefinedBoolean(
      restrictions.data?.service?.allowNewServiceListings,
      listing.allowNewServiceListings,
    ) ?? listing.allowNewServiceListings
  const allowNewConsultationListings =
    firstDefinedBoolean(
      restrictions.data?.service?.allowNewConsultationListings,
      listing.allowNewConsultationListings,
    ) ?? listing.allowNewConsultationListings

  const displayAiPriceRecommendation = query.data
    ? query.data.pricingDetails.displayAiPriceRecommendation === true
    : false

  return {
    ...query,
    isLoading: !isReady && (query.isLoading || restrictions.isLoading),
    isReady,
    listing,
    pricing,
    proposals,
    allowNewServiceListings: isReady ? allowNewServiceListings : false,
    allowNewConsultationListings: isReady ? allowNewConsultationListings : false,
    allowSinglePriceListing:
      firstDefinedBoolean(
        restrictions.data?.service?.allowSinglePriceListing,
        pricing.allowSinglePriceListing,
      ) ?? pricing.allowSinglePriceListing,
    allowTierPriceListing:
      firstDefinedBoolean(
        restrictions.data?.service?.allowTierPriceListing,
        pricing.allowTierPriceListing,
      ) ?? pricing.allowTierPriceListing,
    allowCustomPriceListing:
      firstDefinedBoolean(
        restrictions.data?.service?.allowCustomPriceListing,
        pricing.allowCustomPriceListing,
      ) ?? pricing.allowCustomPriceListing,
    displayAiPriceRecommendation,
    allowUseOfEscrow: pricing.allowUseOfEscrow,
    maxListingDiscountPercent: pricing.maxListingDiscountPercent,
    maxConsultationFollowUpDays: pricing.maxConsultationFollowUpDays,
    minServiceListingPrice: pricing.minServiceListingPrice,
    maxServiceListingPrice: pricing.maxServiceListingPrice,
    minConsultationListingPrice: pricing.minConsultationListingPrice,
    maxConsultationListingPrice: pricing.maxConsultationListingPrice,
    createOneTimePaymentProposal: proposals.createOneTimePaymentProposal,
    createMilestoneBasedProposal: proposals.createMilestoneBasedProposal,
  }
}
