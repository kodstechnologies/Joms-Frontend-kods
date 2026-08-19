import { adminApiClient, expertApiClient } from '@/shared/lib/axios'

import type {
  AdminChatMessage,
  AdminChatMessagesResponse,
  AdminChatThread,
  AdminChatVault,
  AdminOrderDetail,
  AdminOrderPayment,
  AdminProposal,
  AdminQuotation,
  AdminServiceDetail,
  ApiEnvelope,
  PaginationMeta,
  ServiceOrdersQuery,
  ServiceOrdersResponse,
  ServicePerformance,
  ServiceRevision,
  ServiceRevisionSnapshot,
  ServiceSupportTicket,
} from '../type/service-drilldown'

const servicesBase = '/services/internal/admin/services'
const drilldownBase = '/services/internal/admin'

export const fetchAdminServiceDetail = async (serviceId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminServiceDetail>>(
    `${servicesBase}/${serviceId}/detail`,
  )
  return response.data
}

export const fetchServiceRevisions = async (
  serviceId: string,
  params?: { page?: number; limit?: number },
) => {
  const response = await expertApiClient.get<
    ApiEnvelope<ServiceRevision[], { pagination: PaginationMeta }>
  >(`${servicesBase}/${serviceId}/revisions`, { params })
  return response.data
}

export const fetchServiceRevisionSnapshot = async (serviceId: string, revisionId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<ServiceRevisionSnapshot>>(
    `${servicesBase}/${serviceId}/revisions/${revisionId}`,
  )
  return response.data
}

export const fetchServicePerformance = async (serviceId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<ServicePerformance>>(
    `${servicesBase}/${serviceId}/performance`,
  )
  return response.data
}

export const fetchServiceOrders = async (serviceId: string, params: ServiceOrdersQuery) => {
  const response = await expertApiClient.get<ApiEnvelope<ServiceOrdersResponse>>(
    `${servicesBase}/${serviceId}/orders`,
    { params },
  )
  return response.data
}

export const fetchAdminOrderDetail = async (orderId: string, type?: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminOrderDetail>>(
    `${drilldownBase}/orders/${orderId}`,
    { params: { type } },
  )
  return response.data
}

export const fetchAdminOrderPayment = async (orderId: string, type?: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminOrderPayment>>(
    `${drilldownBase}/orders/${orderId}/payment`,
    { params: { type } },
  )
  return response.data
}

export const fetchAdminQuotation = async (quotationId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminQuotation>>(
    `${drilldownBase}/quotations/${quotationId}`,
  )
  return response.data
}

export const fetchAdminProposal = async (proposalId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminProposal>>(
    `${drilldownBase}/proposals/${proposalId}`,
  )
  return response.data
}

export type PauseServicePayload = {
  selectedReasons: string[]
  reasonDetails?: string
  adminNotes: string
}

export const pauseServiceListing = async (serviceId: string, payload: PauseServicePayload) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminServiceDetail>>(
    `${servicesBase}/${serviceId}/pause`,
    payload,
  )
  return response.data
}

export const unpauseServiceListing = async (serviceId: string) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminServiceDetail>>(
    `${servicesBase}/${serviceId}/unpause`,
  )
  return response.data
}

export type RequestServiceChangesPayload = {
  note: string
  selectedReasons?: string[]
}

export const requestServiceChanges = async (
  serviceId: string,
  payload: RequestServiceChangesPayload,
) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminServiceDetail>>(
    `${servicesBase}/${serviceId}/request-changes`,
    payload,
  )
  return response.data
}

export type FlagServicePayload = {
  reason: string
  adminNotes?: string
}

export const flagServiceForReview = async (serviceId: string, payload: FlagServicePayload) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminServiceDetail>>(
    `${servicesBase}/${serviceId}/flag`,
    payload,
  )
  return response.data
}

export const unflagService = async (serviceId: string) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminServiceDetail>>(
    `${servicesBase}/${serviceId}/unflag`,
  )
  return response.data
}

const chatBase = '/admin/internal/admin/chat'

export const fetchAdminChatThread = async (threadId: string) => {
  const response = await adminApiClient.get<ApiEnvelope<AdminChatThread>>(
    `${chatBase}/threads/${threadId}`,
  )
  return response.data
}

export const fetchAdminChatMessages = async (
  threadId: string,
  params?: { page?: number; limit?: number; flaggedOnly?: boolean },
) => {
  const response = await adminApiClient.get<ApiEnvelope<AdminChatMessagesResponse>>(
    `${chatBase}/threads/${threadId}/messages`,
    { params },
  )
  return response.data
}

export const fetchAdminChatVault = async (threadId: string, scope?: 'client' | 'expert') => {
  const response = await adminApiClient.get<ApiEnvelope<AdminChatVault>>(
    `${chatBase}/threads/${threadId}/vault`,
    { params: { scope } },
  )
  return response.data
}

export const flagAdminChatMessage = async (
  messageId: string,
  payload: { isFlagged: boolean; reason?: string },
) => {
  const response = await adminApiClient.post<ApiEnvelope<AdminChatMessage>>(
    `${chatBase}/messages/${messageId}/flag`,
    payload,
  )
  return response.data
}

export const flagAdminChatThread = async (
  threadId: string,
  payload: { isFlagged: boolean; reason?: string },
) => {
  const response = await adminApiClient.post<
    ApiEnvelope<{ _id: string; adminFlag: AdminChatThread['adminFlag'] }>
  >(`${chatBase}/threads/${threadId}/flag`, payload)
  return response.data
}

export const fetchServiceSupportTickets = async (
  serviceId: string,
  params?: { expertId?: string; limit?: number },
) => {
  const response = await adminApiClient.get<
    ApiEnvelope<
      ServiceSupportTicket[],
      { total: number; partnerId: string | null; serviceTitle: string | null }
    >
  >(`/admin/internal/admin/services/${serviceId}/tickets`, { params })
  return response.data
}
