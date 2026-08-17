import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { partnerLoginWithPhone, type PartnerLoginResult } from '../api/partner-auth.api'
import { PartnerSupportChatPanel } from '../components/partner-support-chat-panel'
import {
  loadSupportBackendMode,
  resolveSupportBaseUrl,
  saveSupportBackendMode,
  type SupportBackendMode,
} from '../config/support-backend'

const SESSION_KEY = 'joms_dev_partner_support'

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
  mode: SupportBackendMode
  onChange: (mode: SupportBackendMode) => void
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

export function PartnerSupportTestPage() {
  const [session, setSession] = useState<PartnerLoginResult | null>(() => loadSession())
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [supportMode, setSupportMode] = useState<SupportBackendMode>(() => loadSupportBackendMode())

  const adminBaseUrl = useMemo(() => resolveSupportBaseUrl(supportMode), [supportMode])

  const handleModeChange = (mode: SupportBackendMode) => {
    setSupportMode(mode)
    saveSupportBackendMode(mode)
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
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
              <h1 className="text-2xl font-semibold tracking-tight">Partner support login</h1>
              <Link to="/dev/chat-test" className="text-sm text-zinc-400 hover:text-zinc-200">
                ← Harness
              </Link>
            </div>
            <p className="text-sm text-zinc-400">
              Partner JWT via auth-service. Support chat uses admin-service REST + Socket.IO.
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
              <span className="text-xs tracking-wide text-zinc-500 uppercase">Admin backend</span>
              <EndpointToggle mode={supportMode} onChange={handleModeChange} />
              <span className="text-[11px] text-zinc-500">{adminBaseUrl}</span>
            </div>
          </header>

          <form
            onSubmit={(event) => void handleLogin(event)}
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
                onChange={(event) => setPhone(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
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
              {loading ? 'Signing in…' : 'Login as partner'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-lg space-y-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Partner support chat</h1>
            <div className="flex items-center gap-3 text-sm">
              <Link to="/dev/chat-partner" className="text-amber-400 hover:underline">
                Partner chat →
              </Link>
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            Each service selection creates a new ticket. Messages sync to Zoho Desk Live Chat
            (SalesIQ). Zoho OAuth:{' '}
            <a
              className="text-sky-400 hover:underline"
              href={`${adminBaseUrl}/admin/zoho/connect`}
              target="_blank"
              rel="noreferrer"
            >
              connect
            </a>
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
            <span className="text-xs tracking-wide text-zinc-500 uppercase">Admin backend</span>
            <EndpointToggle mode={supportMode} onChange={handleModeChange} />
            <span className="text-[11px] text-zinc-500">{adminBaseUrl}</span>
          </div>
          <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs break-all text-zinc-400">
            Partner id: <span className="text-amber-300">{session.id}</span>
          </p>
        </header>

        <PartnerSupportChatPanel
          accessToken={session.accessToken}
          adminBaseUrl={adminBaseUrl}
          reporterName={session.fullname || session.phone || 'Partner'}
          reporterPhone={session.phone ?? undefined}
        />
      </div>
    </div>
  )
}
