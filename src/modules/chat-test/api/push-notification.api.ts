import axios from 'axios'

import { env } from '@/config/env'
import type { PushNotifySource } from '../config/push-notification-fixtures'

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
}

export type PartnerNotifyResult = {
  sent?: boolean
  skipped?: boolean
  notificationId?: string | null
  notification?: {
    id: string
    eventType?: string
    deepLink?: { screen: string | null; params: Record<string, unknown> }
  }
  note?: string
}

export type PushDispatchResult = {
  providerConnected?: boolean
  audienceCount?: number
  sent?: number
  failed?: number
  skipped?: boolean
  note?: string
}

export type PartnerInAppRow = {
  id: string
  title: string
  body: string
  eventType?: string
  isRead: boolean
  deepLink?: { screen: string | null; params: Record<string, unknown> }
  createdAt: string
}

const internalHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Internal-Service-Key': env.internalServiceKey,
})

export const notifyPartnerTransactional = async (payload: {
  recipientId: string
  eventType: string
  title: string
  body: string
  source: PushNotifySource
  sourceId: string
  deepLink: { screen: string; params: Record<string, string> }
  skipIfExists?: boolean
}) => {
  const response = await axios.post<ApiEnvelope<PartnerNotifyResult>>(
    `${env.notificationApiBaseUrl}/notifications/internal/in-app/notify`,
    {
      recipientId: payload.recipientId,
      recipientType: 'partner',
      eventType: payload.eventType,
      title: payload.title,
      body: payload.body,
      type: 'transactional',
      source: payload.source,
      sourceId: payload.sourceId,
      deepLink: payload.deepLink,
      skipIfExists: payload.skipIfExists ?? false,
    },
    { headers: internalHeaders(), timeout: 30000 },
  )
  return response.data
}

/** Campaign-style push to one partner (mirrors Communication Management push). */
export const dispatchPartnerPush = async (payload: {
  recipientId: string
  title: string
  body: string
  type?: 'announcement' | 'marketing' | 'transactional'
  audience?: 'all-partners'
}) => {
  const sourceId = `dev-push-test:${payload.recipientId}:${Date.now()}`
  const response = await axios.post<ApiEnvelope<PushDispatchResult>>(
    `${env.notificationApiBaseUrl}/notifications/internal/push/dispatch`,
    {
      title: payload.title,
      body: payload.body,
      type: payload.type || 'announcement',
      audience: payload.audience || 'all-partners',
      recipientType: 'partner',
      recipientIds: [payload.recipientId],
      sourceId,
      skipIfAlreadyDispatched: false,
    },
    { headers: internalHeaders(), timeout: 30000 },
  )
  return response.data
}

export const fetchPartnerInAppNotifications = async (
  partnerToken: string,
  params?: { page?: number; limit?: number },
) => {
  const response = await axios.get<ApiEnvelope<PartnerInAppRow[]>>(
    `${env.notificationApiBaseUrl}/notifications/in-app/me`,
    {
      params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      headers: { Authorization: `Bearer ${partnerToken}` },
      timeout: 30000,
    },
  )
  return response.data
}

export const fetchPartnerDeviceTokens = async (partnerToken: string) => {
  const response = await axios.get<
    ApiEnvelope<Array<{ id: string; token: string; platform: string }>>
  >(`${env.notificationApiBaseUrl}/notifications/device-tokens/me`, {
    headers: { Authorization: `Bearer ${partnerToken}` },
    timeout: 30000,
  })
  return response.data
}
