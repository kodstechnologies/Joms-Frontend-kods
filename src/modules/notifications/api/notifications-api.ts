import { adminApiClient, notificationApiClient } from '@/shared/lib/axios'

export type InboxKind = 'notification' | 'alert'

export type InAppNotification = {
  id: string
  recipientId: string
  recipientType: 'partner' | 'admin'
  title: string
  body: string
  additionalNotes?: string
  type: string
  eventType?: string | null
  kind?: InboxKind
  channel: string
  source: string
  sourceId?: string | null
  messageId?: string | null
  audience?: string | null
  deepLink?: {
    screen: string | null
    params: Record<string, string>
  }
  metadata?: {
    category?: string
    requester?: string
    typeLabel?: string
    senderImageUrl?: string
    [key: string]: unknown
  }
  sender?: {
    imageUrl: string
    type: 'admin' | 'system' | 'partner'
    name?: string | null
  }
  senderImageUrl?: string
  senderType?: 'admin' | 'system' | 'partner'
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt?: string
}

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export const fetchMyInAppNotifications = async (params?: {
  page?: number
  limit?: number
  isRead?: boolean
  kind?: InboxKind
}) => {
  const response = await notificationApiClient.get<ApiEnvelope<InAppNotification[]>>(
    '/notifications/in-app/me',
    { params },
  )
  return response.data
}

export const fetchMyUnreadNotificationCount = async (kind?: InboxKind) => {
  const response = await notificationApiClient.get<ApiEnvelope<{ unreadCount: number }>>(
    '/notifications/in-app/me/unread-count',
    { params: kind ? { kind } : undefined },
  )
  return response.data
}

export const markInAppNotificationRead = async (id: string) => {
  const response = await notificationApiClient.patch<ApiEnvelope<InAppNotification>>(
    `/notifications/in-app/${id}/read`,
  )
  return response.data
}

export const markAllInAppNotificationsRead = async () => {
  const response = await notificationApiClient.patch<ApiEnvelope<{ modifiedCount: number }>>(
    '/notifications/in-app/me/read-all',
  )
  return response.data
}

export const registerDeviceToken = async (
  token: string,
  platform: 'web' | 'android' | 'ios' = 'web',
) => {
  const response = await notificationApiClient.post<ApiEnvelope<{ id: string; token: string }>>(
    '/notifications/device-tokens',
    {
      token,
      platform,
    },
  )
  return response.data
}

export const unregisterDeviceToken = async (token: string) => {
  const response = await notificationApiClient.delete<ApiEnvelope<{ removed: boolean }>>(
    '/notifications/device-tokens',
    {
      data: { token },
    },
  )
  return response.data
}

export const seedAdminInboxAlerts = async () => {
  const response = await adminApiClient.post<
    ApiEnvelope<{
      count: number
      ids: Record<string, string | null>
      results: Array<{ eventType: string; path: string; sent: boolean; skipped: boolean }>
    }>
  >('/admin/inbox/seed-alerts')
  return response.data
}
