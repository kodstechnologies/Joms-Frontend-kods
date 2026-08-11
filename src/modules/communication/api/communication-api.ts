import { settingsApiClient } from '@/shared/lib/axios'

export type CommunicationChannel = 'in-app' | 'email' | 'push'
export type CommunicationType = 'transactional' | 'marketing' | 'announcement'
export type CommunicationAudience =
  | 'expert-management'
  | 'service-management'
  | 'venue-management'
  | 'all-partners'
export type CommunicationDeliveryType = 'send-now' | 'schedule'
export type CommunicationStatus = 'draft' | 'scheduled' | 'sent' | 'failed' | 'active'

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
  title: string
  channel: CommunicationChannel
  channelLabel: string
  type: CommunicationType
  typeLabel: string
  audience: CommunicationAudience
  audienceLabel: string
  deliveryType: CommunicationDeliveryType
  scheduledAt: string | null
  subject: string
  messageContent: string
  additionalNotes: string
  status: CommunicationStatus
  statusLabel: string
  createdBy: string
  createdById: string | null
  createdAt: string | null
  createdAtLabel: string
  updatedAt: string | null
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
}

export type CommunicationOption = {
  value: string
  label: string
}

export type CommunicationOptions = {
  audiences: CommunicationOption[]
  channels: CommunicationOption[]
  types: CommunicationOption[]
}

export type CreateCommunicationPayload = {
  title: string
  channel: CommunicationChannel
  type: CommunicationType
  audience: CommunicationAudience
  deliveryType: CommunicationDeliveryType
  scheduledAt?: string | null
  subject?: string
  messageContent: string
  additionalNotes?: string
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
  { value: 'expert-management', label: 'Expert Management' },
  { value: 'service-management', label: 'Service Management' },
  { value: 'venue-management', label: 'Venue Management' },
  { value: 'all-partners', label: 'All Partners' },
]

export const COMMUNICATION_CHANNEL_OPTIONS: CommunicationOption[] = [
  { value: 'in-app', label: 'In App Notification' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
]

export const COMMUNICATION_TYPE_OPTIONS: CommunicationOption[] = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'announcement', label: 'Announcement' },
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

export const fetchCommunications = async (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  channel?: string
  audience?: string
}) => {
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
