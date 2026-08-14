import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { partnerLoginWithPhone, type PartnerLoginResult } from '../api/partner-auth.api'
import { STATIC_CHAT_USERS } from '../config/static-users'
import {
  loadChatBackendMode,
  resolveChatBaseUrl,
  saveChatBackendMode,
  type ChatBackendMode,
} from '../config/chat-backend'
import { ChatTestPanel } from '../components/chat-test-panel'
import { PartnerMyProjects } from '../components/partner-my-projects'
import { PartnerQuotationPanel } from '../components/partner-quotation-panel'

const SESSION_KEY = 'joms_dev_partner_chat'

function loadSession(): PartnerLoginResult | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PartnerLoginResult
    localStorage.setItem(SESSION_KEY, raw)
    sessionStorage.removeItem(SESSION_KEY)
    return parsed
  } catch {
    return null
  }
}

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

export function PartnerChatTestPage() {
  const [session, setSession] = useState<PartnerLoginResult | null>(() => loadSession())
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [chatMode, setChatMode] = useState<ChatBackendMode>(() => loadChatBackendMode())

  const chatBaseUrl = useMemo(() => resolveChatBaseUrl(chatMode), [chatMode])

  const handleModeChange = (mode: ChatBackendMode) => {
    setChatMode(mode)
    saveChatBackendMode(mode)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await partnerLoginWithPhone(phone.trim(), password)
      if (!data?.accessToken || !data?.id) throw new Error('Login response missing token')
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
      setSession(data)
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Login failed')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-6">
        <div className="mx-auto max-w-md space-y-6">
          <header className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Partner chat login</h1>
              <Link to="/dev/chat-user" className="text-sm text-sky-400 hover:underline">
                User panel →
              </Link>
            </div>
            <p className="text-sm text-zinc-400">
              Real partner login via auth-service (`/auth/loginwithphone`). Dynamic JWT.
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
              <span className="text-xs tracking-wide text-zinc-500 uppercase">Chat backend</span>
              <EndpointToggle mode={chatMode} onChange={handleModeChange} />
              <span className="text-[11px] text-zinc-500">{chatBaseUrl}</span>
            </div>
          </header>

          <form
            onSubmit={(e) => void handleLogin(e)}
            className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            {error ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}
            <label className="block space-y-1">
              <span className="text-xs tracking-wide text-zinc-500 uppercase">Phone</span>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Partner phone"
                autoComplete="username"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs tracking-wide text-zinc-500 uppercase">Password</span>
              <input
                type="password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
            >
              {loading ? 'Logging in…' : 'Login as partner'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const identity = {
    id: String(session.id),
    label: session.fullname || session.phone || 'Partner',
    accessToken: session.accessToken,
  }

  const userQuickPicks = STATIC_CHAT_USERS.map((u) => ({
    id: u.id,
    label: u.username,
    accessToken: u.accessToken,
  }))

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Partner chat</h1>
            <Link to="/dev/chat-user" className="text-sm text-sky-400 hover:underline">
              Open user panel →
            </Link>
          </div>
          <p className="text-sm text-zinc-400">
            Logged in dynamically. For fixed/tiered: user dummy-pays, then Accept on My Projects
            below (not via chat). Copy partner id into the user panel if needed.
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
            <span className="text-xs tracking-wide text-zinc-500 uppercase">Chat backend</span>
            <EndpointToggle mode={chatMode} onChange={handleModeChange} />
            <span className="text-[11px] text-zinc-500">{chatBaseUrl}</span>
          </div>
          <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs break-all text-zinc-400">
            Partner id: <span className="text-amber-300">{identity.id}</span>
          </p>
        </header>

        <PartnerMyProjects token={identity.accessToken} />

        <PartnerQuotationPanel token={identity.accessToken} />
        <ChatTestPanel
          role="partner"
          title="Partner panel"
          accent="amber"
          identity={identity}
          chatBaseUrl={chatBaseUrl}
          counterpartOptions={userQuickPicks}
          counterpartIdLabel="User id"
          counterpartNameLabel="Username"
          onLogout={handleLogout}
        />
      </div>
    </div>
  )
}
