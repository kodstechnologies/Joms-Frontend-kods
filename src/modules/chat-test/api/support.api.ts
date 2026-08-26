import axios from 'axios'

export type SupportAttachment = {
  url: string
  name?: string
  mimeType?: string
  publicId?: string
}

export type SupportChatMessage = {
  id: string
  sender: string
  role: 'user' | 'agent'
  content: string
  time: string
  online?: boolean
  attachments?: SupportAttachment[]
}

export type SupportTicket = {
  id: string
  subject?: string
  status?: string
  category?: string
  zohoTicketNumber?: string | null
  zohoTicketId?: string | null
  salesiqConversationId?: string | null
  assignedTo?: string | null
  assignedToId?: string | null
  assignedToAvatarUrl?: string | null
}

export type SupportChatState = {
  categories: string[]
  ticket: SupportTicket | null
  messages: SupportChatMessage[]
  chatActive: boolean
  created?: boolean
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
})

/** REST fallback — load partner support conversation (same payload as socket bootstrap). */
export async function fetchPartnerSupportChat(
  baseUrl: string,
  token: string,
  params?: { category?: string },
) {
  const res = await axios.get(`${baseUrl}/admin/support/partner/chat`, {
    headers: authHeaders(token),
    params,
    timeout: 30000,
    withCredentials: true,
  })
  return res.data?.data as SupportChatState
}

/** REST fallback — select service / send message when socket is unavailable. */
export async function sendPartnerSupportChat(
  baseUrl: string,
  token: string,
  payload: Record<string, unknown>,
) {
  const res = await axios.post(`${baseUrl}/admin/support/partner/chat`, payload, {
    headers: authHeaders(token),
    timeout: 30000,
    withCredentials: true,
  })
  return res.data?.data as SupportChatState
}

export async function uploadSupportAttachment(
  baseUrl: string,
  token: string,
  file: File,
): Promise<SupportAttachment> {
  const form = new FormData()
  form.append('file', file)
  form.append('image', file)
  const res = await axios.post(`${baseUrl}/admin/support/partner/chat/upload`, form, {
    headers: {
      ...authHeaders(token),
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
    withCredentials: true,
  })
  return res.data?.data as SupportAttachment
}
