import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { PartnerLoginResult } from '../api/partner-auth.api'
import { refreshPartnerFromStoredCreds } from '../api/partner-auth.api'
import type { StaticChatUser } from '../config/static-users'
import type { FinanceTestModel } from '../config/finance-test-models'
import {
  createPaymentOrder,
  dummyPayOrder,
  listExpertMembershipPlans,
  verifyPaymentOrder,
} from '../api/finance-test-payment.api'
import { listAdminVenuesForHarness, type HarnessVenue } from '../api/finance-test-venue.api'
import { openRazorpayCheckout } from '../lib/load-razorpay'
import {
  acceptProposal,
  createPaymentRequest,
  createQuotationRequest,
  listPartnerOfferings,
  sendProposal,
  upsertProposal,
  type PartnerOffering,
} from '../api/quotation.api'
import { createServiceOrder } from '../api/service-order.api'
import {
  createConsultationBooking,
  getConsultationSlots,
  testSetupConsultationBooking,
} from '../api/consultation-booking.api'
import type { MembershipPlan } from '@/modules/memberships/types/membership'
import {
  fetchFinancePayouts,
  fetchFinanceRefunds,
  fetchFinanceDisputes,
  seedFinanceRefundCase,
  fetchFinanceRevenue,
  fetchFinanceTax,
  fetchFinanceReconciliation,
  fetchFinanceEscrow,
  backfillFinanceArtifacts,
} from '@/modules/payments/api/finance-api'
import { fetchExpertSubscriptions } from '@/modules/memberships/api/membership-subscription-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'

type Props = {
  model: FinanceTestModel
  partner: PartnerLoginResult | null
  onPartnerChange?: (partner: PartnerLoginResult | null) => void
  user: StaticChatUser | null
}

type StatusMsg = { ok: boolean; text: string } | null

type PayMode = 'dummy' | 'razorpay'

function errText(err: unknown) {
  const msg =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Something failed')
  if (/signed in on another device/i.test(msg)) {
    return `${msg} Close /dev/chat-partner (and other partner tabs), then Partner Refresh in the session bar.`
  }
  return msg
}

async function ensureFreshPartner(
  partner: PartnerLoginResult | null,
  onChange?: (next: PartnerLoginResult | null) => void,
): Promise<PartnerLoginResult> {
  if (!partner) throw new Error('Login partner first (top bar).')
  try {
    const fresh = await refreshPartnerFromStoredCreds()
    onChange?.(fresh)
    return fresh
  } catch (err) {
    const msg = errText(err)
    if (/No saved partner credentials|Missing partner phone/i.test(msg)) {
      throw new Error(
        'Partner session expired. Enter phone + password in the session bar and login again.',
        { cause: err },
      )
    }
    throw err
  }
}

function flash(ok: boolean, text: string): StatusMsg {
  if (ok) toast.success(text)
  else toast.error(text)
  return { ok, text }
}

/** Dummy skip-QR, or official Razorpay Checkout + verify. */
async function fulfillHarnessPayment(
  token: string,
  order: Awaited<ReturnType<typeof createPaymentOrder>>,
  mode: PayMode,
) {
  if (mode === 'dummy') {
    toast.message('Dummy pay (skipping Razorpay)…')
    return dummyPayOrder(token, order.orderId)
  }
  if (!order.razorpayOrderId || order.razorpayOrderId.startsWith('order_dummy_')) {
    throw new Error('Razorpay did not create a live order. Check payment-service keys and retry.')
  }
  toast.message('Opening Razorpay…')
  const rzp = await openRazorpayCheckout(order)
  toast.message('Verifying payment…')
  return verifyPaymentOrder(token, {
    orderId: order.orderId,
    razorpayOrderId: rzp.razorpay_order_id,
    razorpayPaymentId: rzp.razorpay_payment_id,
    razorpaySignature: rzp.razorpay_signature,
  })
}

function PayModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: PayMode
  onChange: (mode: PayMode) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-950/50 p-3">
      <p className="text-xs tracking-wide text-zinc-500 uppercase">Payment method</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('dummy')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
            mode === 'dummy'
              ? 'border-emerald-400 bg-emerald-400 text-zinc-950'
              : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          Dummy pay (skip QR)
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('razorpay')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
            mode === 'razorpay'
              ? 'border-sky-400 bg-[#528FF0] text-white'
              : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          Razorpay checkout
        </button>
      </div>
      <p className="text-[11px] text-zinc-500">
        Dummy fulfills locally. Razorpay opens the official payment screen, then we verify.
      </p>
    </div>
  )
}

function ActionBanner({ status, phase }: { status: StatusMsg; phase?: string | null }) {
  if (!status && !phase) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-400">
        Click a button — result shows here and as a toast (top-right).
      </div>
    )
  }
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        status?.ok === false
          ? 'border-red-500/50 bg-red-500/15 text-red-100'
          : status?.ok
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-100'
            : 'border-amber-500/40 bg-amber-500/10 text-amber-100'
      }`}
    >
      {phase ? (
        <div className="mb-1 text-[11px] tracking-wide uppercase opacity-80">{phase}</div>
      ) : null}
      <div className="font-medium">{status?.text || 'Working…'}</div>
    </div>
  )
}

function VerifyBar({
  href,
  label,
  onCheck,
  checking,
  checkResult,
}: {
  href: string
  label: string
  onCheck: () => void
  checking: boolean
  checkResult: StatusMsg
}) {
  return (
    <div className="space-y-2 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <p className="text-xs text-zinc-400">
        After you pay / act, confirm it shows on the admin screen.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => toast.message(`Opening ${label}…`)}
          className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          Open {label}
        </a>
        <button
          type="button"
          onClick={onCheck}
          disabled={checking}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Refresh reflection'}
        </button>
      </div>
      {checkResult ? (
        <p
          className={`text-sm font-medium ${checkResult.ok ? 'text-emerald-300' : 'text-red-300'}`}
        >
          {checkResult.ok ? '✓ ' : '✗ '}
          {checkResult.text}
        </p>
      ) : null}
    </div>
  )
}

/** Revenue + Memberships: pick plan → pick cycle → Pay (partner Razorpay) */
function MembershipPayActions({
  partner,
  onPartnerChange,
  verifyHref,
  verifyLabel,
}: {
  partner: PartnerLoginResult | null
  onPartnerChange?: (partner: PartnerLoginResult | null) => void
  verifyHref: string
  verifyLabel: string
}) {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(Boolean(partner?.accessToken))
  const [planId, setPlanId] = useState<string | null>(null)
  const [cycle, setCycle] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [phase, setPhase] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusMsg>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<StatusMsg>(null)
  const adminToken = useAuthStore((s) => s.token)

  const selected = plans.find((p) => String(p._id) === String(planId)) || null
  const cycles = selected?.pricing?.map((p) => p.billingCycleName) || []
  const activeCycle = cycle && cycles.includes(cycle) ? cycle : (cycles[0] ?? null)

  const loadPlans = useCallback(async () => {
    if (!partner?.accessToken) {
      setStatus(flash(false, 'Login partner first (top bar).'))
      return
    }
    setLoadingPlans(true)
    setPhase('Loading plans')
    setStatus({ ok: true, text: 'Loading membership plans…' })
    try {
      let token = partner.accessToken
      try {
        token = (await ensureFreshPartner(partner, onPartnerChange)).accessToken
      } catch {
        /* use existing token */
      }
      const list = await listExpertMembershipPlans(token)
      setPlans(list)
      setPlanId((prev) => {
        if (prev && list.some((p) => String(p._id) === String(prev))) return String(prev)
        return list[0]?._id ? String(list[0]._id) : null
      })
      setCycle((prev) => {
        const first = list[0]
        const names = first?.pricing?.map((p) => p.billingCycleName) || []
        if (prev && names.includes(prev)) return prev
        return names[0] || null
      })
      setStatus(
        flash(
          true,
          list.length
            ? `Loaded ${list.length} plan(s). Tap a plan → cycle → Pay.`
            : 'No active expert plans — create one in admin.',
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setLoadingPlans(false)
      setPhase(null)
    }
  }, [partner, onPartnerChange])

  useEffect(() => {
    const token = partner?.accessToken
    if (!token) return
    let active = true
    void (async () => {
      try {
        let accessToken = token
        try {
          accessToken = (await ensureFreshPartner(partner, onPartnerChange)).accessToken
        } catch {
          /* use existing token */
        }
        const list = await listExpertMembershipPlans(accessToken)
        if (!active) return
        setPlans(list)
        setPlanId((prev) => {
          if (prev && list.some((p) => String(p._id) === String(prev))) return String(prev)
          return list[0]?._id ? String(list[0]._id) : null
        })
        setCycle((prev) => {
          const first = list[0]
          const names = first?.pricing?.map((p) => p.billingCycleName) || []
          if (prev && names.includes(prev)) return prev
          return names[0] || null
        })
        setStatus(
          flash(
            true,
            list.length
              ? `Loaded ${list.length} plan(s). Tap a plan → cycle → Pay.`
              : 'No active expert plans — create one in admin.',
          ),
        )
      } catch (err) {
        if (!active) return
        setStatus(flash(false, errText(err)))
      } finally {
        if (active) {
          setLoadingPlans(false)
          setPhase(null)
        }
      }
    })()
    return () => {
      active = false
    }
  }, [partner, onPartnerChange])

  const pay = async (mode: PayMode) => {
    if (!partner?.accessToken) {
      setStatus(flash(false, 'Login partner first.'))
      return
    }
    if (!planId || !activeCycle) {
      setStatus(flash(false, 'Select a plan and billing cycle first.'))
      return
    }
    setPaying(true)
    try {
      toast.message('Refreshing partner session…')
      const active = await ensureFreshPartner(partner, onPartnerChange)
      setPhase('1/2 Creating order')
      setStatus({
        ok: true,
        text: `Creating payment order for ${selected?.planName} · ${activeCycle}…`,
      })
      toast.message('Creating order…')
      const order = await createPaymentOrder(active.accessToken, {
        module: 'membership',
        moduleData: {
          membershipPlanId: planId,
          billingCycleName: activeCycle,
          partnerName: active.fullname,
        },
        requireLiveGateway: mode === 'razorpay',
      })

      setPhase(mode === 'dummy' ? '2/2 Dummy pay' : '2/2 Razorpay checkout')
      setStatus({
        ok: true,
        text:
          mode === 'dummy'
            ? `Order ${order.orderId} · ₹${order.amount} — dummy pay…`
            : `Order ${order.orderId} · ₹${order.amount} — complete payment in Razorpay.`,
      })
      const verified = await fulfillHarnessPayment(active.accessToken, order, mode)
      setStatus(
        flash(
          true,
          `SUCCESS · ${mode === 'dummy' ? 'dummy ' : ''}paid (${verified.status}). Open ${verifyLabel} to confirm reflection.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setPaying(false)
      setPhase(null)
    }
  }

  const refreshReflection = async () => {
    setChecking(true)
    setCheckResult(null)
    toast.message('Checking reflection…')
    try {
      if (!adminToken) {
        const msg = 'Admin not logged in — expand Sessions and login admin, or Open screen.'
        setCheckResult(flash(false, msg))
        return
      }
      if (verifyHref.includes('memberships')) {
        const res = await fetchExpertSubscriptions({ page: 1, limit: 5 })
        const total = res?.data?.meta?.total ?? res?.data?.subscriptions?.length ?? 0
        setCheckResult(flash(true, `${total} subscription(s) on Memberships API.`))
        return
      }
      const res = await fetchFinanceRevenue({ limit: 5 })
      const rows = res?.data?.rows ?? []
      const total = res?.data?.meta?.total ?? rows.length
      const sample = rows
        .slice(0, 3)
        .map((r) => `${r.module} · ₹${r.amount} · ${r.status}`)
        .join(' | ')
      setCheckResult(flash(true, `${total} revenue row(s)${sample ? ` — ${sample}` : ' (empty)'}`))
    } catch (err) {
      setCheckResult(flash(false, errText(err)))
    } finally {
      setChecking(false)
    }
  }

  const priceForCycle = selected?.pricing?.find((p) => p.billingCycleName === activeCycle)

  return (
    <div className="space-y-4">
      <ActionBanner status={status} phase={phase || (paying ? 'Payment in progress' : null)} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void loadPlans()}
          disabled={!partner || loadingPlans}
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
        >
          {loadingPlans ? 'Loading plans…' : 'Reload plans'}
        </button>
        <a
          href="/memberships/plans"
          target="_blank"
          rel="noreferrer"
          onClick={() => toast.message('Opening membership plans…')}
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-violet-300 hover:bg-zinc-800"
        >
          Create plan in admin
        </a>
      </div>

      {!partner ? (
        <p className="text-sm text-amber-300">
          Login partner in Sessions above to load &amp; pay plans.
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const id = String(plan._id)
          const active = id === String(planId)
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPlanId(id)
                const nextCycle = plan.pricing?.[0]?.billingCycleName || null
                setCycle(nextCycle)
                setStatus(
                  flash(
                    true,
                    `Selected “${plan.planName}”${nextCycle ? ` · ${nextCycle}` : ''}. Then Pay.`,
                  ),
                )
              }}
              className={`rounded-xl border p-3 text-left transition active:scale-[0.98] ${
                active
                  ? 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400/40'
                  : 'border-zinc-700 bg-zinc-950/60 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-zinc-100">{plan.planName}</div>
                {active ? (
                  <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-medium text-zinc-950">
                    Selected
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">{plan.planId}</div>
              <div className="mt-2 space-y-0.5 text-xs text-zinc-400">
                {(plan.pricing || []).slice(0, 4).map((p) => (
                  <div key={p.billingCycleName}>
                    {p.billingCycleName}: ₹{p.finalPrice ?? p.price}
                    {p.discount ? ` (−${p.discount}%)` : ''}
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {selected ? (
        <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-sm text-zinc-300">
            Selected: <span className="font-medium text-white">{selected.planName}</span>
            <span className="ml-2 font-mono text-[11px] text-zinc-500">{String(selected._id)}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {cycles.map((name) => {
              const pricing = selected.pricing.find((p) => p.billingCycleName === name)
              const amount = pricing?.finalPrice ?? pricing?.price
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setCycle(name)
                    setStatus(
                      flash(true, `Billing cycle: ${name}${amount != null ? ` · ₹${amount}` : ''}`),
                    )
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs active:scale-95 ${
                    activeCycle === name
                      ? 'border-amber-400 bg-amber-400 text-zinc-950'
                      : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {name}
                  {amount != null ? ` · ₹${amount}` : ''}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!activeCycle || paying || !planId}
              onClick={() => void pay('dummy')}
              className="rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 active:scale-[0.99] disabled:opacity-40"
            >
              {paying
                ? phase || 'Processing…'
                : `Dummy pay${priceForCycle ? ` ₹${priceForCycle.finalPrice ?? priceForCycle.price}` : ''} (skip QR)`}
            </button>
            <button
              type="button"
              disabled={!activeCycle || paying || !planId}
              onClick={() => void pay('razorpay')}
              className="rounded-lg bg-[#528FF0] px-4 py-3 text-sm font-semibold text-white active:scale-[0.99] disabled:opacity-40"
            >
              {paying
                ? phase || 'Opening Razorpay…'
                : `Pay with Razorpay${priceForCycle ? ` · ₹${priceForCycle.finalPrice ?? priceForCycle.price}` : ''}`}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            Dummy skips checkout. Razorpay opens the official payment screen (test key).
          </p>
        </div>
      ) : plans.length ? (
        <p className="text-sm text-zinc-400">Tap a plan card to select it.</p>
      ) : null}

      <VerifyBar
        href={verifyHref}
        label={verifyLabel}
        onCheck={() => void refreshReflection()}
        checking={checking}
        checkResult={checkResult}
      />
    </div>
  )
}

/** Services: load offerings → tap Order+pay / consultation book */
function ServicesActions({
  partner,
  onPartnerChange,
  user,
}: {
  partner: PartnerLoginResult | null
  onPartnerChange?: (partner: PartnerLoginResult | null) => void
  user: StaticChatUser | null
}) {
  const [services, setServices] = useState<PartnerOffering[]>([])
  const [consultations, setConsultations] = useState<PartnerOffering[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(user && partner))
  const [busyId, setBusyId] = useState<string | null>(null)
  const [payMode, setPayMode] = useState<PayMode>('razorpay')
  const [status, setStatus] = useState<StatusMsg>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<StatusMsg>(null)
  const adminToken = useAuthStore((s) => s.token)
  const payLabel = payMode === 'dummy' ? 'LIVE dummy pay' : 'Pay with Razorpay'

  const load = async () => {
    if (!user || !partner) {
      setStatus(flash(false, 'Need partner + user logged in.'))
      return
    }
    setLoading(true)
    setStatus({ ok: true, text: 'Loading offerings…' })
    toast.message('Loading offerings…')
    try {
      const data = await listPartnerOfferings(user.accessToken, String(partner.id))
      setServices(data.services || [])
      setConsultations(data.consultations || [])
      setStatus(
        flash(
          true,
          `Loaded ${(data.services || []).length} services · ${(data.consultations || []).length} consultations`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.accessToken || !partner?.id) return
    const token = user.accessToken
    const partnerId = String(partner.id)
    let active = true
    void (async () => {
      try {
        const data = await listPartnerOfferings(token, partnerId)
        if (!active) return
        setServices(data.services || [])
        setConsultations(data.consultations || [])
        setStatus(
          flash(
            true,
            `Loaded ${(data.services || []).length} services · ${(data.consultations || []).length} consultations`,
          ),
        )
      } catch (err) {
        if (!active) return
        setStatus(flash(false, errText(err)))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [user?.id, user?.accessToken, partner?.id])

  const selectedService = services.find((s) => s._id === selectedServiceId) || null
  const serviceTiers = selectedService?.tiers || []
  const servicePrice =
    selectedService?.pricingType === 'tiered'
      ? serviceTiers.find((t) => t.name === selectedTier)?.price
      : (selectedService?.fixedPrice ?? selectedService?.budget?.min ?? null)

  const createServiceOrderForItem = async (item: PartnerOffering) => {
    if (item.pricingType === 'fixed') {
      return createServiceOrder(user!.accessToken, {
        serviceId: item._id,
        username: user!.username,
        phone_e164: user!.phone_e164,
      })
    }
    const tierName = (selectedTier || item.tiers?.[0]?.name || 'standard') as
      | 'basic'
      | 'standard'
      | 'premium'
    return createServiceOrder(user!.accessToken, {
      serviceId: item._id,
      tierName,
      username: user!.username,
      phone_e164: user!.phone_e164,
    })
  }

  const selectService = (item: PartnerOffering) => {
    setSelectedServiceId(item._id)
    const firstTier = item.tiers?.[0]?.name || null
    setSelectedTier(item.pricingType === 'tiered' ? firstTier : null)
    const price =
      item.pricingType === 'tiered' ? item.tiers?.[0]?.price : (item.fixedPrice ?? item.budget?.min)
    setStatus(
      flash(
        true,
        item.pricingType === 'custom' || !item.pricingType
          ? `Selected “${item.title}” — custom. Pay runs quotation → escrow (one-time).`
          : `Selected “${item.title}”${price != null ? ` · ₹${price}` : ''}. Dummy or Razorpay.`,
      ),
    )
  }

  /** LIVE finance: create listing order → payment-service order → dummy or Razorpay verify. */
  const orderAndPay = async (mode: PayMode = payMode) => {
    const item = selectedService
    if (!user || !item) {
      setStatus(flash(false, 'Select a service card first.'))
      return
    }
    if (item.pricingType !== 'fixed' && item.pricingType !== 'tiered') {
      await seedEscrow('one_time', item, mode)
      return
    }
    setBusyId(item._id)
    setStatus({ ok: true, text: `Ordering “${item.title}”…` })
    toast.message(`Ordering ${item.title}…`)
    try {
      if (item.pricingType === 'tiered' && !selectedTier) {
        setStatus(flash(false, 'Select a tier (basic / standard / premium) first.'))
        return
      }
      const listingOrder = await createServiceOrderForItem(item)
      setStatus({
        ok: true,
        text: `Service order ${listingOrder._id} · creating payment-service order…`,
      })
      toast.message('Creating payment order…')
      const payOrder = await createPaymentOrder(user.accessToken, {
        module: 'service',
        moduleData: {
          kind: 'service_order',
          serviceOrderId: listingOrder._id,
        },
        requireLiveGateway: mode === 'razorpay',
      })
      setStatus({
        ok: true,
        text: `Payment ${payOrder.orderId} · ₹${payOrder.amount} — ${
          mode === 'dummy' ? 'dummy pay' : 'complete in Razorpay'
        }.`,
      })
      const verified = await fulfillHarnessPayment(user.accessToken, payOrder, mode)
      setStatus(
        flash(
          true,
          `SUCCESS · LIVE paid (${verified.status}) · ${payOrder.orderId}. Open Services.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setBusyId(null)
    }
  }

  const bookConsultation = async (item: PartnerOffering) => {
    if (!user || !partner) return
    setBusyId(item._id)
    setStatus({ ok: true, text: `Booking “${item.title}”…` })
    toast.message(`Booking ${item.title}…`)
    try {
      const activePartner = await ensureFreshPartner(partner, onPartnerChange)
      await testSetupConsultationBooking(activePartner.accessToken, item._id)
      const duration = item.pricingOptions?.[0]?.durationMinutes || 30
      const date = new Date().toISOString().slice(0, 10)
      const slotsPayload = await getConsultationSlots(user.accessToken, item._id, {
        date,
        durationMinutes: duration,
      })
      const slot = slotsPayload.slots?.[0]
      if (!slot) {
        setStatus(flash(false, 'No slots today — set partner availability and retry.'))
        return
      }
      const booking = await createConsultationBooking(user.accessToken, {
        consultationId: item._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        durationMinutes: slot.durationMinutes,
      })
      setStatus({
        ok: true,
        text: `Booking ${booking._id} · creating payment-service order…`,
      })
      toast.message('Creating payment order…')
      const payOrder = await createPaymentOrder(user.accessToken, {
        module: 'consultation',
        moduleData: {
          kind: 'consultation_booking',
          bookingId: booking._id,
        },
        requireLiveGateway: payMode === 'razorpay',
      })
      setStatus({
        ok: true,
        text: `Payment ${payOrder.orderId} · ₹${payOrder.amount} — ${
          payMode === 'dummy' ? 'dummy pay' : 'complete in Razorpay'
        }.`,
      })
      const verified = await fulfillHarnessPayment(user.accessToken, payOrder, payMode)
      setStatus(
        flash(
          true,
          `SUCCESS · LIVE paid (${verified.status}) · ${payOrder.orderId}. Open Services.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setBusyId(null)
    }
  }

  /**
   * Escrow LIVE seed: quotation → proposal (one_time|milestone) → send → accept →
   * payment-service create + dummy/Razorpay (kind: payment_request). Do not use listing /pay.
   */
  const seedEscrow = async (
    paymentType: 'one_time' | 'milestone',
    offeringOverride?: PartnerOffering,
    mode: PayMode = payMode,
  ) => {
    if (!user || !partner) {
      setStatus(flash(false, 'Need partner + user logged in.'))
      return
    }
    const offering =
      offeringOverride ||
      (selectedService && (selectedService.pricingType === 'custom' || !selectedService.pricingType)
        ? selectedService
        : null) ||
      services.find((s) => s.pricingType === 'custom' || !s.pricingType) ||
      services[0]
    if (!offering) {
      setStatus(flash(false, 'No service listing — create/approve one for this partner first.'))
      return
    }

    const busyKey = `escrow-${paymentType}`
    setBusyId(busyKey)
    setStatus({
      ok: true,
      text: `Escrow seed (${paymentType}) on “${offering.title}”…`,
    })
    toast.message(`Escrow ${paymentType}: refreshing partner session…`)

    try {
      // Partner sessions are single-device; refresh so proposal APIs don't 401.
      let activePartner = partner
      try {
        activePartner = await refreshPartnerFromStoredCreds()
        onPartnerChange?.(activePartner)
      } catch (refreshErr) {
        // Fall through with existing token; clearer error if it fails later.
        if (!partner.accessToken) throw refreshErr
      }

      toast.message(`Escrow ${paymentType}: quotation…`)
      const quotation = await createQuotationRequest(user.accessToken, {
        type: 'service',
        serviceOrConsultationId: offering._id,
        partnerId: String(activePartner.id),
        partnerName: activePartner.fullname || undefined,
        title: `Harness escrow · ${offering.title}`,
        category: 'General',
        description: 'Payment-finance harness escrow seed (custom/milestone hold).',
        budget: { min: 3000, max: 8000 },
        duration: '1-2 weeks',
        username: user.username,
        phone_e164: user.phone_e164,
      })

      setStatus({ ok: true, text: `Quotation ${quotation._id} · drafting proposal…` })
      toast.message('Drafting proposal…')

      const validTill = new Date()
      validTill.setDate(validTill.getDate() + 14)

      const proposalBody =
        paymentType === 'one_time'
          ? {
              quotationRequestId: quotation._id,
              deliverables: 'Harness escrow deliverables (one-time).',
              paymentType: 'one_time' as const,
              totalPrice: 5000,
              timeline: { value: 7, unit: 'days' as const },
              validTill: validTill.toISOString(),
              title: quotation.title,
              category: quotation.category,
            }
          : {
              quotationRequestId: quotation._id,
              deliverables: 'Harness escrow deliverables (milestone).',
              paymentType: 'milestone' as const,
              milestones: [
                {
                  title: 'Milestone 1',
                  description: 'First escrow tranche',
                  price: 3500,
                  timeline: { value: 5, unit: 'days' as const },
                },
              ],
              validTill: validTill.toISOString(),
              title: quotation.title,
              category: quotation.category,
            }

      const proposal = await upsertProposal(activePartner.accessToken, proposalBody)
      setStatus({ ok: true, text: `Proposal ${proposal._id} · sending…` })
      toast.message('Sending proposal…')
      await sendProposal(activePartner.accessToken, proposal._id)

      setStatus({ ok: true, text: `Accepting proposal…` })
      toast.message('User accepting…')
      const accepted = await acceptProposal(user.accessToken, proposal._id)
      let paymentRequest = accepted.paymentRequest
      if (!paymentRequest?._id) {
        paymentRequest = await createPaymentRequest(
          activePartner.accessToken,
          proposal._id,
          paymentType === 'milestone' ? { milestoneIndex: 0 } : {},
        )
      }
      if (!paymentRequest?._id) {
        setStatus(
          flash(false, 'No payment request after accept — try Partner send payment request.'),
        )
        return
      }

      setStatus({
        ok: true,
        text: `PR ${paymentRequest._id} · creating payment-service order…`,
      })
      toast.message('Creating payment order…')
      const payOrder = await createPaymentOrder(user.accessToken, {
        module: 'service',
        moduleData: {
          kind: 'payment_request',
          paymentRequestId: paymentRequest._id,
        },
        requireLiveGateway: mode === 'razorpay',
      })
      setStatus({
        ok: true,
        text: `Payment ${payOrder.orderId} · ₹${payOrder.amount} — ${
          mode === 'dummy' ? 'dummy pay' : 'complete in Razorpay'
        }.`,
      })
      const verified = await fulfillHarnessPayment(user.accessToken, payOrder, mode)
      setStatus(
        flash(
          true,
          `SUCCESS · escrow LIVE (${paymentType}, ${verified.status}) · ${payOrder.orderId}. Open Escrow / Services escrow tab.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setBusyId(null)
    }
  }

  const refreshReflection = async () => {
    setChecking(true)
    setCheckResult(null)
    toast.message('Checking reflection…')
    try {
      if (!adminToken) {
        setCheckResult(flash(false, 'Admin not logged in — Open Services screen instead.'))
        return
      }
      const [svc, consult, escrow] = await Promise.all([
        fetchFinanceRevenue({ module: 'service', limit: 5 }),
        fetchFinanceRevenue({ module: 'consultation', limit: 5 }),
        fetchFinanceEscrow({ limit: 5 }),
      ])
      const st = svc?.data?.meta?.total ?? 0
      const ct = consult?.data?.meta?.total ?? 0
      const et = escrow?.data?.meta?.total ?? escrow?.data?.rows?.length ?? 0
      setCheckResult(flash(true, `Service: ${st} · Consultation: ${ct} · Escrow: ${et}`))
    } catch (err) {
      setCheckResult(flash(false, errText(err)))
    } finally {
      setChecking(false)
    }
  }

  const escrowBusy = busyId === 'escrow-one_time' || busyId === 'escrow-milestone'

  return (
    <div className="space-y-4">
      <ActionBanner
        status={status}
        phase={
          escrowBusy
            ? 'Seeding escrow'
            : busyId
              ? 'Working on offering'
              : loading
                ? 'Loading'
                : null
        }
      />
      <button
        type="button"
        onClick={() => void load()}
        disabled={!partner || !user || loading}
        className="rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
      >
        {loading ? 'Loading offerings…' : 'Load partner offerings'}
      </button>

      <PayModeToggle mode={payMode} onChange={setPayMode} disabled={!!busyId} />

      <div>
        <h4 className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">
          Escrow — quotation → proposal → LIVE pay
        </h4>
        <p className="mb-2 text-xs text-zinc-500">
          Uses a partner service (prefers custom). Creates payment_request via payment-service —
          then official Razorpay checkout (same as membership). Check /finance/escrow and Services →
          Escrow tab.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!partner || !user || !!busyId || !services.length}
            onClick={() => void seedEscrow('one_time')}
            className="rounded-xl border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100 hover:border-amber-500/60 disabled:opacity-40"
          >
            {busyId === 'escrow-one_time' ? 'Working…' : 'Seed escrow (one-time / custom)'}
          </button>
          <button
            type="button"
            disabled={!partner || !user || !!busyId || !services.length}
            onClick={() => void seedEscrow('milestone')}
            className="rounded-xl border border-orange-700/60 bg-orange-950/40 px-3 py-2 text-sm text-orange-100 hover:border-orange-500/60 disabled:opacity-40"
          >
            {busyId === 'escrow-milestone' ? 'Working…' : 'Seed escrow (milestone)'}
          </button>
        </div>
        {!services.length ? (
          <p className="mt-2 text-xs text-zinc-500">
            Load offerings first — need at least one service listing.
          </p>
        ) : null}
      </div>

      <div>
        <h4 className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">
          Services — pick listing / tier, then pay (not a free amount)
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => {
            const tierPrices = (s.tiers || []).map((t) => Number(t.price)).filter((n) => n > 0)
            const priceLabel =
              s.pricingType === 'tiered' && tierPrices.length
                ? `₹${Math.min(...tierPrices)}–₹${Math.max(...tierPrices)}`
                : s.fixedPrice != null
                  ? `₹${s.fixedPrice}`
                  : s.budget?.min
                    ? `₹${s.budget.min}`
                    : '—'
            return (
              <button
                key={s._id}
                type="button"
                disabled={!!busyId}
                onClick={() => selectService(s)}
                className={`rounded-xl border p-3 text-left disabled:opacity-50 ${
                  selectedServiceId === s._id
                    ? 'border-sky-400 bg-sky-400/10'
                    : 'border-zinc-700 bg-zinc-950/60 hover:border-sky-500/50'
                }`}
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-zinc-500">
                  {s.pricingType || 'custom'} · {s.status} · {priceLabel}
                </div>
                <div className="mt-2 text-xs text-sky-300">
                  {selectedServiceId === s._id ? 'Selected' : 'Tap to select'}
                </div>
              </button>
            )
          })}
          {!services.length ? (
            <p className="text-xs text-zinc-500">
              No services — create/approve a listing for this partner.
            </p>
          ) : null}
        </div>
        {selectedService ? (
          <div className="mt-3 space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-3">
            <p className="text-sm text-zinc-300">
              Selected: <span className="font-medium text-white">{selectedService.title}</span>
              {servicePrice != null ? (
                <span className="ml-2 text-zinc-400">· ₹{servicePrice}</span>
              ) : null}
            </p>
            {selectedService.pricingType === 'tiered' && serviceTiers.length ? (
              <div className="flex flex-wrap gap-2">
                {serviceTiers.map((tier) => (
                  <button
                    key={tier.name}
                    type="button"
                    disabled={!!busyId}
                    onClick={() => {
                      setSelectedTier(tier.name)
                      setStatus(flash(true, `Tier: ${tier.name} · ₹${tier.price}`))
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs active:scale-95 ${
                      selectedTier === tier.name
                        ? 'border-amber-400 bg-amber-400 text-zinc-950'
                        : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {tier.name} · ₹{tier.price}
                  </button>
                ))}
              </div>
            ) : null}
            {selectedService.pricingType === 'custom' || !selectedService.pricingType ? (
              <p className="text-xs text-amber-200">
                Custom — pay runs quotation → one-time escrow (₹5000).
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!!busyId || (selectedService.pricingType === 'tiered' && !selectedTier)}
                onClick={() => void orderAndPay('dummy')}
                className="rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-40"
              >
                {busyId === selectedService._id || busyId === 'escrow-one_time'
                  ? 'Working…'
                  : `Dummy pay${servicePrice != null ? ` ₹${servicePrice}` : ''} (skip QR)`}
              </button>
              <button
                type="button"
                disabled={!!busyId || (selectedService.pricingType === 'tiered' && !selectedTier)}
                onClick={() => void orderAndPay('razorpay')}
                className="rounded-lg bg-[#528FF0] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {busyId === selectedService._id || busyId === 'escrow-one_time'
                  ? 'Opening Razorpay…'
                  : `Pay with Razorpay${servicePrice != null ? ` · ₹${servicePrice}` : ''}`}
              </button>
            </div>
          </div>
        ) : services.length ? (
          <p className="mt-2 text-sm text-zinc-400">
            Tap a service card, then pay with listing price.
          </p>
        ) : null}
      </div>

      <div>
        <h4 className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">
          Consultations — book + LIVE pay (payment-service)
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {consultations.map((c) => (
            <button
              key={c._id}
              type="button"
              disabled={!!busyId}
              onClick={() => void bookConsultation(c)}
              className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 text-left hover:border-violet-500/50 disabled:opacity-50"
            >
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-zinc-500">
                {c.mode || '—'} · {c.status}
              </div>
              <div className="mt-2 text-xs text-violet-300">
                {busyId === c._id ? 'Working…' : `Book + ${payLabel}`}
              </div>
            </button>
          ))}
          {!consultations.length ? (
            <p className="text-xs text-zinc-500">No consultations for this partner.</p>
          ) : null}
        </div>
      </div>

      <VerifyBar
        href="/finance/services"
        label="Services"
        onCheck={() => void refreshReflection()}
        checking={checking}
        checkResult={checkResult}
      />
      <a
        href="/finance/escrow"
        target="_blank"
        rel="noreferrer"
        onClick={() => toast.message('Opening Escrow…')}
        className="inline-block text-sm text-sky-300 hover:underline"
      >
        Also open Escrow →
      </a>
    </div>
  )
}

/** Venues: admin catalog → user LIVE dummy/Razorpay pay → /finance/venues */
function VenuesActions({ user }: { user: StaticChatUser | null }) {
  const adminToken = useAuthStore((s) => s.token)
  const [venues, setVenues] = useState<HarnessVenue[]>([])
  const [loading, setLoading] = useState(Boolean(adminToken))
  const [busyId, setBusyId] = useState<string | null>(null)
  const [payMode, setPayMode] = useState<PayMode>('razorpay')
  const [amount, setAmount] = useState('2500')
  const [status, setStatus] = useState<StatusMsg>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<StatusMsg>(null)
  const payLabel = payMode === 'dummy' ? 'LIVE dummy pay' : 'Pay with Razorpay'

  const load = async () => {
    if (!adminToken) {
      setStatus(flash(false, 'Login admin in the session bar first (needed to list venues).'))
      return
    }
    setLoading(true)
    setStatus({ ok: true, text: 'Loading venues…' })
    toast.message('Loading venues…')
    try {
      const rows = await listAdminVenuesForHarness(20)
      setVenues(rows)
      setStatus(flash(true, `Loaded ${rows.length} venue(s) from catalog.`))
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminToken) return
    let active = true
    void (async () => {
      try {
        const rows = await listAdminVenuesForHarness(20)
        if (!active) return
        setVenues(rows)
        setStatus(flash(true, `Loaded ${rows.length} venue(s) from catalog.`))
      } catch (err) {
        if (!active) return
        setStatus(flash(false, errText(err)))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [adminToken])

  const payVenue = async (venue: HarnessVenue) => {
    if (!user?.accessToken) {
      setStatus(flash(false, 'Select a User in the session bar first.'))
      return
    }
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt < 1) {
      setStatus(flash(false, 'Enter a valid amount (≥ 1).'))
      return
    }
    setBusyId(venue.id)
    try {
      setStatus({ ok: true, text: `Creating venue payment for “${venue.name}”…` })
      toast.message('Creating payment order…')
      const payOrder = await createPaymentOrder(user.accessToken, {
        module: 'venue',
        moduleData: {
          kind: 'venue_booking',
          venueId: venue.id,
          amount: amt,
          title: venue.name,
          userName: user.username || user.id,
          clientName: user.username || user.id,
        },
        requireLiveGateway: payMode === 'razorpay',
      })
      setStatus({
        ok: true,
        text: `Payment ${payOrder.orderId} · ₹${payOrder.amount} — ${
          payMode === 'dummy' ? 'dummy pay' : 'complete in Razorpay'
        }.`,
      })
      const verified = await fulfillHarnessPayment(user.accessToken, payOrder, payMode)
      setStatus(
        flash(
          true,
          `SUCCESS · LIVE paid (${verified.status}) · ${payOrder.orderId}. Open Finance Venues.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setBusyId(null)
    }
  }

  const refreshReflection = async () => {
    setChecking(true)
    setCheckResult(null)
    toast.message('Checking venue payments…')
    try {
      if (!adminToken) {
        setCheckResult(flash(false, 'Admin not logged in — Open Finance Venues instead.'))
        return
      }
      const res = await fetchFinanceRevenue({ module: 'venue', limit: 5 })
      const t = res?.data?.meta?.total ?? res?.data?.rows?.length ?? 0
      setCheckResult(flash(true, `${t} venue payment row(s)`))
    } catch (err) {
      setCheckResult(flash(false, errText(err)))
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <ActionBanner status={status} phase={busyId ? 'Paying venue' : loading ? 'Loading' : null} />
      <p className="text-sm text-zinc-400">
        Catalog = <code className="text-zinc-300">/venues/management</code>. This pay writes{' '}
        <code className="text-zinc-300">module=venue</code> into payment-service →{' '}
        <code className="text-zinc-300">/finance/venues</code>.
      </p>
      <PayModeToggle mode={payMode} onChange={setPayMode} disabled={!!busyId} />
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-zinc-500">
          Amount (INR)
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-28 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-white"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={!adminToken || loading}
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
        >
          {loading ? 'Loading…' : 'Load venues'}
        </button>
        <a
          href="/venues/management/create"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950"
        >
          Create venue
        </a>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {venues.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={!!busyId || !user}
            onClick={() => void payVenue(v)}
            className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 text-left hover:border-emerald-500/50 disabled:opacity-50"
          >
            <div className="font-medium">{v.name}</div>
            <div className="text-xs text-zinc-500">{v.status}</div>
            <div className="mt-2 text-xs text-emerald-300">
              {busyId === v.id ? 'Working…' : `Book + ${payLabel} · ₹${amount || '—'}`}
            </div>
          </button>
        ))}
        {!venues.length ? (
          <p className="text-xs text-zinc-500">
            No venues — login admin, create a venue, then Load venues.
          </p>
        ) : null}
      </div>

      <VerifyBar
        href="/finance/venues"
        label="Finance Venues"
        onCheck={() => void refreshReflection()}
        checking={checking}
        checkResult={checkResult}
      />
    </div>
  )
}

/** Tax / Reconciliation: backfill from fulfilled payments, then verify admin screens. */
function TaxReconActions({
  verifyHref,
  verifyLabel,
  check,
}: {
  verifyHref: string
  verifyLabel: string
  check: () => Promise<string>
}) {
  const adminToken = useAuthStore((s) => s.token)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<StatusMsg>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<StatusMsg>(null)

  const runBackfill = async () => {
    if (!adminToken) {
      setStatus(flash(false, 'Login Admin in the session bar first.'))
      return
    }
    setBusy(true)
    setStatus({ ok: true, text: 'Backfilling tax + reconciliation from fulfilled payments…' })
    toast.message('Backfilling finance artifacts…')
    try {
      const res = await backfillFinanceArtifacts({ limit: 25 })
      const results = res?.data?.results ?? []
      const created = results.filter((r) => !r.skipped)
      const taxTotal = created.reduce((sum, r) => sum + (r.taxRecordsCreated ?? 0), 0)
      const reconTotal = created.filter((r) => r.reconciliationId).length
      setStatus(
        flash(
          true,
          `Backfill done · ${created.length} payment(s) updated · ${taxTotal} tax row(s) · ${reconTotal} recon row(s). Open ${verifyLabel}.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setBusy(false)
    }
  }

  const refreshReflection = async () => {
    setChecking(true)
    setCheckResult(null)
    try {
      if (!adminToken) {
        setCheckResult(flash(false, 'Admin not logged in.'))
        return
      }
      const text = await check()
      setCheckResult(flash(true, text))
    } catch (err) {
      setCheckResult(flash(false, errText(err)))
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <ActionBanner status={status || checkResult} phase={busy ? 'Backfilling' : checking ? 'Checking' : null} />
      <p className="text-sm text-zinc-400">
        New pays auto-create tax + reconciliation on fulfill. For older fulfilled payments, run
        backfill (admin JWT). Seed a pay on Revenue/Services/Memberships first if lists are empty.
      </p>
      <button
        type="button"
        disabled={!adminToken || busy}
        onClick={() => void runBackfill()}
        className="rounded-lg bg-violet-400 px-4 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-40"
      >
        {busy ? 'Backfilling…' : 'Backfill tax + reconciliation (last 25 fulfilled pays)'}
      </button>
      <VerifyBar
        href={verifyHref}
        label={verifyLabel}
        onCheck={() => void refreshReflection()}
        checking={checking}
        checkResult={checkResult}
      />
    </div>
  )
}

function SimpleOpenAndCheck({
  href,
  label,
  check,
}: {
  href: string
  label: string
  check: () => Promise<string>
}) {
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<StatusMsg>(null)
  const adminToken = useAuthStore((s) => s.token)

  return (
    <div className="space-y-3">
      <ActionBanner status={checkResult} phase={checking ? 'Checking reflection' : null} />
      <p className="text-sm text-zinc-400">
        No chat seed for this model — open the screen and refresh the LIVE count.
      </p>
      <VerifyBar
        href={href}
        label={label}
        checking={checking}
        checkResult={checkResult}
        onCheck={() => {
          void (async () => {
            setChecking(true)
            setCheckResult(null)
            try {
              if (!adminToken) {
                setCheckResult(flash(false, 'Admin not logged in.'))
                return
              }
              const text = await check()
              setCheckResult(flash(true, text))
            } catch (err) {
              setCheckResult(flash(false, errText(err)))
            } finally {
              setChecking(false)
            }
          })()
        }}
      />
    </div>
  )
}

/** Refunds: stuck service/venue payment (paid · fulfill pending) → refund or chargeback. */
function RefundsActions() {
  const adminToken = useAuthStore((s) => s.token)
  const [busy, setBusy] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusMsg>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<StatusMsg>(null)

  const seed = async (mode: 'refund_request' | 'chargeback', module: 'service' | 'venue') => {
    if (!adminToken) {
      setStatus(flash(false, 'Login Admin in the session bar first.'))
      return
    }
    const busyKey = `${module}:${mode}`
    setBusy(busyKey)
    setStatus({
      ok: true,
      text: `Creating stuck ${module} payment + ${mode}…`,
    })
    toast.message(`Stuck ${module} → ${mode}…`)
    try {
      const res = await seedFinanceRefundCase({ mode, module, paymentSource: 'mid_state' })
      const data = res?.data
      const pay = data?.payment
      const refund = data?.refund
      setStatus(
        flash(
          true,
          `SUCCESS · stuck ${pay?.module} · ${pay?.orderId} (paid / fulfill ${pay?.fulfillmentStatus}) · ${mode} · ${refund?.refundId} [${refund?.status}]. Open Refunds.`,
        ),
      )
    } catch (err) {
      setStatus(flash(false, errText(err)))
    } finally {
      setBusy(null)
    }
  }

  const refreshReflection = async () => {
    setChecking(true)
    setCheckResult(null)
    try {
      if (!adminToken) {
        setCheckResult(flash(false, 'Admin not logged in.'))
        return
      }
      const [refunds, disputes] = await Promise.all([
        fetchFinanceRefunds({ limit: 5 }),
        fetchFinanceDisputes({ limit: 5 }),
      ])
      const rt = refunds?.data?.meta?.total ?? refunds?.data?.rows?.length ?? 0
      const dt = disputes?.data?.meta?.total ?? disputes?.data?.rows?.length ?? 0
      setCheckResult(flash(true, `Refunds: ${rt} · Disputes: ${dt}`))
    } catch (err) {
      setCheckResult(flash(false, errText(err)))
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <ActionBanner status={status} phase={busy ? `Seeding ${busy}` : null} />
      <p className="text-sm text-zinc-400">
        Simulates a <span className="text-zinc-200">stuck</span> service/venue pay: money{' '}
        <code className="text-zinc-200">paid</code>, fulfill still{' '}
        <code className="text-zinc-200">pending</code> — then refund or chargeback. Does{' '}
        <span className="text-zinc-200">not</span> use fully completed LIVE pays.
      </p>

      <div>
        <h4 className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">
          Stuck service payment
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!adminToken || !!busy}
            onClick={() => void seed('refund_request', 'service')}
            className="rounded-xl border border-rose-700/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-100 hover:border-rose-500/60 disabled:opacity-40"
          >
            {busy === 'service:refund_request' ? 'Working…' : 'Stuck service → refund'}
          </button>
          <button
            type="button"
            disabled={!adminToken || !!busy}
            onClick={() => void seed('chargeback', 'service')}
            className="rounded-xl border border-orange-700/60 bg-orange-950/40 px-3 py-2 text-sm text-orange-100 hover:border-orange-500/60 disabled:opacity-40"
          >
            {busy === 'service:chargeback' ? 'Working…' : 'Stuck service → chargeback'}
          </button>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">Stuck venue payment</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!adminToken || !!busy}
            onClick={() => void seed('refund_request', 'venue')}
            className="rounded-xl border border-rose-700/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-100 hover:border-rose-500/60 disabled:opacity-40"
          >
            {busy === 'venue:refund_request' ? 'Working…' : 'Stuck venue → refund'}
          </button>
          <button
            type="button"
            disabled={!adminToken || !!busy}
            onClick={() => void seed('chargeback', 'venue')}
            className="rounded-xl border border-orange-700/60 bg-orange-950/40 px-3 py-2 text-sm text-orange-100 hover:border-orange-500/60 disabled:opacity-40"
          >
            {busy === 'venue:chargeback' ? 'Working…' : 'Stuck venue → chargeback'}
          </button>
        </div>
      </div>

      <VerifyBar
        href="/finance/refunds"
        label="Refunds"
        onCheck={() => void refreshReflection()}
        checking={checking}
        checkResult={checkResult}
      />
    </div>
  )
}

export function FinanceTestInteractiveActions({ model, partner, onPartnerChange, user }: Props) {
  if (model.id === 'revenue') {
    return (
      <MembershipPayActions
        partner={partner}
        onPartnerChange={onPartnerChange}
        verifyHref="/finance/revenue"
        verifyLabel="Revenue Overview"
      />
    )
  }

  if (model.id === 'memberships') {
    return (
      <MembershipPayActions
        partner={partner}
        onPartnerChange={onPartnerChange}
        verifyHref="/finance/memberships"
        verifyLabel="Memberships"
      />
    )
  }

  if (model.id === 'services') {
    return <ServicesActions partner={partner} onPartnerChange={onPartnerChange} user={user} />
  }

  if (model.id === 'payouts') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Payouts are created after a <span className="text-zinc-200">real</span> fixed/tiered
          payment fulfill (not membership). Seed a service order below, then open Payouts.
        </p>
        <ServicesActions partner={partner} onPartnerChange={onPartnerChange} user={user} />
        <SimpleOpenAndCheck
          href="/finance/payouts"
          label="Payouts"
          check={async () => {
            const res = await fetchFinancePayouts({ limit: 5 })
            const t = res?.data?.meta?.total ?? res?.data?.rows?.length ?? 0
            return `${t} payout(s)`
          }}
        />
      </div>
    )
  }

  if (model.id === 'invoices') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Pay a membership plan (real Razorpay) — invoice is created on fulfill.
        </p>
        <MembershipPayActions
          partner={partner}
          onPartnerChange={onPartnerChange}
          verifyHref="/finance/invoices"
          verifyLabel="Invoices"
        />
      </div>
    )
  }

  if (model.id === 'venues') {
    return <VenuesActions user={user} />
  }

  if (model.id === 'refunds') {
    return <RefundsActions />
  }

  if (model.id === 'tax') {
    return (
      <TaxReconActions
        verifyHref="/finance/tax"
        verifyLabel="Tax & Compliance"
        check={async () => {
          const res = await fetchFinanceTax({ limit: 5 })
          const t = res?.data?.meta?.total ?? res?.data?.rows?.length ?? 0
          return `${t} tax record(s)`
        }}
      />
    )
  }

  if (model.id === 'reconciliation') {
    return (
      <TaxReconActions
        verifyHref="/finance/reconciliation"
        verifyLabel="Reconciliation"
        check={async () => {
          const res = await fetchFinanceReconciliation({ limit: 5 })
          const t = res?.data?.meta?.total ?? res?.data?.rows?.length ?? 0
          return `${t} recon row(s)`
        }}
      />
    )
  }

  if (model.id === 'categories') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">MOCK screen — open and confirm the table UI.</p>
        <a
          href="/finance/categories"
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          Open Category Management
        </a>
      </div>
    )
  }

  return null
}
