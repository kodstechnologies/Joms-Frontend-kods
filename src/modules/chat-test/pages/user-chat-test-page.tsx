import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATIC_CHAT_USERS } from '../config/static-users'
import {
  loadChatBackendMode,
  resolveChatBaseUrl,
  saveChatBackendMode,
  type ChatBackendMode,
} from '../config/chat-backend'
import { ChatTestPanel } from '../components/chat-test-panel'
import { UserQuotationPanel } from '../components/user-quotation-panel'

function EndpointToggle({
  mode,
  onChange,
}: {
  mode: ChatBackendMode
  onChange: (mode: ChatBackendMode) => void
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
      <button
        type="button"
        onClick={() => onChange('local')}
        className={`px-3 py-1.5 text-xs ${mode === 'local' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'}`}
      >
        Local
      </button>
      <button
        type="button"
        onClick={() => onChange('server')}
        className={`px-3 py-1.5 text-xs ${mode === 'server' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'}`}
      >
        Server
      </button>
    </div>
  )
}

export function UserChatTestPage() {
  const [userId, setUserId] = useState(STATIC_CHAT_USERS[0]?.id || '')
  const [chatMode, setChatMode] = useState<ChatBackendMode>(() => loadChatBackendMode())

  const chatBaseUrl = useMemo(() => resolveChatBaseUrl(chatMode), [chatMode])

  const selectedUser = useMemo(
    () => STATIC_CHAT_USERS.find((x) => x.id === userId) || STATIC_CHAT_USERS[0] || null,
    [userId],
  )

  const identity = useMemo(() => {
    if (!selectedUser) return null
    return {
      id: selectedUser.id,
      label: selectedUser.username,
      accessToken: selectedUser.accessToken,
    }
  }, [selectedUser])

  const handleModeChange = (mode: ChatBackendMode) => {
    setChatMode(mode)
    saveChatBackendMode(mode)
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">User chat (static)</h1>
            <Link to="/dev/chat-partner" className="text-sm text-amber-400 hover:underline">
              Open partner panel →
            </Link>
          </div>
          <p className="text-sm text-zinc-400">
            Pick a partner&apos;s offerings: book consultations (preview + slot + pay) or request
            service quotations, then chat / accept proposals.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <label className="text-xs tracking-wide text-zinc-500 uppercase">Static user</label>
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            {STATIC_CHAT_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
          <span className="text-xs break-all text-zinc-500">
            {selectedUser?.id} · {selectedUser?.phone_e164}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">Chat backend</span>
          <EndpointToggle mode={chatMode} onChange={handleModeChange} />
          <span className="text-[11px] text-zinc-500">{chatBaseUrl}</span>
        </div>

        {selectedUser ? <UserQuotationPanel user={selectedUser} /> : null}

        {identity ? (
          <ChatTestPanel
            role="user"
            title="User panel (static)"
            accent="sky"
            identity={identity}
            chatBaseUrl={chatBaseUrl}
            counterpartIdLabel="Partner id"
            counterpartNameLabel="Partner name"
          />
        ) : null}
      </div>
    </div>
  )
}
