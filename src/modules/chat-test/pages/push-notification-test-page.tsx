import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  clearPartnerSession,
  partnerLoginWithPhone,
  persistPartnerSession,
  type PartnerLoginResult,
} from '../api/partner-auth.api'
import { PartnerGoogleSignIn } from '../components/partner-google-sign-in'
import { PushNotificationTestPanel } from '../components/push-notification-test-panel'

const SESSION_KEY = 'joms_dev_partner_chat'

function loadSession(): PartnerLoginResult | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PartnerLoginResult
  } catch {
    return null
  }
}

/** Dev harness — exercise all partner transactional push types + deepLinks */
export function PushNotificationTestPage() {
  const [session, setSession] = useState<PartnerLoginResult | null>(() => loadSession())
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const data = await partnerLoginWithPhone(phone.trim(), password)
      if (!data?.accessToken || !data?.id) throw new Error('Login response missing token')
      persistPartnerSession(data)
      setSession(data)
      toast.success(`Signed in as ${data.fullname}`)
    } catch (error) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (error instanceof Error ? error.message : 'Login failed'),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearPartnerSession()
    setSession(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Push notification test</h1>
            <Link to="/dev/chat-test" className="text-sm text-zinc-400 hover:text-zinc-200">
              ← Chat test home
            </Link>
          </div>
          <p className="text-sm text-zinc-400">
            Fire every partner <code className="text-violet-300">eventType</code> via internal
            notify (in-app + FCM). Confirm deepLink navigation payloads match{' '}
            <code className="text-violet-300">
              Joms-Dev-Tools/docs/backend/notification-service/PARTNER_FLUTTER_PUSH_NOTIFICATIONS.md
            </code>
            .
          </p>
        </header>

        {!session ? (
          <section className="mx-auto max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-sm text-zinc-400">
              Sign in as a partner to register device tokens and verify inbox rows.
            </p>
            <PartnerGoogleSignIn
              onSuccess={(partner) => {
                setSession(partner)
                toast.success(`Signed in as ${partner.fullname}`)
              }}
            />
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Partner phone"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-amber-500 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in with phone'}
              </button>
            </form>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm">
              <span>
                {session.fullname} · <span className="text-zinc-500">{String(session.id)}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300"
              >
                Sign out
              </button>
            </div>
            <PushNotificationTestPanel session={session} />
          </>
        )}
      </div>
    </div>
  )
}
