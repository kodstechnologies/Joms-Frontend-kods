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
  lastSenderId?: string | null
  lastSenderType?: string | null
  unreadCount: number
  canSend: boolean
  isPinned?: boolean
  isMuted?: boolean
  pinnedAt?: string | null
  pinnedMessage?: {
    messageId: string
    text: string
    messageType: string
    fileName?: string | null
    createdAt?: string | null
  } | null
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
  payload?: Record<string, unknown> | null
  refType?: string | null
  refId?: string | null
  deliveryStatus: string
  readAt?: string | null
  isDeleted?: boolean
  isEdited?: boolean
  editedAt?: string | null
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

export async function setThreadPinned(
  token: string,
  threadId: string,
  isPinned: boolean,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.patch(`/chat/threads/${threadId}/pin`, { isPinned })
  return res.data?.data as ChatThread
}

export async function setThreadMuted(
  token: string,
  threadId: string,
  isMuted: boolean,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.patch(`/chat/threads/${threadId}/mute`, { isMuted })
  return res.data?.data as ChatThread
}

export async function setPinnedMessage(
  token: string,
  threadId: string,
  messageId: string | null,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.patch(`/chat/threads/${threadId}/pinned-message`, { messageId })
  return res.data?.data as ChatThread
}

export async function editMessage(
  token: string,
  threadId: string,
  messageId: string,
  text: string,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.patch(`/chat/threads/${threadId}/messages/${messageId}`, { text })
  return res.data?.data as ChatMessage
}

export function createClientMessageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `cm_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export type ChatCallJoin = {
  serverURL: string
  room: string
  token: string | null
  subject?: string
  audioOnly?: boolean
  userInfo?: { displayName?: string; email?: string }
  ui?: Record<string, unknown>
  configOverrides?: Record<string, unknown>
  featureFlags?: Record<string, unknown>
}

export type ChatCall = {
  callId: string
  threadId: string
  roomName: string
  status: 'ringing' | 'in_progress' | 'ended' | 'missed' | 'cancelled' | string
  callType: 'audio' | string
  subject: string
  partnerId: string
  userId: string
  startedById: string
  startedByType: string
  startedByName?: string
  messageId?: string | null
  startedAt?: string
  answeredAt?: string | null
  endedAt?: string | null
  endedBy?: string | null
  endReason?: string | null
  join?: ChatCallJoin | null
  resumed?: boolean
  message?: ChatMessage | null
  alreadyEnded?: boolean
}

export async function startChatCall(
  token: string,
  threadId: string,
  clientMessageId: string,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.post(`/chat/threads/${threadId}/calls`, { clientMessageId })
  return res.data?.data as ChatCall
}

export async function getActiveChatCall(token: string, threadId: string, baseURL?: string) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.get(`/chat/threads/${threadId}/calls/active`)
  return res.data?.data as { active: boolean; call: ChatCall | null }
}

export async function joinChatCall(
  token: string,
  threadId: string,
  callId: string,
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.post(`/chat/threads/${threadId}/calls/${callId}/join`)
  return res.data?.data as ChatCall
}

export async function endChatCall(
  token: string,
  threadId: string,
  callId: string,
  reason = 'hangup',
  baseURL?: string,
) {
  const client = createChatApiClient(token, baseURL)
  const res = await client.post(`/chat/threads/${threadId}/calls/${callId}/end`, { reason })
  return res.data?.data as ChatCall
}

export function jitsiMeetUrlFromJoin(join: ChatCallJoin | null | undefined) {
  if (!join?.serverURL || !join?.room) return null
  const base = String(join.serverURL).replace(/\/$/, '')
  const room = encodeURIComponent(join.room)
  if (join.token) return `${base}/${room}?jwt=${encodeURIComponent(join.token)}`
  return `${base}/${room}`
}
