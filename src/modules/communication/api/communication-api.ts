import { settingsApiClient } from '@/shared/lib/axios'

export type CommunicationChannel = 'in-app' | 'email' | 'push'
export type CommunicationType =
  | 'transactional'
  | 'marketing'
  | 'promotional'
  | 'reminder'
  | 'announcement'
  | 'system'
export type CommunicationAudience =
  | 'all-users'
  | 'experts'
  | 'venue-partners'
  | 'members'
  | 'admins'
  | 'custom-segment'
  | 'expert-management'
  | 'service-management'
  | 'venue-management'
  | 'all-partners'
export type CommunicationDeliveryType = 'send-now' | 'schedule'
export type CommunicationPriority = 'low' | 'medium' | 'high' | 'critical'
export type CommunicationStatus =
  | 'draft'
  | 'scheduled'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'paused'
  | 'active'

export type CommunicationAnalytics = {
  sent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  bounced: number
}

export type Communication = {
  id: string
  messageId: string
  campaignId: string
  title: string
  channel: CommunicationChannel
  channelLabel: string
  type: CommunicationType
  typeLabel: string
  audience: CommunicationAudience
  audienceLabel: string
  audienceSize: number
  contentPreview: string
  deliveryType: CommunicationDeliveryType
  priority: CommunicationPriority
  priorityLabel: string
  scheduledAt: string | null
  scheduledAtLabel: string
  sentAt: string | null
  sentAtLabel: string
  subject: string
  messageContent: string
  additionalNotes: string
  status: CommunicationStatus
  statusLabel: string
  failureReason: string
  createdBy: string
  createdById: string | null
  createdAt: string | null
  createdAtLabel: string
  updatedAt: string | null
  updatedAtLabel: string
  partnerIds?: string[]
  deliveredCount: number
  failedCount: number
  openRate: number
  clickRate: number
  analytics: CommunicationAnalytics
  deliveryMeta: {
    providerConnected: boolean
    note: string
  }
}

export type CommunicationMetricCard = {
  id: string
  title: string
  value: string
  trend?: { direction: 'up' | 'down'; percentage: number; label: string }
  hint?: string
}

export type CommunicationMetrics = {
  cards: CommunicationMetricCard[]
  totalMessagesSent: number
  activeCampaigns: number
  channelsUsed: number
  scheduledMessages: number
  failedUndelivered: number
  sent?: number
  delivered?: number
  failed?: number
  openRate?: number
  clickThroughRate?: number
  deliveryRate?: number
  bounceRate?: number
}

export type CommunicationOption = {
  value: string
  label: string
}

export type CommunicationOptions = {
  audiences: CommunicationOption[]
  channels: CommunicationOption[]
  types: CommunicationOption[]
  priorities: CommunicationOption[]
}

export type CreateCommunicationPayload = {
  title: string
  channel: CommunicationChannel
  type: CommunicationType
  audience: CommunicationAudience
  deliveryType: CommunicationDeliveryType
  priority?: CommunicationPriority
  scheduledAt?: string | null
  subject?: string
  messageContent: string
  additionalNotes?: string
  /** When set, delivery is limited to these partner IDs instead of the full audience. */
  partnerIds?: string[]
}

export type UpdateCommunicationPayload = Partial<CreateCommunicationPayload> & {
  status?: CommunicationStatus
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const COMMUNICATION_AUDIENCE_OPTIONS: CommunicationOption[] = [
  { value: 'experts', label: 'Experts' },
  { value: 'venue-partners', label: 'Venue Partners' },
  { value: 'members', label: 'Members' },
  { value: 'admins', label: 'Admins' },
  { value: 'custom-segment', label: 'Custom Segment' },
]

export const COMMUNICATION_CHANNEL_OPTIONS: CommunicationOption[] = [
  { value: 'in-app', label: 'In App Notification' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
]

export const COMMUNICATION_TYPE_OPTIONS: CommunicationOption[] = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'system', label: 'System Message' },
]

export const COMMUNICATION_PRIORITY_OPTIONS: CommunicationOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const fetchCommunicationMetrics = async () => {
  const response = await settingsApiClient.get<ApiEnvelope<CommunicationMetrics>>(
    '/settings/communications/metrics',
  )
  return response.data.data
}

export const fetchCommunicationOptions = async () => {
  const response = await settingsApiClient.get<ApiEnvelope<CommunicationOptions>>(
    '/settings/communications/options',
  )
  return response.data.data
}

export type CommunicationListParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  channel?: string
  audience?: string
  type?: string
  priority?: string
  messageId?: string
  title?: string
  createdBy?: string
  createdAtFrom?: string
  createdAtTo?: string
  createdAtMin?: string
  createdAtMax?: string
  deliveryType?: string
  scheduledAtFrom?: string
  scheduledAtTo?: string
  scheduledAtMin?: string
  scheduledAtMax?: string
  [key: string]: unknown
}

export const fetchCommunications = async (params?: CommunicationListParams) => {
  const response = await settingsApiClient.get<ApiEnvelope<Communication[]>>(
    '/settings/communications',
    { params },
  )
  return { data: response.data.data, meta: response.data.meta! }
}

export const fetchCommunicationById = async (id: string) => {
  const response = await settingsApiClient.get<ApiEnvelope<Communication>>(
    `/settings/communications/${id}`,
  )
  return response.data.data
}

export const createCommunication = async (payload: CreateCommunicationPayload) => {
  const response = await settingsApiClient.post<ApiEnvelope<Communication>>(
    '/settings/communications',
    payload,
  )
  return response.data.data
}

export const updateCommunication = async (id: string, payload: UpdateCommunicationPayload) => {
  const response = await settingsApiClient.patch<ApiEnvelope<Communication>>(
    `/settings/communications/${id}`,
    payload,
  )
  return response.data.data
}

export const deleteCommunication = async (id: string) => {
  const response = await settingsApiClient.delete<ApiEnvelope<{ id: string }>>(
    `/settings/communications/${id}`,
  )
  return response.data.data
}

export const duplicateCommunication = async (id: string) => {
  const response = await settingsApiClient.post<ApiEnvelope<Communication>>(
    `/settings/communications/${id}/duplicate`,
  )
  return response.data.data
}

export const cancelCommunication = async (id: string) => {
  const response = await settingsApiClient.patch<ApiEnvelope<Communication>>(
    `/settings/communications/${id}/cancel`,
  )
  return response.data.data
}

export const pauseCommunication = async (id: string) => {
  const response = await settingsApiClient.patch<ApiEnvelope<Communication>>(
    `/settings/communications/${id}/pause`,
  )
  return response.data.data
}

export const resumeCommunication = async (id: string) => {
  const response = await settingsApiClient.patch<ApiEnvelope<Communication>>(
    `/settings/communications/${id}/resume`,
  )
  return response.data.data
}
