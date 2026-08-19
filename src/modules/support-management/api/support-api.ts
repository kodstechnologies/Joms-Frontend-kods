import { adminApiClient } from '@/shared/lib/axios'
import type {
  ActivityItem,
  ChatMessage,
  QueueTicket,
  SupportTicket,
  TicketTab,
} from '../types/support'

export type SupportStatCard = {
  key: string
  title: string
  value: string | number
  changePercent?: number
  changeDirection?: 'up' | 'down'
}

export type SupportChartSeries = {
  key: string
  name: string
}

export type SupportDashboardChartsData = {
  ticketTrends: Array<{ day: string; total: number; resolved: number }>
  ticketsByUserType: Array<{ key: string; name: string; value: number; percent: number }>
  ticketsByModule: {
    series: SupportChartSeries[]
    data: Array<Record<string, string | number>>
  }
  ticketsByReason: Array<{ label: string; count: number }>
  escalations: {
    series: SupportChartSeries[]
    data: Array<Record<string, string | number>>
  }
}

export type SupportTicketsParams = {
  page?: number
  limit?: number
  search?: string
  tab?: TicketTab | 'my' | 'all' | 'escalated'
  status?: string
  priority?: string
  category?: string
  module?: string
  issueType?: string
  assignedToId?: string
  assignedTo?: string
  reporterId?: string
  reporter?: string
  ticketId?: string
  subject?: string
  from?: string
  to?: string
  includeClosed?: boolean
  activeOnly?: boolean
  scope?: 'workspace'
}

type ApiSuccess<T> = {
  success: boolean
  message?: string
  data: T
}

export const fetchSupportStats = async () => {
  const response = await adminApiClient.get<
    ApiSuccess<{
      cards: SupportStatCard[]
      ticketManagementCards: SupportStatCard[]
      summary: Record<string, number>
      charts: SupportDashboardChartsData
    }>
  >('/admin/support-dashboard/stats')
  return response.data
}

export const fetchSupportTickets = async (params?: SupportTicketsParams) => {
  const response = await adminApiClient.get<
    ApiSuccess<{
      tickets: SupportTicket[]
      queue: QueueTicket[]
      meta: { page: number; limit: number; total: number; totalPages: number }
      pagination: { page: number; limit: number; total: number; totalPages: number }
      stats: SupportStatCard[]
    }>
  >('/admin/support-dashboard/tickets', { params })
  return response.data
}

export const fetchSupportTicket = async (id: string) => {
  const response = await adminApiClient.get<
    ApiSuccess<{
      ticket: SupportTicket & {
        reporterId: string
        pastTicketsCount?: number
        assignedToId?: string | null
        eventContext?: { name?: string; date?: string } | null
        issueContext?: { name?: string; detail?: string } | null
      }
      messages: ChatMessage[]
      activities: ActivityItem[]
      queueItem: QueueTicket
    }>
  >(`/admin/support-dashboard/tickets/${encodeURIComponent(id)}`)
  return response.data
}

export const updateSupportTicket = async (
  id: string,
  payload: Partial<{
    status: string
    priority: string
    assignedToId: string
    assignedToName: string
    module: string
    issueType: string
    comments: string
    category: string
    tags: string[]
    escalationPathway: string
    resolution: string
    subject: string
  }>,
) => {
  const response = await adminApiClient.patch<ApiSuccess<SupportTicket>>(
    `/admin/support-dashboard/tickets/${encodeURIComponent(id)}`,
    payload,
  )
  return response.data
}

export const assignSupportTicket = async (
  id: string,
  payload: {
    assignedToId?: string
    assignedToName?: string
    assignedTo?: string
    assignedToAvatarUrl?: string
  },
) => {
  const response = await adminApiClient.patch<ApiSuccess<SupportTicket>>(
    `/admin/support-dashboard/tickets/${encodeURIComponent(id)}/assign`,
    payload,
  )
  return response.data
}

export const escalateSupportTicket = async (
  id: string,
  payload?: {
    note?: string
    escalationPathway?: string
    priority?: string
    assignedToId?: string
    assignedToName?: string
    assignedToAvatarUrl?: string
  },
) => {
  const response = await adminApiClient.post<ApiSuccess<SupportTicket>>(
    `/admin/support-dashboard/tickets/${encodeURIComponent(id)}/escalate`,
    payload || {},
  )
  return response.data
}

export const resolveSupportTicket = async (
  id: string,
  payload?: { resolution?: string; comments?: string },
) => {
  const response = await adminApiClient.post<ApiSuccess<SupportTicket>>(
    `/admin/support-dashboard/tickets/${encodeURIComponent(id)}/resolve`,
    payload || {},
  )
  return response.data
}

export const reopenSupportTicket = async (id: string) => {
  const response = await adminApiClient.post<ApiSuccess<SupportTicket>>(
    `/admin/support-dashboard/tickets/${encodeURIComponent(id)}/reopen`,
  )
  return response.data
}

export const sendSupportMessage = async (
  id: string,
  content: string,
  attachments: ChatMessage['attachments'] = [],
) => {
  const response = await adminApiClient.post<
    ApiSuccess<{ message: ChatMessage; duplicate?: boolean }>
  >(`/admin/support-dashboard/tickets/${encodeURIComponent(id)}/messages`, {
    content,
    role: 'agent',
    attachments,
  })
  return response.data
}

export const uploadSupportAttachment = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  form.append('image', file)
  const response = await adminApiClient.post<
    ApiSuccess<{ url: string; publicId?: string; name?: string; mimeType?: string }>
  >('/admin/support-dashboard/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return response.data.data
}

export const fetchPastTickets = async (userId: string, params?: SupportTicketsParams) => {
  const response = await adminApiClient.get<
    ApiSuccess<{
      tickets: SupportTicket[]
      meta: { page: number; limit: number; total: number; totalPages: number }
      reporterId: string
    }>
  >(`/admin/support-dashboard/reporters/${encodeURIComponent(userId)}/tickets`, {
    params,
  })
  return response.data
}

export const exportSupportTickets = async (params?: SupportTicketsParams) => {
  const response = await adminApiClient.get('/admin/support-dashboard/tickets/export', {
    params,
    responseType: 'blob',
  })
  return response.data as Blob
}

export const mergeSupportTickets = async (payload: { ticketIds: string[]; notes?: string }) => {
  const response = await adminApiClient.post<ApiSuccess<SupportTicket>>(
    '/admin/support-dashboard/tickets/merge',
    payload,
  )
  return response.data
}

export const deleteSupportTicket = async (id: string) => {
  const response = await adminApiClient.delete<ApiSuccess<{ deleted: boolean; id: string }>>(
    `/admin/support-dashboard/tickets/${encodeURIComponent(id)}`,
  )
  return response.data
}

export type SupportAgent = {
  id: string
  name: string
  email?: string
  role?: string
  avatarUrl?: string
  ticketCount?: number
}

export const fetchSupportAgents = async () => {
  const response = await adminApiClient.get<ApiSuccess<{ agents: SupportAgent[] }>>(
    '/admin/support-dashboard/agents',
  )
  return response.data
}
