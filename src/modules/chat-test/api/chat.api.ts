import axios from 'axios'
import { env } from '@/config/env'

export type ChatThread = {
  threadId: string
  partnerId: string
  partnerName: string
  userId: string
  username: string
  lastMessageText: string
  lastMessageAt: string | null
  unreadCount: number
  canSend: boolean
  otherParticipant?: {
    id: string
    name?: string
    username?: string
    role: string
    isOnline?: boolean
    lastSeen?: string | null
  }
}

export type ChatMessage = {
  _id: string
  threadId: string
  clientMessageId?: string | null
  text: string
  messageType: string
  fileUrl?: string | null
  fileName?: string | null
  mimeType?: string | null
  deliveryStatus: string
  senderId: string
  senderType: string
  senderName: string
  createdAt: string
  localStatus?: 'sending' | 'failed'
}

export type VaultFile = {
  messageId: string
  threadId: string
  fileUrl: string
  fileName: string
  mimeType: string | null
  messageType: 'image' | 'file' | string
  senderId: string
  senderType: string
  senderName: string
  isMine: boolean
  createdAt: string
}

export type VaultScope = 'yours' | 'clients' | 'recent'

export function createChatApiClient(token: string, baseURL?: string) {
  return axios.create({
    baseURL: baseURL || env.chatApiBaseUrl,
    timeout: 60000,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listThreads(token: string, baseURL?: string) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.get('/chat/threads', { params: { limit: 50 } })
  return (res.data?.data?.threads || []) as ChatThread[]
}

export async function startThread(
  token: string,
  body: { partnerId: string; partnerName?: string } | { userId: string; username?: string },
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.post('/chat/threads', body)
  return res.data?.data as ChatThread
}

export async function listMessages(
  token: string,
  threadId: string,
  before?: string,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.get(`/chat/threads/${threadId}/messages`, {
    params: { limit: 30, ...(before ? { before } : {}) },
  })
  return res.data?.data as {
    messages: ChatMessage[]
    hasMore: boolean
    nextBefore: string | null
    meta: ChatThread
  }
}

export async function sendMessageRest(
  token: string,
  threadId: string,
  body: { clientMessageId: string; text: string },
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.post(`/chat/threads/${threadId}/messages`, body)
  return res.data?.data as ChatMessage
}

export async function uploadAttachment(
  token: string,
  threadId: string,
  file: File,
  clientMessageId: string,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('clientMessageId', clientMessageId)
  const res = await client.post(`/chat/threads/${threadId}/attachments`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data?.data as ChatMessage
}

export async function listVaultFiles(
  token: string,
  threadId: string,
  scope: VaultScope,
  params?: { search?: string; page?: number; limit?: number },
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.get(`/chat/threads/${threadId}/vault/${scope}`, {
    params: {
      search: params?.search || '',
      page: params?.page || 1,
      limit: params?.limit || 30,
    },
  })
  return res.data?.data as {
    threadId: string
    scope: string
    files: VaultFile[]
    page: number
    limit: number
    totalRecords: number
    totalPages: number
  }
}

export async function markRead(token: string, threadId: string, baseURL?: string) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.patch(`/chat/threads/${threadId}/read`)
  return res.data?.data as ChatThread
}

export function createClientMessageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `cm_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
