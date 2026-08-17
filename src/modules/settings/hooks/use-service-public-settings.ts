import { useQuery } from '@tanstack/react-query'
import { settingsApiClient } from '@/shared/lib/axios'
import type { ServiceSettings } from '../types/settings'
import { serviceDefaults } from '../mock/settings.defaults'

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
  const listing = query.data?.listingDetails ?? serviceDefaults.listingDetails
  const pricing = query.data?.pricingDetails ?? serviceDefaults.pricingDetails
  const proposals = query.data?.proposalDetails ?? serviceDefaults.proposalDetails

  // Strict: only show AI UI when settings explicitly enable it.
  const displayAiPriceRecommendation = query.data
    ? query.data.pricingDetails.displayAiPriceRecommendation === true
    : false

  return {
    ...query,
    listing,
    pricing,
    proposals,
    allowNewServiceListings: listing.allowNewServiceListings,
    allowNewConsultationListings: listing.allowNewConsultationListings,
    allowSinglePriceListing: pricing.allowSinglePriceListing,
    allowTierPriceListing: pricing.allowTierPriceListing,
    allowCustomPriceListing: pricing.allowCustomPriceListing,
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
