import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { clearPartnerSession, type PartnerLoginResult } from '../api/partner-auth.api'
import { PartnerGoogleSignIn } from '../components/partner-google-sign-in'

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

/** Landing for temp chat harness links */
export function ChatTestPage() {
  const navigate = useNavigate()
  const [googleSession, setGoogleSession] = useState<PartnerLoginResult | null>(() => loadSession())

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold">Chat test harness</h1>
        <p className="text-sm text-zinc-400">Temporary — delete later.</p>

        <section className="space-y-3 rounded-xl border border-white/15 bg-zinc-900/70 px-4 py-4">
          <div>
            <div className="font-medium text-zinc-100">Partner · Sign in with Google</div>
            <p className="mt-1 text-sm text-zinc-400">
              Test `POST /auth/google/signin` from this entry. Success stores the partner JWT and
              opens the partner panel.
            </p>
          </div>
          {googleSession ? (
            <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
              <p className="text-emerald-200">Signed in as {googleSession.fullname}</p>
              <p className="text-xs break-all text-zinc-400">
                {googleSession.email || 'No email'} · id {String(googleSession.id)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/dev/chat-partner"
                  className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950"
                >
                  Open partner panel
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    clearPartnerSession()
                    setGoogleSession(null)
                  }}
                  className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <PartnerGoogleSignIn
              onSuccess={(partner) => {
                setGoogleSession(partner)
                navigate('/dev/chat-partner')
              }}
            />
          )}
        </section>

        <div className="grid gap-3">
          <Link
            to="/dev/chat-partner"
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 hover:bg-amber-500/20"
          >
            <div className="font-medium text-amber-300">Partner panel</div>
            <div className="text-sm text-zinc-400">Dynamic login (phone + password or Google)</div>
          </Link>
          <Link
            to="/dev/chat-user"
            className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 hover:bg-sky-500/20"
          >
            <div className="font-medium text-sky-300">User panel</div>
            <div className="text-sm text-zinc-400">Static test users · chat / quotations</div>
          </Link>
          <Link
            to="/dev/chat-user-venue"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 hover:bg-emerald-500/20"
          >
            <div className="font-medium text-emerald-300">User · Venue tab</div>
            <div className="text-sm text-zinc-400">Separate — book venue/space + dummy pay</div>
          </Link>
          <Link
            to="/payment-finance-testing"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 hover:bg-emerald-500/20"
          >
            <div className="font-medium text-emerald-300">Payment &amp; Finance testing</div>
            <div className="text-sm text-zinc-400">
              Partner + user sessions · 10 models step-by-step · verify admin screens
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
