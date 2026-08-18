import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { partnerLoginWithPhone, type PartnerLoginResult } from '../api/partner-auth.api'
import { STATIC_CHAT_USERS, type StaticChatUser } from '../config/static-users'
import { login as loginAdmin, verifyOtp as verifyAdminOtp } from '@/modules/auth/api/auth-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { fetchRbacMe } from '@/modules/rbac/api/rbac-api'
import { normalizeUserPermissions } from '@/app/layouts/navigation/navigation.filter'

const PARTNER_SESSION_KEY = 'joms_dev_partner_chat'
const PARTNER_CREDS_KEY = 'joms_finance_test_partner_creds'
const ADMIN_EMAIL_KEY = 'joms_finance_test_admin_email'

function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number
    }
    return typeof json.exp === 'number' ? json.exp : null
  } catch {
    return null
  }
}

function formatExp(token: string | null | undefined): string {
  if (!token) return 'no token'
  const exp = decodeJwtExp(token)
  if (!exp) return 'exp unknown'
  const ms = exp * 1000 - Date.now()
  if (ms <= 0) return 'EXPIRED — refresh now'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `expires in ~${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `expires in ~${hours}h`
  return `expires ${new Date(exp * 1000).toLocaleDateString()}`
}

type Props = {
  partner: PartnerLoginResult | null
  onPartnerChange: (partner: PartnerLoginResult | null) => void
  userId: string
  onUserIdChange: (id: string) => void
  selectedUser: StaticChatUser | null
}

export function FinanceTestSessionBar({
  partner,
  onPartnerChange,
  userId,
  onUserIdChange,
  selectedUser,
}: Props) {
  const adminUser = useAuthStore((s) => s.user)
  const adminToken = useAuthStore((s) => s.token)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [phone, setPhone] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(PARTNER_CREDS_KEY) || '{}').phone || partner?.phone || ''
      )
    } catch {
      return partner?.phone || ''
    }
  })
  const [password, setPassword] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PARTNER_CREDS_KEY) || '{}').password || ''
    } catch {
      return ''
    }
  })
  const [partnerBusy, setPartnerBusy] = useState(false)
  const [partnerMsg, setPartnerMsg] = useState<string | null>(null)
  const [partnerErr, setPartnerErr] = useState<string | null>(null)

  const [adminEmail, setAdminEmail] = useState(
    () => localStorage.getItem(ADMIN_EMAIL_KEY) || adminUser?.email || 'admin@kods.com',
  )
  const [adminPassword, setAdminPassword] = useState('')
  const [adminOtp, setAdminOtp] = useState('')
  const [adminStep, setAdminStep] = useState<'creds' | 'otp'>('creds')
  const [adminBusy, setAdminBusy] = useState(false)
  const [adminMsg, setAdminMsg] = useState<string | null>(null)
  const [adminErr, setAdminErr] = useState<string | null>(null)

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000)
    return () => window.clearInterval(id)
  }, [])

  const partnerLogin = async (mode: 'login' | 'refresh') => {
    setPartnerBusy(true)
    setPartnerErr(null)
    setPartnerMsg(null)
    try {
      if (!phone.trim() || !password) {
        throw new Error('Enter partner phone + password')
      }
      const data = await partnerLoginWithPhone(phone.trim(), password)
      if (!data?.accessToken || !data?.id) throw new Error('Login response missing token')
      localStorage.setItem(PARTNER_SESSION_KEY, JSON.stringify(data))
      localStorage.setItem(PARTNER_CREDS_KEY, JSON.stringify({ phone: phone.trim(), password }))
      onPartnerChange(data)
      const ok = mode === 'refresh' ? 'Partner token refreshed.' : 'Partner logged in.'
      setPartnerMsg(ok)
      toast.success(ok)
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Partner login failed')
      setPartnerErr(msg)
      toast.error(msg)
    } finally {
      setPartnerBusy(false)
    }
  }

  const partnerLogout = () => {
    localStorage.removeItem(PARTNER_SESSION_KEY)
    sessionStorage.removeItem(PARTNER_SESSION_KEY)
    onPartnerChange(null)
    setPartnerMsg('Partner logged out.')
    toast.message('Partner logged out')
  }

  const sendAdminOtp = async (e?: FormEvent) => {
    e?.preventDefault()
    setAdminBusy(true)
    setAdminErr(null)
    setAdminMsg(null)
    try {
      await loginAdmin({ email: adminEmail.trim(), password: adminPassword })
      localStorage.setItem(ADMIN_EMAIL_KEY, adminEmail.trim())
      setAdminStep('otp')
      setAdminMsg('OTP sent to admin email.')
      toast.success('OTP sent to admin email')
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Admin login failed')
      setAdminErr(msg)
      toast.error(msg)
    } finally {
      setAdminBusy(false)
    }
  }

  const verifyAdmin = async (e?: FormEvent) => {
    e?.preventDefault()
    setAdminBusy(true)
    setAdminErr(null)
    setAdminMsg(null)
    try {
      const response = await verifyAdminOtp({
        email: adminEmail.trim(),
        otp: adminOtp.trim(),
      })
      const session = response?.data as {
        token?: string
        admin?: {
          id?: string
          email?: string
          fullname?: string
          kind?: 'superadmin' | 'subadmin'
          isSuperAdmin?: boolean
          permissions?: string[]
          mfaEnabled?: boolean
          status?: string
          subAdminId?: string
        }
      }
      const admin = session?.admin
      const token = session?.token
      if (!token) throw new Error('No admin token returned')

      setSession(
        {
          id: admin?.id || '',
          email: admin?.email || adminEmail.trim(),
          fullname: admin?.fullname || 'Admin',
          kind: admin?.kind ?? (admin?.isSuperAdmin ? 'superadmin' : 'subadmin'),
          isSuperAdmin: Boolean(admin?.isSuperAdmin || admin?.kind === 'superadmin'),
          permissions: normalizeUserPermissions(admin?.permissions ?? []),
          mfaEnabled: admin?.mfaEnabled,
          status: admin?.status,
          subAdminId: admin?.subAdminId,
        },
        token,
      )

      if (!admin?.isSuperAdmin && admin?.kind !== 'superadmin') {
        try {
          const me = await fetchRbacMe()
          const profile = me?.data
          updateUser({
            subAdminId: profile?.subAdminId || admin?.subAdminId,
            permissions: normalizeUserPermissions(profile?.permissions ?? []),
          })
        } catch {
          /* optional */
        }
      }

      setAdminMsg('Admin token refreshed.')
      setAdminStep('creds')
      setAdminOtp('')
      toast.success('Admin token saved')
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'OTP verify failed')
      setAdminErr(msg)
      toast.error(msg)
    } finally {
      setAdminBusy(false)
    }
  }

  void tick

  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-200">Sessions — login / refresh tokens</h2>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          {collapsed ? 'Expand login' : 'Collapse login'}
        </button>
      </div>

      {collapsed ? (
        <p className="text-xs text-zinc-500">
          Partner {partner ? '✓' : '✗'} · User {selectedUser?.username || '—'} · Admin{' '}
          {adminUser ? '✓' : '✗'} — expand to refresh tokens.
        </p>
      ) : null}

      {collapsed ? null : (
        <>
          <div className="grid gap-3 lg:grid-cols-3">
            {/* Partner — always show login fields */}
            <div className="rounded-xl border border-amber-500/40 bg-zinc-900/80 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-amber-200">Partner</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    partner ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {partner ? 'active' : 'not logged in'}
                </span>
              </div>

              {partner ? (
                <div className="mb-2 space-y-1 text-[11px]">
                  <p className="text-zinc-300">{partner.fullname || partner.phone}</p>
                  <p className="break-all text-zinc-500">
                    id <span className="text-amber-300">{partner.id}</span>
                  </p>
                  <p
                    className={
                      formatExp(partner.accessToken).includes('EXPIRED')
                        ? 'text-red-300'
                        : 'text-zinc-500'
                    }
                  >
                    {formatExp(partner.accessToken)}
                  </p>
                </div>
              ) : null}

              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void partnerLogin(partner ? 'refresh' : 'login')
                }}
              >
                <input
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
                  placeholder="Partner phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="username"
                />
                <input
                  type="password"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={partnerBusy}
                    className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-medium text-zinc-950 disabled:opacity-50"
                  >
                    {partnerBusy ? '…' : partner ? 'Refresh partner token' : 'Login partner'}
                  </button>
                  {partner ? (
                    <button
                      type="button"
                      onClick={partnerLogout}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-800"
                    >
                      Logout
                    </button>
                  ) : null}
                </div>
              </form>
              <p className="mt-2 text-[11px] text-zinc-500">
                One partner session only. Close{' '}
                <code className="text-zinc-400">/dev/chat-partner</code> before using this page, or
                Refresh here after that tab logs in.
              </p>
              {partnerErr ? <p className="mt-2 text-xs text-red-300">{partnerErr}</p> : null}
              {partnerMsg ? <p className="mt-2 text-xs text-emerald-300">{partnerMsg}</p> : null}
            </div>

            {/* User static */}
            <div className="rounded-xl border border-sky-500/40 bg-zinc-900/80 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-sky-200">User (static JWT)</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                  selected
                </span>
              </div>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
                value={userId}
                onChange={(e) => onUserIdChange(e.target.value)}
              >
                {STATIC_CHAT_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} · {u.phone_e164}
                  </option>
                ))}
              </select>
              {selectedUser ? (
                <div className="mt-2 space-y-1 text-[11px] text-zinc-500">
                  <p className="break-all">{selectedUser.id}</p>
                  <p
                    className={
                      formatExp(selectedUser.accessToken).includes('EXPIRED')
                        ? 'text-red-300'
                        : 'text-zinc-500'
                    }
                  >
                    {formatExp(selectedUser.accessToken)}
                  </p>
                  <p className="text-zinc-600">
                    To refresh user tokens: run{' '}
                    <code className="text-zinc-400">pnpm mint-static-users</code> in chat-service
                    and paste into <code className="text-zinc-400">static-users.ts</code>.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Admin — login + OTP on page */}
            <div className="rounded-xl border border-violet-500/40 bg-zinc-900/80 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-violet-200">Admin</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    adminUser ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {adminUser ? 'active' : 'not logged in'}
                </span>
              </div>

              {adminUser ? (
                <div className="mb-2 space-y-1 text-[11px]">
                  <p className="text-violet-200">{adminUser.email}</p>
                  <p
                    className={
                      formatExp(adminToken).includes('EXPIRED') ? 'text-red-300' : 'text-zinc-500'
                    }
                  >
                    {formatExp(adminToken)}
                  </p>
                </div>
              ) : null}

              {adminStep === 'creds' ? (
                <form className="space-y-2" onSubmit={(e) => void sendAdminOtp(e)}>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
                    placeholder="Admin email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    autoComplete="username"
                  />
                  <input
                    type="password"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={adminBusy}
                      className="flex-1 rounded-lg bg-violet-400 px-3 py-1.5 text-sm font-medium text-zinc-950 disabled:opacity-50"
                    >
                      {adminBusy
                        ? '…'
                        : adminUser
                          ? 'Refresh admin (send OTP)'
                          : 'Login admin (send OTP)'}
                    </button>
                    {adminUser ? (
                      <button
                        type="button"
                        onClick={() => {
                          clearSession()
                          setAdminMsg('Admin logged out.')
                          toast.message('Admin logged out')
                        }}
                        className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-800"
                      >
                        Logout
                      </button>
                    ) : null}
                  </div>
                </form>
              ) : (
                <form className="space-y-2" onSubmit={(e) => void verifyAdmin(e)}>
                  <p className="text-[11px] text-zinc-400">OTP sent to {adminEmail}</p>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm tracking-widest"
                    placeholder="6-digit OTP"
                    value={adminOtp}
                    onChange={(e) => setAdminOtp(e.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={adminBusy || adminOtp.trim().length !== 6}
                      className="flex-1 rounded-lg bg-violet-400 px-3 py-1.5 text-sm font-medium text-zinc-950 disabled:opacity-50"
                    >
                      {adminBusy ? '…' : 'Verify OTP & save token'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminStep('creds')
                        setAdminOtp('')
                      }}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-800"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
              {adminErr ? <p className="mt-2 text-xs text-red-300">{adminErr}</p> : null}
              {adminMsg ? <p className="mt-2 text-xs text-emerald-300">{adminMsg}</p> : null}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
