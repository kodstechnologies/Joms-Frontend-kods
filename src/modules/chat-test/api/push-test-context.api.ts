import axios from 'axios'

import { env } from '@/config/env'

import { listPartnerConsultationProjects } from './consultation-booking.api'
import {
  listPartnerOfferings,
  listPartnerQuotations,
  listPartnerServiceProjects,
} from './quotation.api'

export type PushIdSource = 'live' | 'dummy'

export type PushTestResolvedIds = {
  partnerId: string
  serviceId: string
  consultationId: string
  quotationRequestId: string
  consultQuotationId: string
  proposalMilestoneId: string
  proposalOneTimeId: string
  consultationBookingId: string
  venueId: string
  spaceId: string
  subscriptionId: string
  kycDocId: string
  venuePartnerId: string
  venueKycDocId: string
  subscriptionExpiresAt: string
}

export type PushTestContext = {
  ids: PushTestResolvedIds
  sources: Partial<Record<keyof PushTestResolvedIds, PushIdSource>>
  errors: string[]
}

export const DUMMY_PUSH_TEST_IDS: PushTestResolvedIds = {
  partnerId: '66e0bbbbbbbbbbbbbbbbbbbb',
  serviceId: '66e1cccccccccccccccccccc',
  consultationId: '66e2dddddddddddddddddddd',
  quotationRequestId: '66f1paymentpaymentpayment',
  proposalMilestoneId: '66f2eeeeeeeeeeeeeeeeeeee',
  proposalOneTimeId: '66f2onetimeeeeeeeeeeeeee',
  consultationBookingId: '67890abc1234567890abcdef',
  consultQuotationId: '66f1consultquote000000001',
  venueId: '66f0venueeeeeeeeeeeeeeee',
  spaceId: '66f0spaceeeeeeeeeeeeeeee',
  subscriptionId: '66f0subeeeeeeeeeeeeeeeee',
  kycDocId: '66f0kycdoc0000000000001',
  venuePartnerId: '66e0venuepartner000000001',
  venueKycDocId: '66f0venuekyc00000000001',
  subscriptionExpiresAt: '2026-08-16T18:29:59.999Z',
}

function bearer(token: string) {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

function pickId(value: unknown) {
  if (!value || typeof value !== 'object') return null
  const row = value as { _id?: string; id?: string }
  const id = String(row._id || row.id || '').trim()
  return id || null
}

function setLive(
  ids: PushTestResolvedIds,
  sources: Partial<Record<keyof PushTestResolvedIds, PushIdSource>>,
  key: keyof PushTestResolvedIds,
  value: string | null | undefined,
) {
  const next = String(value || '').trim()
  if (!next) return
  ids[key] = next
  sources[key] = 'live'
}

async function safeFetch<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch {
    return null
  }
}

export async function fetchPushTestContext(
  token: string,
  partnerId: string,
): Promise<PushTestContext> {
  const ids: PushTestResolvedIds = {
    ...DUMMY_PUSH_TEST_IDS,
    partnerId: partnerId.trim() || DUMMY_PUSH_TEST_IDS.partnerId,
  }
  const sources: Partial<Record<keyof PushTestResolvedIds, PushIdSource>> = {
    partnerId: 'live',
  }
  const errors: string[] = []

  const auth = { Authorization: bearer(token) }

  const [
    offerings,
    quotations,
    serviceProjects,
    consultationProjects,
    conciergeKyc,
    venueKyc,
    ownerVenues,
    subscription,
  ] = await Promise.all([
    safeFetch('offerings', () => listPartnerOfferings(token, partnerId)),
    safeFetch('quotations', () => listPartnerQuotations(token)),
    safeFetch('service projects', () => listPartnerServiceProjects(token, 'all')),
    safeFetch('consultation projects', () => listPartnerConsultationProjects(token, 'all')),
    safeFetch('concierge KYC', () =>
      axios
        .get(`${env.kycApiBaseUrl}/concierge-kyc/concierge/me`, { headers: auth, timeout: 30000 })
        .then((res) => res.data?.data),
    ),
    safeFetch('venue KYC', () =>
      axios
        .get(`${env.kycApiBaseUrl}/venue-kyc/me`, { headers: auth, timeout: 30000 })
        .then((res) => res.data?.data),
    ),
    safeFetch('venues', () =>
      axios
        .get(`${env.venueApiBaseUrl}/venues/owner`, { headers: auth, timeout: 30000 })
        .then((res) => res.data?.data as Array<{ _id?: string; spaces?: Array<{ _id?: string }> }>),
    ),
    safeFetch('membership', () =>
      axios
        .get(`${env.membershipApiBaseUrl}/subscriptions/me`, { headers: auth, timeout: 30000 })
        .then((res) => res.data?.data),
    ),
  ])

  if (!offerings) errors.push('Could not load partner offerings')
  if (!quotations) errors.push('Could not load partner quotations')
  if (!serviceProjects) errors.push('Could not load service projects')
  if (!consultationProjects) errors.push('Could not load consultation projects')

  const firstService = offerings?.services?.[0]
  const firstConsultation = offerings?.consultations?.[0]
  setLive(ids, sources, 'serviceId', pickId(firstService))
  setLive(ids, sources, 'consultationId', pickId(firstConsultation))

  const serviceQuotation =
    quotations?.find((q) => q.itemType === 'service' || !q.itemType) ?? quotations?.[0]
  const consultQuotation = quotations?.find((q) => q.itemType === 'consultation')

  setLive(ids, sources, 'quotationRequestId', pickId(serviceQuotation))
  if (serviceQuotation?.itemId) {
    setLive(ids, sources, 'serviceId', serviceQuotation.itemId)
  }

  setLive(ids, sources, 'consultQuotationId', pickId(consultQuotation))
  if (consultQuotation?.itemId) {
    setLive(ids, sources, 'consultationId', consultQuotation.itemId)
  }

  const milestoneProject = serviceProjects?.find(
    (p) => p.paymentType === 'milestone' && p.proposalId,
  )
  const oneTimeProject = serviceProjects?.find((p) => p.paymentType === 'one_time' && p.proposalId)
  const anyProposalProject = serviceProjects?.find((p) => p.proposalId)

  setLive(ids, sources, 'proposalMilestoneId', milestoneProject?.proposalId ?? null)
  if (milestoneProject?.quotationRequestId) {
    setLive(ids, sources, 'quotationRequestId', milestoneProject.quotationRequestId)
  }

  setLive(
    ids,
    sources,
    'proposalOneTimeId',
    oneTimeProject?.proposalId ?? anyProposalProject?.proposalId ?? null,
  )
  if (oneTimeProject?.quotationRequestId) {
    setLive(ids, sources, 'consultQuotationId', oneTimeProject.quotationRequestId)
  } else if (anyProposalProject?.quotationRequestId && !sources.consultQuotationId) {
    setLive(ids, sources, 'consultQuotationId', anyProposalProject.quotationRequestId)
  }

  const consultationProject = consultationProjects?.[0]
  setLive(ids, sources, 'consultationBookingId', consultationProject?.consultationBookingId)
  if (consultationProject?.consultationId) {
    setLive(ids, sources, 'consultationId', consultationProject.consultationId)
  }

  const conciergeKycId = pickId(conciergeKyc)
  if (conciergeKycId) {
    setLive(ids, sources, 'kycDocId', conciergeKycId)
  }

  const venueKycId = pickId(venueKyc)
  if (venueKycId) {
    setLive(ids, sources, 'venueKycDocId', venueKycId)
    setLive(ids, sources, 'venuePartnerId', partnerId)
  }

  const venue = ownerVenues?.[0]
  const space = venue?.spaces?.[0]
  setLive(ids, sources, 'venueId', pickId(venue))
  setLive(ids, sources, 'spaceId', pickId(space))

  const subscriptionId = pickId(subscription)
  if (subscriptionId) {
    setLive(ids, sources, 'subscriptionId', subscriptionId)
    const expiresAt = String((subscription as { expiresAt?: string })?.expiresAt || '').trim()
    if (expiresAt) {
      ids.subscriptionExpiresAt = expiresAt
      sources.subscriptionExpiresAt = 'live'
    }
  }

  return { ids, sources, errors }
}
