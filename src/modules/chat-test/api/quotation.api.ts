import axios from 'axios'
import { env } from '@/config/env'

export type QuotationItemType = 'service' | 'consultation'

export type QuotationRequest = {
  _id: string
  userId: string
  username: string
  phone_e164: string
  partnerId: string
  partnerName?: string
  itemType?: QuotationItemType
  itemId?: string
  title: string
  category: string
  description: string
  budget: { min: number; max: number }
  duration: string
  status: 'pending' | 'declined' | 'proposal_created' | 'closed' | string
  declinedAt?: string | null
  declineReason?: string
  threadId?: string | null
  createdAt?: string
}

export type PartnerOffering = {
  _id: string
  type: QuotationItemType
  title: string
  category: string
  description: string
  budget: { min: number; max: number }
  duration: string
  status: string
  pricingType?: string | null
  mode?: string | null
  topics?: string[]
  sessionOutline?: string
  whoItsFor?: string
  preSessionRequirement?: string | null
  postSessionMessage?: string | null
  languages?: string[]
  followUpDays?: number | null
  pricingOptions?: Array<{
    durationMinutes: number
    pricingType: 'free' | 'paid'
    price: number
  }>
}

export type PartnerOfferings = {
  partnerId: string
  services: PartnerOffering[]
  consultations: PartnerOffering[]
}

export type ProposalMilestone = {
  _id?: string
  title: string
  description?: string
  price: number
  timeline: { value: number; unit: 'days' | 'weeks' | 'months' }
  status?:
    | 'approval_pending'
    | 'payment_pending'
    | 'ongoing'
    | 'review_pending'
    | 'approved'
    | 'payment_completed'
    | string
  targetDate?: string | null
  completedAt?: string | null
  approvedAt?: string | null
}

export type Proposal = {
  _id: string
  quotationRequestId: string
  partnerId: string
  partnerName?: string
  userId: string
  username?: string
  title?: string
  category?: string
  deliverables: string
  benefits?: string[]
  exclusions?: string
  nextSteps?: string
  additionalNotes?: string
  paymentType: 'one_time' | 'milestone'
  totalPrice: number
  payableAmount?: number
  discountPercent?: number
  timeline?: { value: number; unit: 'days' | 'weeks' | 'months' } | null
  milestones?: ProposalMilestone[]
  validTill: string
  workStatus?: 'ongoing' | 'review_pending' | 'approved' | null
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'withdrawn' | string
  threadId?: string | null
  chatMessageId?: string | null
}

export type PaymentRequest = {
  _id: string
  proposalId: string
  quotationRequestId: string
  amount: number
  currency: string
  status: string
  title?: string
  milestoneIndex?: number | null
  milestoneId?: string | null
  paidAt?: string | null
}

export type ServiceProjectStatus = 'all' | 'newservice' | 'ongoing' | 'completed'

export type ScreenHint =
  | 'service_request'
  | 'quotation_detail'
  | 'proposal_draft'
  | 'proposal_sent'
  | 'payment'
  | 'service_work_one_time'
  | 'service_work_milestones'
  | 'completed'

export type ServiceProjectCard = {
  id: string
  engagementType: 'fixed_tiered' | 'custom_quotation'
  title: string
  category: string
  client: {
    userId: string
    username: string
    phone_e164: string
  }
  partnerId: string
  itemType: 'service' | 'consultation'
  itemId: string | null
  serviceId: string | null
  serviceImage: string | null
  paymentType: 'one_time' | 'milestone' | 'fixed' | 'tiered' | null
  projectStatus: Exclude<ServiceProjectStatus, 'all'>
  quotationStatus: string | null
  proposalStatus: string | null
  proposalId: string | null
  quotationRequestId: string | null
  serviceOrderId: string | null
  paymentRequestId: string | null
  paymentRequestStatus: string | null
  workStatus?: string | null
  lastActivityAt: string | null
  navigation: {
    screenHint: ScreenHint
    /** Set only when `screenHint === 'payment'`; otherwise null. Open partner chat with this thread. */
    threadId: string | null
  }
}

function client(token: string) {
  return axios.create({
    baseURL: env.serviceApiBaseUrl,
    timeout: 60000,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listPartnerOfferings(token: string, partnerId: string) {
  const res = await client(token).get(`/quotations/offerings/${partnerId}`)
  return res.data?.data as PartnerOfferings
}

export type CreateQuotationBody = {
  type: QuotationItemType
  serviceOrConsultationId: string
  partnerId?: string
  partnerName?: string
  /** Overrides shown on partner inbox/detail; preferred over listing hydration when set. */
  title?: string
  category?: string
  description?: string
  budget?: { min: number; max: number }
  duration?: string
  username?: string
  phone_e164?: string
}

export async function createQuotationRequest(token: string, body: CreateQuotationBody) {
  const res = await client(token).post('/quotations', body)
  return res.data?.data as QuotationRequest
}

export async function listMyQuotations(token: string) {
  const res = await client(token).get('/quotations/mine', { params: { limit: 50 } })
  return (res.data?.data || []) as QuotationRequest[]
}

export async function listPartnerQuotations(token: string) {
  const res = await client(token).get('/quotations', { params: { limit: 50 } })
  return (res.data?.data || []) as QuotationRequest[]
}

export async function listPartnerServiceProjects(
  token: string,
  status: ServiceProjectStatus = 'all',
) {
  const res = await client(token).get('/quotations/projects/services', {
    params: { status, page: 1, limit: 50 },
  })
  return (res.data?.data || []) as ServiceProjectCard[]
}

export async function getQuotationDetail(token: string, id: string) {
  const res = await client(token).get(`/quotations/${id}`)
  return res.data?.data as {
    quotation: QuotationRequest
    proposal: Proposal | null
    openPaymentRequest?: PaymentRequest | null
  }
}

export async function declineQuotation(token: string, id: string, reason?: string) {
  const res = await client(token).patch(`/quotations/${id}/decline`, { reason: reason || '' })
  return res.data?.data as QuotationRequest
}

export async function upsertProposal(
  token: string,
  body: {
    quotationRequestId: string
    deliverables: string
    paymentType: 'one_time' | 'milestone'
    totalPrice?: number
    timeline?: { value: number; unit: 'days' | 'weeks' | 'months' }
    milestones?: ProposalMilestone[]
    discountPercent?: number
    exclusions?: string
    nextSteps?: string
    additionalNotes?: string
    benefits?: string[]
    validTill: string
    title?: string
    category?: string
  },
) {
  const res = await client(token).post('/quotations/proposals', body)
  return res.data?.data as Proposal
}

export async function sendProposal(token: string, proposalId: string) {
  const res = await client(token).post(`/quotations/proposals/${proposalId}/send`)
  return res.data?.data as Proposal
}

export async function acceptProposal(token: string, proposalId: string) {
  const res = await client(token).post(`/quotations/proposals/${proposalId}/accept`)
  return res.data?.data as { proposal: Proposal; paymentRequest: PaymentRequest | null }
}

export async function rejectProposal(token: string, proposalId: string) {
  const res = await client(token).post(`/quotations/proposals/${proposalId}/reject`)
  return res.data?.data as Proposal
}

export async function withdrawProposal(token: string, proposalId: string) {
  const res = await client(token).post(`/quotations/proposals/${proposalId}/withdraw`)
  return res.data?.data as Proposal
}

export async function createPaymentRequest(
  token: string,
  proposalId: string,
  body?: { milestoneIndex?: number },
) {
  const res = await client(token).post(
    `/quotations/proposals/${proposalId}/payment-request`,
    body || {},
  )
  return res.data?.data as PaymentRequest
}

export async function payPaymentRequest(token: string, paymentRequestId: string) {
  const res = await client(token).post(`/quotations/payment-requests/${paymentRequestId}/pay`)
  return res.data?.data as { paymentRequest: PaymentRequest; proposal: Proposal }
}

export async function getProposalWork(token: string, proposalId: string) {
  const res = await client(token).get(`/quotations/proposals/${proposalId}/work`)
  return res.data?.data as {
    proposal: Proposal
    paymentRequests: PaymentRequest[]
    workFullyDone: boolean
  }
}

export async function markProposalCompleted(token: string, proposalId: string) {
  const res = await client(token).post(`/quotations/proposals/${proposalId}/mark-completed`)
  return res.data?.data as Proposal
}

export async function approveProposalWork(token: string, proposalId: string) {
  const res = await client(token).post(`/quotations/proposals/${proposalId}/approve`)
  return res.data?.data as Proposal
}

export async function markMilestoneCompleted(token: string, proposalId: string, index: number) {
  const res = await client(token).post(
    `/quotations/proposals/${proposalId}/milestones/${index}/mark-completed`,
  )
  return res.data?.data as Proposal
}

export async function approveMilestone(token: string, proposalId: string, index: number) {
  const res = await client(token).post(
    `/quotations/proposals/${proposalId}/milestones/${index}/approve`,
  )
  return res.data?.data as Proposal
}

export async function getProposal(token: string, proposalId: string) {
  const res = await client(token).get(`/quotations/proposals/${proposalId}`)
  return res.data?.data as Proposal
}
