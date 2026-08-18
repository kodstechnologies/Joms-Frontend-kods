import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchPartnerSupportChat,
  sendPartnerSupportChat,
  uploadSupportAttachment,
  type SupportChatMessage,
  type SupportChatState,
  type SupportTicket,
} from '../api/support.api'
import { DEFAULT_SUPPORT_CATEGORIES } from '../config/support-backend'
import { useSupportChatSocket } from '../hooks/use-support-chat-socket'

const WELCOME: SupportChatMessage = {
  id: 'welcome',
  sender: 'Support',
  role: 'agent',
  content: 'Welcome to support. What can we help you with?',
  time: '',
}

const isImageAttachment = (file?: { mimeType?: string; name?: string; type?: string }) => {
  const mime = String(file?.mimeType || file?.type || '').toLowerCase()
  if (mime.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(String(file?.name || ''))
}

const isTicketClosed = (ticket: SupportTicket | null) =>
  ['closed', 'resolved'].includes(String(ticket?.status || '').toLowerCase())

const isSameTicket = (a?: SupportTicket | null, b?: SupportTicket | null) => {
  if (!a || !b) return false
  return (
    Boolean(a.id && b.id && a.id === b.id) ||
    Boolean(a.zohoTicketNumber && b.zohoTicketNumber && a.zohoTicketNumber === b.zohoTicketNumber)
  )
}

const serviceSelectedMessage = (category: string, sender: string): SupportChatMessage => ({
  id: `selected-${category}`,
  sender: sender || 'You',
  role: 'user',
  content: `Partner selected ${category} from Support chat.`,
  time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
})

const withServiceMessage = (
  messages: SupportChatMessage[] | undefined,
  ticket: SupportTicket | null,
  sender: string,
) => {
  const list = (messages || []).filter(
    (item) => item.id !== 'welcome' && !/^selected service:/i.test(item.content || ''),
  )
  const category = String(ticket?.category || '').trim()
  if (!ticket || !category) return list.length ? list : messages || []
  const hasService = list.some((item) => /^partner selected /i.test(item.content || ''))
  if (hasService) return list
  return [serviceSelectedMessage(category, sender), ...list]
}

type PartnerSupportChatPanelProps = {
  accessToken: string
  adminBaseUrl: string
  reporterName: string
  reporterEmail?: string | null
  reporterPhone?: string | null
}

export function PartnerSupportChatPanel({
  accessToken,
  adminBaseUrl,
  reporterName,
  reporterEmail = '',
  reporterPhone = '',
}: PartnerSupportChatPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const ticketRef = useRef<SupportTicket | null>(null)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportChatMessage[]>([WELCOME])
  const [categories, setCategories] = useState<string[]>([...DEFAULT_SUPPORT_CATEGORIES])
  const [category, setCategory] = useState('')
  const [draft, setDraft] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)

  const applyState = useCallback(
    (payload?: SupportChatState | null) => {
      if (!payload) return
      if (Array.isArray(payload.categories) && payload.categories.length) {
        setCategories(payload.categories)
      }

      const nextTicket = payload.ticket ?? null
      const current = ticketRef.current
      const nextClosed = isTicketClosed(nextTicket)

      if (!nextTicket && current && !isTicketClosed(current)) {
        return
      }

      if (
        nextTicket &&
        nextClosed &&
        current &&
        !isTicketClosed(current) &&
        !isSameTicket(current, nextTicket)
      ) {
        return
      }

      const activeTicket = nextTicket && !nextClosed ? nextTicket : null
      ticketRef.current = activeTicket
      setTicket(activeTicket)

      if (activeTicket?.category) {
        setCategory(activeTicket.category)
      } else if (!activeTicket) {
        setCategory('')
      }

      if (!activeTicket) {
        setMessages([WELCOME])
        return
      }

      setMessages(withServiceMessage(payload.messages, activeTicket, reporterName))
    },
    [reporterName],
  )

  const handlers = useCallback(
    () => ({
      onChatState: applyState,
      onNewMessage: (payload: unknown) => {
        const data = payload as {
          message?: SupportChatMessage
          ticket?: SupportTicket
        }
        const incoming = data.ticket
        if (incoming && isTicketClosed(incoming)) {
          if (!isSameTicket(ticketRef.current, incoming)) return
          ticketRef.current = null
          setTicket(null)
          setCategory('')
          setMessages([WELCOME])
        } else if (incoming) {
          ticketRef.current = incoming
          setTicket(incoming)
        }
        void fetchPartnerSupportChat(adminBaseUrl, accessToken)
          .then(applyState)
          .catch(() => {})
      },
      onTicketUpdated: (payload: unknown) => {
        const data = payload as { ticket?: SupportTicket }
        if (!data.ticket) return
        if (isTicketClosed(data.ticket)) {
          if (!isSameTicket(ticketRef.current, data.ticket)) return
          ticketRef.current = null
          setTicket(null)
          setCategory('')
          setMessages([WELCOME])
        } else {
          ticketRef.current = data.ticket
          setTicket(data.ticket)
        }
        void fetchPartnerSupportChat(adminBaseUrl, accessToken)
          .then(applyState)
          .catch(() => {})
      },
      onReconnect: () => {
        void fetchPartnerSupportChat(adminBaseUrl, accessToken)
          .then(applyState)
          .catch(() => {})
      },
    }),
    [accessToken, adminBaseUrl, applyState],
  )

  const { connected, sendSupportMessage } = useSupportChatSocket(
    accessToken,
    handlers,
    adminBaseUrl,
  )

  useEffect(() => {
    if (!accessToken || !adminBaseUrl) return
    void fetchPartnerSupportChat(adminBaseUrl, accessToken)
      .then(applyState)
      .catch(() => {})
  }, [accessToken, adminBaseUrl, applyState])

  const closed = isTicketClosed(ticket)
  const chatActive = Boolean(ticket?.id) && !closed
  const showCategories = !chatActive
  const visibleMessages = closed ? [] : messages

  const statusLabel = useMemo(() => {
    if (closed) return 'Ticket closed'
    if (!ticket?.id) return 'Select a service'
    return connected ? 'Online' : 'Connecting…'
  }, [closed, connected, ticket?.id])

  const partnerFields = () => ({
    reporterName,
    reporterEmail: reporterEmail ?? '',
    reporterPhone: reporterPhone ?? '',
  })

  const dispatch = async (payload: Record<string, unknown>) => {
    const socketResult = await sendSupportMessage(payload)
    if (socketResult.success && socketResult.data) {
      applyState(socketResult.data)
      return socketResult
    }
    if (socketResult.message === 'Socket not connected' || socketResult.message === 'Timeout') {
      const rest = await sendPartnerSupportChat(adminBaseUrl, accessToken, payload)
      applyState(rest)
      return { success: true, data: rest }
    }
    return socketResult
  }

  const handlePickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setAttachmentFile(file)
    setImagePreview(isImageAttachment(file) ? URL.createObjectURL(file) : '')
  }

  const handleSend = async () => {
    const message = draft.trim()
    if (sending) return
    if (!message && !attachmentFile) return
    const activeCategory = category || ticket?.category || ''
    if (!chatActive && !activeCategory) {
      setError('Select a service first')
      return
    }

    setSending(true)
    setError('')
    try {
      let attachments: Array<{ url: string; name?: string; mimeType?: string }> = []
      if (attachmentFile) {
        const uploaded = await uploadSupportAttachment(adminBaseUrl, accessToken, attachmentFile)
        if (uploaded?.url) attachments = [uploaded]
      }

      const result = await dispatch({
        category: activeCategory,
        message,
        attachments,
        ...partnerFields(),
      })
      if (!result.success) {
        setError(result.message || 'Failed to send')
        return
      }
      setDraft('')
      setAttachmentFile(null)
      setImagePreview('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleSelectService = async (item: string) => {
    if (sending) return
    setCategory(item)
    setError('')
    setNotice('')
    setSending(true)
    try {
      const typed = draft.trim()
      const description = typed
        ? `Partner selected ${item} from Support chat.\n\n${typed}`
        : `Partner selected ${item} from Support chat.`

      const result = await dispatch({
        category: item,
        description,
        message: typed,
        selectService: true,
        ...partnerFields(),
      })

      if (!result.success) {
        setError(result.message || 'Failed to open support chat')
        return
      }

      const created = result.data?.ticket ?? null
      if (created && !isTicketClosed(created)) {
        ticketRef.current = created
        setTicket(created)
        setCategory(created.category || item)
        setMessages(withServiceMessage(result.data?.messages, created, reporterName))
      }

      const zohoNumber = created?.zohoTicketNumber
      if (zohoNumber) setNotice(`Zoho Desk ticket: ${zohoNumber}`)
      setDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open support chat')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
      <header className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="size-10 rounded-full bg-zinc-700" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-zinc-100">Support</h2>
          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <span
              className={`inline-block size-2 rounded-full ${connected && !closed ? 'bg-emerald-400' : 'bg-zinc-500'}`}
            />
            {statusLabel}
          </p>
          {ticket?.id ? (
            <p className="truncate text-xs text-amber-300">
              {ticket.zohoTicketNumber || ticket.id}
              {ticket.category ? ` · ${ticket.category}` : ''}
            </p>
          ) : null}
        </div>
      </header>

      <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
        <p className="text-center text-[10px] tracking-wide text-zinc-500 uppercase">
          End to end encrypted
        </p>
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              {msg.content && msg.content !== '[Image]' && msg.content !== '[Attachment]' ? (
                <p>{msg.content}</p>
              ) : null}
              {msg.attachments?.map((file) =>
                isImageAttachment(file) ? (
                  <a key={file.url} href={file.url} target="_blank" rel="noreferrer">
                    <img
                      src={file.url}
                      alt={file.name || 'Attachment'}
                      className="mt-2 max-h-40 rounded-lg"
                    />
                  </a>
                ) : (
                  <a
                    key={file.url}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-xs underline"
                  >
                    {file.name || 'Download file'}
                  </a>
                ),
              )}
              {msg.time ? <p className="mt-1 text-[10px] opacity-70">{msg.time}</p> : null}
            </div>
          </div>
        ))}

        {showCategories ? (
          <p className="text-center text-xs text-zinc-400">
            Select a service to start a new support ticket.
          </p>
        ) : null}

        {showCategories ? (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                disabled={sending}
                onClick={() => void handleSelectService(item)}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  item === category
                    ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                    : 'border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        {notice ? <p className="text-center text-xs text-emerald-400">{notice}</p> : null}
        {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}
      </div>

      {attachmentFile ? (
        <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-2 text-xs text-zinc-300">
          {imagePreview ? (
            <img src={imagePreview} alt="Selected" className="h-10 w-10 rounded object-cover" />
          ) : (
            <span>{attachmentFile.name}</span>
          )}
          <button
            type="button"
            className="ml-auto text-zinc-400 hover:text-zinc-200"
            onClick={() => {
              setAttachmentFile(null)
              setImagePreview('')
            }}
          >
            Remove
          </button>
        </div>
      ) : null}

      <form
        className="flex items-center gap-2 border-t border-zinc-800 px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSend()
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePickFile} />
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-zinc-800 text-lg text-zinc-300"
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
        >
          +
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={showCategories ? 'Type subject…' : 'Start typing…'}
          className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 outline-none"
        />
        <button
          type="submit"
          disabled={sending || (!draft.trim() && !attachmentFile)}
          className="flex size-9 items-center justify-center rounded-full bg-amber-400 text-zinc-950 disabled:opacity-40"
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
