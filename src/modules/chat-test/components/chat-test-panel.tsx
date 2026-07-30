import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createClientMessageId,
  listMessages,
  listThreads,
  markRead,
  sendMessageRest,
  startThread,
  uploadAttachment,
  type ChatMessage,
  type ChatThread,
} from '../api/chat.api'
import { useChatSocket } from '../hooks/use-chat-socket'
import { FileVaultModal } from './file-vault-modal'

export type ChatRole = 'partner' | 'user'

export type ChatIdentity = {
  id: string
  label: string
  accessToken: string
}

type Props = {
  role: ChatRole
  title: string
  accent: 'amber' | 'sky'
  identity: ChatIdentity
  chatBaseUrl: string
  counterpartOptions?: ChatIdentity[]
  counterpartIdLabel: string
  counterpartNameLabel: string
  onLogout?: () => void
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

export function ChatTestPanel({
  role,
  title,
  accent,
  identity,
  chatBaseUrl,
  counterpartOptions = [],
  counterpartIdLabel,
  counterpartNameLabel,
  onLogout,
}: Props) {
  const [counterpartId, setCounterpartId] = useState(counterpartOptions[0]?.id || '')
  const [counterpartName, setCounterpartName] = useState(counterpartOptions[0]?.label || '')
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [presence, setPresence] = useState<
    Record<string, { isOnline: boolean; lastSeen: string | null }>
  >({})
  const selectedRef = useRef(selectedThreadId)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    selectedRef.current = selectedThreadId
  }, [selectedThreadId])

  const sessionKey = `${identity.id}::${chatBaseUrl}`
  const [activeSessionKey, setActiveSessionKey] = useState(sessionKey)
  if (activeSessionKey !== sessionKey) {
    setActiveSessionKey(sessionKey)
    setSelectedThreadId(null)
    setMessages([])
    setThreads([])
    setPresence({})
    setError(null)
  }

  const applyPresenceToThreads = useCallback(
    (userId: string, isOnline: boolean, lastSeen: string | null) => {
      setThreads((prev) =>
        prev.map((t) => {
          const oid = t.otherParticipant?.id
          if (!oid || String(oid) !== String(userId)) return t
          return {
            ...t,
            otherParticipant: {
              ...t.otherParticipant!,
              isOnline,
              lastSeen,
            },
          }
        }),
      )
    },
    [],
  )

  const token = identity.accessToken
  const accentBtn =
    accent === 'amber'
      ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
      : 'bg-sky-400 text-zinc-950 hover:bg-sky-300'
  const accentMine = accent === 'amber' ? 'bg-amber-500/80' : 'bg-sky-500/80'

  const refreshThreads = useCallback(async () => {
    if (!token) return
    const list = await listThreads(token, chatBaseUrl)
    setThreads(list)
  }, [token, chatBaseUrl])

  const openThread = useCallback(
    async (threadId: string) => {
      if (!token) return
      setSelectedThreadId(threadId)
      setLoading(true)
      setError(null)
      try {
        const data = await listMessages(token, threadId, undefined, chatBaseUrl)
        setMessages(data.messages || [])
        const other = data.meta?.otherParticipant
        if (other?.id) {
          setPresence((prev) => ({
            ...prev,
            [String(other.id)]: {
              isOnline: Boolean(other.isOnline),
              lastSeen: other.lastSeen ?? null,
            },
          }))
        }
        await markRead(token, threadId, chatBaseUrl)
        await refreshThreads()
      } catch (err) {
        setError(errMessage(err))
      } finally {
        setLoading(false)
      }
    },
    [token, refreshThreads, chatBaseUrl],
  )

  const socketHandlers = useCallback(
    () => ({
      onThreadsList: (payload: unknown) => {
        if (Array.isArray(payload)) setThreads(payload as ChatThread[])
      },
      onThreadUpdated: (payload: unknown) => {
        const t = payload as ChatThread
        if (!t?.threadId) return
        setThreads((prev) => {
          const next = [...prev]
          const idx = next.findIndex((x) => x.threadId === t.threadId)
          if (idx >= 0) next[idx] = { ...next[idx], ...t }
          else next.unshift(t)
          return next.sort(
            (a, b) =>
              new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime(),
          )
        })
      },
      onNewMessage: (payload: unknown) => {
        const m = payload as ChatMessage
        if (!m?._id || m.threadId !== selectedRef.current) return
        setMessages((prev) => {
          const match = (x: ChatMessage) =>
            x._id === m._id ||
            (Boolean(m.clientMessageId) && x.clientMessageId === m.clientMessageId)
          if (prev.some(match))
            return prev.map((x) => (match(x) ? { ...m, localStatus: undefined } : x))
          return [...prev, m]
        })
        if (token && m.threadId) void markRead(token, m.threadId, chatBaseUrl)
      },
      onUserStatus: (payload: unknown) => {
        const p = payload as { userId?: string; isOnline?: boolean; lastSeen?: string | null }
        const uid = String(p?.userId || '')
        if (!uid) return
        const isOnline = Boolean(p.isOnline)
        const lastSeen = p.lastSeen ?? null
        setPresence((prev) => ({ ...prev, [uid]: { isOnline, lastSeen } }))
        applyPresenceToThreads(uid, isOnline, lastSeen)
      },
      onReconnect: () => {
        void refreshThreads()
        if (selectedRef.current) void openThread(selectedRef.current)
      },
    }),
    [token, refreshThreads, openThread, applyPresenceToThreads, chatBaseUrl],
  )

  const { connected, joinThread, leaveThread, sendSocketMessage, emitTyping, subscribePresence } =
    useChatSocket(token, socketHandlers, chatBaseUrl)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate inbox from chat API
    void refreshThreads().catch((err) => {
      if (!cancelled) setError(errMessage(err))
    })
    return () => {
      cancelled = true
    }
  }, [refreshThreads])

  useEffect(() => {
    const ids = threads
      .map((t) => t.otherParticipant?.id)
      .filter(Boolean)
      .map(String)
    if (ids.length) subscribePresence(ids)
  }, [threads, subscribePresence, connected])

  useEffect(() => {
    if (!selectedThreadId) return undefined
    joinThread(selectedThreadId)
    return () => leaveThread(selectedThreadId)
  }, [selectedThreadId, joinThread, leaveThread])

  const selectedThread = useMemo(
    () => threads.find((t) => t.threadId === selectedThreadId) || null,
    [threads, selectedThreadId],
  )

  const otherId = selectedThread?.otherParticipant?.id
    ? String(selectedThread.otherParticipant.id)
    : null
  const otherPresence = otherId
    ? presence[otherId] || {
        isOnline: Boolean(selectedThread?.otherParticipant?.isOnline),
        lastSeen: selectedThread?.otherParticipant?.lastSeen ?? null,
      }
    : null

  const statusLabel = (() => {
    if (!otherPresence) return null
    if (otherPresence.isOnline) return 'Online'
    if (otherPresence.lastSeen) {
      return `Last seen ${new Date(otherPresence.lastSeen).toLocaleString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      })}`
    }
    return 'Offline'
  })()

  const handleStart = async () => {
    if (!counterpartId.trim()) {
      setError(`Enter ${counterpartIdLabel}`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const body =
        role === 'partner'
          ? { userId: counterpartId.trim(), username: counterpartName.trim() || undefined }
          : { partnerId: counterpartId.trim(), partnerName: counterpartName.trim() || undefined }
      const thread = await startThread(token, body, chatBaseUrl)
      await refreshThreads()
      await openThread(thread.threadId)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!selectedThreadId || !draft.trim()) return
    const text = draft.trim()
    const clientMessageId = createClientMessageId()
    const optimistic: ChatMessage = {
      _id: `local_${clientMessageId}`,
      threadId: selectedThreadId,
      clientMessageId,
      text,
      messageType: 'text',
      deliveryStatus: 'sent',
      senderId: identity.id,
      senderType: role,
      senderName: identity.label,
      createdAt: new Date().toISOString(),
      localStatus: 'sending',
    }
    setMessages((prev) => [...prev, optimistic])
    setDraft('')
    emitTyping(selectedThreadId, false)

    const socketRes = await sendSocketMessage({
      threadId: selectedThreadId,
      clientMessageId,
      text,
      messageType: 'text',
    })

    if (socketRes.success && socketRes.data) {
      const m = socketRes.data as ChatMessage
      setMessages((prev) =>
        prev.map((x) =>
          x.clientMessageId === clientMessageId ? { ...m, localStatus: undefined } : x,
        ),
      )
      return
    }

    try {
      const m = await sendMessageRest(
        token,
        selectedThreadId,
        { clientMessageId, text },
        chatBaseUrl,
      )
      setMessages((prev) =>
        prev.map((x) =>
          x.clientMessageId === clientMessageId ? { ...m, localStatus: undefined } : x,
        ),
      )
    } catch (err) {
      setMessages((prev) =>
        prev.map((x) =>
          x.clientMessageId === clientMessageId ? { ...x, localStatus: 'failed' } : x,
        ),
      )
      setError(errMessage(err))
    }
  }

  const handleFilePicked = async (file: File | null) => {
    if (!file || !selectedThreadId) return
    setAttachMenuOpen(false)
    setUploading(true)
    setError(null)
    const clientMessageId = createClientMessageId()
    const isImage = file.type.startsWith('image/')
    const optimistic: ChatMessage = {
      _id: `local_${clientMessageId}`,
      threadId: selectedThreadId,
      clientMessageId,
      text: '',
      messageType: isImage ? 'image' : 'file',
      fileName: file.name,
      mimeType: file.type,
      deliveryStatus: 'sent',
      senderId: identity.id,
      senderType: role,
      senderName: identity.label,
      createdAt: new Date().toISOString(),
      localStatus: 'sending',
    }
    setMessages((prev) => [...prev, optimistic])
    try {
      const m = await uploadAttachment(token, selectedThreadId, file, clientMessageId, chatBaseUrl)
      setMessages((prev) =>
        prev.map((x) =>
          x.clientMessageId === clientMessageId ? { ...m, localStatus: undefined } : x,
        ),
      )
      await refreshThreads()
    } catch (err) {
      setMessages((prev) =>
        prev.map((x) =>
          x.clientMessageId === clientMessageId ? { ...x, localStatus: 'failed' } : x,
        ),
      )
      setError(errMessage(err))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const headerName = selectedThread
    ? selectedThread.otherParticipant?.name ||
      selectedThread.otherParticipant?.username ||
      (role === 'partner' ? selectedThread.username : selectedThread.partnerName) ||
      'Conversation'
    : 'Select a conversation'

  return (
    <div className="flex min-h-[640px] flex-col rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-xs text-zinc-400">
              {identity.label} � <span className="break-all">{identity.id}</span>
            </p>
            <p className="mt-1 text-[10px] text-zinc-500">API: {chatBaseUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{connected ? 'socket on' : 'socket off'}</span>
            {onLogout ? (
              <button
                type="button"
                className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                onClick={onLogout}
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-3 mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid flex-1 grid-cols-1 gap-0 md:grid-cols-[240px_1fr]">
        <aside className="space-y-3 border-b border-zinc-800 p-3 md:border-r md:border-b-0">
          {counterpartOptions.length > 0 ? (
            <>
              <label className="block text-[10px] tracking-wide text-zinc-500 uppercase">
                Quick pick
              </label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
                value=""
                onChange={(e) => {
                  const opt = counterpartOptions.find((c) => c.id === e.target.value)
                  if (!opt) return
                  setCounterpartId(opt.id)
                  setCounterpartName(opt.label)
                }}
              >
                <option value="">Select�</option>
                {counterpartOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <label className="block text-[10px] tracking-wide text-zinc-500 uppercase">
            {counterpartIdLabel}
          </label>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            value={counterpartId}
            onChange={(e) => setCounterpartId(e.target.value)}
            placeholder={counterpartIdLabel}
          />
          <label className="block text-[10px] tracking-wide text-zinc-500 uppercase">
            {counterpartNameLabel}
          </label>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            value={counterpartName}
            onChange={(e) => setCounterpartName(e.target.value)}
            placeholder={counterpartNameLabel}
          />
          <button
            type="button"
            className={`w-full rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 ${accentBtn}`}
            disabled={loading}
            onClick={() => void handleStart()}
          >
            Start / open chat
          </button>

          <div className="border-t border-zinc-800 pt-3">
            <div className="mb-2 text-[10px] tracking-wide text-zinc-500 uppercase">Inbox</div>
            <ul className="max-h-56 space-y-1 overflow-auto">
              {threads.map((t) => {
                const oid = t.otherParticipant?.id ? String(t.otherParticipant.id) : ''
                const online = oid
                  ? Boolean(presence[oid]?.isOnline ?? t.otherParticipant?.isOnline)
                  : false
                return (
                  <li key={t.threadId}>
                    <button
                      type="button"
                      className={`w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-zinc-800 ${selectedThreadId === t.threadId ? 'bg-zinc-800' : ''}`}
                      onClick={() => void openThread(t.threadId)}
                    >
                      <div className="flex items-center gap-2 truncate font-medium">
                        <span
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${online ? 'bg-emerald-400' : 'bg-zinc-600'}`}
                          title={online ? 'Online' : 'Offline'}
                        />
                        {t.otherParticipant?.name ||
                          t.otherParticipant?.username ||
                          (role === 'partner' ? t.username : t.partnerName) ||
                          'Chat'}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">
                        {t.lastMessageText || '�'}
                      </div>
                      {t.unreadCount > 0 ? (
                        <span className="mt-1 inline-block rounded-full bg-amber-400 px-1.5 text-[10px] font-semibold text-zinc-950">
                          {t.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
              {!threads.length ? <li className="text-xs text-zinc-500">No threads yet</li> : null}
            </ul>
          </div>
        </aside>

        <section className="flex min-h-[360px] flex-col">
          <div className="border-b border-zinc-800 px-3 py-2">
            <div className="text-sm font-medium">{headerName}</div>
            {selectedThread ? (
              <div className="text-[10px] text-zinc-500">
                <span className={otherPresence?.isOnline ? 'text-emerald-400' : ''}>
                  {statusLabel || 'Offline'}
                </span>
                <span className="text-zinc-600"> � {selectedThread.threadId}</span>
              </div>
            ) : null}
          </div>

          <div className="flex-1 space-y-2 overflow-auto px-3 py-3">
            {loading && !messages.length ? (
              <div className="text-sm text-zinc-500">Loading�</div>
            ) : null}
            {messages.map((m) => {
              const mine = m.senderId === identity.id
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? `${accentMine} text-white` : 'bg-white text-zinc-900'}`}
                  >
                    {m.messageType === 'image' && m.fileUrl ? (
                      <a href={m.fileUrl} target="_blank" rel="noreferrer">
                        <img
                          src={m.fileUrl}
                          alt={m.fileName || 'image'}
                          className="mb-1 max-h-48 rounded-lg object-cover"
                        />
                      </a>
                    ) : null}
                    {m.messageType === 'file' && m.fileUrl ? (
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`mb-1 block underline ${mine ? 'text-white' : 'text-sky-700'}`}
                      >
                        ?? {m.fileName || 'File'}
                      </a>
                    ) : null}
                    {m.text ? <div>{m.text}</div> : null}
                    {!m.text && m.messageType === 'text' ? <div>�</div> : null}
                    <div className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-zinc-500'}`}>
                      {m.localStatus === 'sending'
                        ? 'Sending�'
                        : m.localStatus === 'failed'
                          ? 'Failed'
                          : new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative border-t border-zinc-800 p-3">
            {attachMenuOpen ? (
              <div className="absolute bottom-16 left-3 z-10 w-48 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-800"
                  disabled={!selectedThreadId || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload image / PDF
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-800"
                  disabled={!selectedThreadId}
                  onClick={() => {
                    setAttachMenuOpen(false)
                    setVaultOpen(true)
                  }}
                >
                  File Vault
                </button>
              </div>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => void handleFilePicked(e.target.files?.[0] || null)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full border border-zinc-700 px-3 py-2 text-sm disabled:opacity-50"
                disabled={!selectedThreadId || uploading}
                onClick={() => setAttachMenuOpen((v) => !v)}
                aria-label="Attachments"
              >
                {attachMenuOpen ? '�' : '+'}
              </button>
              <input
                className="flex-1 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm"
                placeholder="Start typing�"
                value={draft}
                disabled={!selectedThreadId}
                onChange={(e) => {
                  setDraft(e.target.value)
                  if (selectedThreadId) emitTyping(selectedThreadId, Boolean(e.target.value))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
              />
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50 ${accentBtn}`}
                disabled={!selectedThreadId || !draft.trim() || uploading}
                onClick={() => void handleSend()}
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedThreadId ? (
        <FileVaultModal
          token={token}
          threadId={selectedThreadId}
          open={vaultOpen}
          chatBaseUrl={chatBaseUrl}
          onClose={() => setVaultOpen(false)}
        />
      ) : null}
    </div>
  )
}
