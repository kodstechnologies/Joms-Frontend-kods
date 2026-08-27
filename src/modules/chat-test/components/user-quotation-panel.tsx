import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  acceptProposal,
  approveMilestone,
  approveProposalWork,
  createQuotationRequest,
  getProposalWork,
  getQuotationDetail,
  listMyQuotations,
  listPartnerOfferings,
  rejectProposal,
  type PartnerOffering,
  type PaymentRequest,
  type Proposal,
  type QuotationRequest,
} from '../api/quotation.api'
import {
  approveServiceOrder,
  createServiceOrder,
  listMyServiceOrders,
  type ServiceOrder,
} from '../api/service-order.api'
import {
  listMyConsultationBookings,
  type ConsultationBooking,
} from '../api/consultation-booking.api'
import {
  payConsultationBookingWithRazorpay,
  payPaymentRequestWithRazorpay,
  payServiceOrderWithRazorpay,
} from '../lib/harness-payment'
import {
  listEligibleReviews,
  submitPartnerReview,
  type EligibleReviewItem,
} from '../api/profile-review.api'
import { UserConsultationBookPanel } from './user-consultation-book-panel'
import type { StaticChatUser } from '../config/static-users'

type Props = {
  user: StaticChatUser
  /** Prefill partner id (e.g. from finance testing harness) */
  defaultPartnerId?: string
  defaultPartnerName?: string
}

type QuotationRow = QuotationRequest & {
  proposal?: Proposal | null
  openPaymentRequest?: PaymentRequest | null
}

type RequestForm = {
  title: string
  category: string
  description: string
  budgetMin: string
  budgetMax: string
  duration: string
  username: string
  phone_e164: string
}

function emptyForm(user: StaticChatUser): RequestForm {
  return {
    title: '',
    category: '',
    description: '',
    budgetMin: '0',
    budgetMax: '0',
    duration: '',
    username: user.username,
    phone_e164: user.phone_e164,
  }
}

function formFromOffering(item: PartnerOffering, user: StaticChatUser): RequestForm {
  return {
    title: item.title || '',
    category: item.category || '',
    description: item.description || '',
    budgetMin: String(item.budget?.min ?? 0),
    budgetMax: String(item.budget?.max ?? 0),
    duration: item.duration || '',
    username: user.username,
    phone_e164: user.phone_e164,
  }
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

function formatBudget(budget?: { min: number; max: number }) {
  if (!budget) return '—'
  if (budget.min === budget.max) return `₹${budget.min}`
  return `₹${budget.min}–₹${budget.max}`
}

function OfferingCard({
  item,
  selected,
  onSelect,
}: {
  item: PartnerOffering
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
        selected
          ? 'border-sky-400 bg-sky-400/10'
          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{item.title}</div>
        <span className="shrink-0 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] tracking-wide text-zinc-400 uppercase">
          {item.type}
        </span>
      </div>
      <div className="mt-1 text-xs text-zinc-500">
        {item.category || '—'} · {formatBudget(item.budget)} · {item.duration}
      </div>
      {item.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.description}</p>
      ) : null}
      <div className="mt-1 text-[10px] text-zinc-600">status {item.status}</div>
    </button>
  )
}

function proposalNeedsPayment(proposal: Proposal | null | undefined): boolean {
  if (!proposal || proposal.status !== 'accepted') return false
  if (proposal.paymentType === 'one_time') return !proposal.workStatus
  return (proposal.milestones || []).some((m) => m.status === 'payment_pending')
}

function pickOpenPaymentRequest(paymentRequests: PaymentRequest[]): PaymentRequest | null {
  return paymentRequests.find((p) => p.status === 'sent') || null
}

export function UserQuotationPanel({ user }: Props) {
  const [partnerId, setPartnerId] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [services, setServices] = useState<PartnerOffering[]>([])
  const [consultations, setConsultations] = useState<PartnerOffering[]>([])
  const [selected, setSelected] = useState<PartnerOffering | null>(null)
  const [form, setForm] = useState<RequestForm>(() => emptyForm(user))
  const [offeringsLoaded, setOfferingsLoaded] = useState(false)
  const [mine, setMine] = useState<QuotationRow[]>([])
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>([])
  const [eligibleReviews, setEligibleReviews] = useState<EligibleReviewItem[]>([])
  const [reviewDrafts, setReviewDrafts] = useState<
    Record<string, { rating: number; text: string }>
  >({})
  const [tierName, setTierName] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingOfferings, setLoadingOfferings] = useState(false)

  const allOfferings = useMemo(() => [...services, ...consultations], [services, consultations])

  const isDirectOrder =
    selected?.type === 'service' &&
    (selected.pricingType === 'fixed' || selected.pricingType === 'tiered')

  const refresh = async () => {
    const [list, orderList, bookings, eligible] = await Promise.all([
      listMyQuotations(user.accessToken),
      listMyServiceOrders(user.accessToken),
      listMyConsultationBookings(user.accessToken),
      listEligibleReviews(user.accessToken).catch(() => [] as EligibleReviewItem[]),
    ])
    setOrders(orderList)
    setConsultationBookings(bookings)
    setEligibleReviews(eligible)
    const enriched = await Promise.all(
      list.map(async (q) => {
        try {
          const detail = await getQuotationDetail(user.accessToken, q._id)
          const proposal = detail.proposal
          let openPaymentRequest: PaymentRequest | null = detail.openPaymentRequest || null

          if (!openPaymentRequest && proposal?._id && proposalNeedsPayment(proposal)) {
            try {
              const work = await getProposalWork(user.accessToken, proposal._id)
              openPaymentRequest = pickOpenPaymentRequest(work.paymentRequests)
            } catch {
              openPaymentRequest = null
            }
          }

          return { ...q, proposal, openPaymentRequest }
        } catch {
          return { ...q, proposal: null, openPaymentRequest: null }
        }
      }),
    )
    setMine(enriched)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate user quotations from API
    void refresh().catch((err) => setError(errMessage(err)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when selected user/token changes
  }, [user.id, user.accessToken])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep request form contact fields in sync with selected user
    setForm((prev) => ({
      ...prev,
      username: user.username,
      phone_e164: user.phone_e164,
    }))
  }, [user.id, user.username, user.phone_e164])

  const loadOfferings = async () => {
    const id = partnerId.trim()
    if (!id) {
      setError('Enter a partner id first')
      return
    }
    setLoadingOfferings(true)
    setError(null)
    setOk(null)
    setSelected(null)
    setForm(emptyForm(user))
    try {
      const data = await listPartnerOfferings(user.accessToken, id)
      setServices(data.services || [])
      setConsultations(data.consultations || [])
      setOfferingsLoaded(true)
      setOk(
        `Loaded ${(data.services || []).length} services · ${(data.consultations || []).length} consultations`,
      )
    } catch (err) {
      setOfferingsLoaded(false)
      setServices([])
      setConsultations([])
      setError(errMessage(err))
    } finally {
      setLoadingOfferings(false)
    }
  }

  const selectOffering = (item: PartnerOffering) => {
    setSelected(item)
    setForm(formFromOffering(item, user))
    setError(null)
    setOk(null)
  }

  const patchForm = <K extends keyof RequestForm>(key: K, value: RequestForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    if (!selected) {
      setError('Select a service or consultation')
      return
    }
    const min = Number(form.budgetMin)
    const max = Number(form.budgetMax)
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0) {
      setError('Budget min/max must be valid non-negative numbers')
      return
    }
    if (max < min) {
      setError('Budget max must be >= budget min')
      return
    }
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.category.trim()) {
      setError('Category is required')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    if (!form.duration.trim()) {
      setError('Duration is required')
      return
    }

    setLoading(true)
    setError(null)
    setOk(null)
    try {
      const q = await createQuotationRequest(user.accessToken, {
        type: selected.type,
        serviceOrConsultationId: selected._id,
        partnerId: partnerId.trim() || undefined,
        partnerName: partnerName.trim() || undefined,
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        budget: { min, max },
        duration: form.duration.trim(),
        username: form.username.trim() || user.username,
        phone_e164: form.phone_e164.trim(),
      })
      setOk(`Quotation created: ${q._id} · ${q.title}`)
      await refresh()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDirectOrder = async () => {
    if (!selected || !isDirectOrder) return
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      const order = await createServiceOrder(user.accessToken, {
        serviceId: selected._id,
        tierName: selected.pricingType === 'tiered' ? tierName : undefined,
        username: form.username.trim() || user.username,
        phone_e164: form.phone_e164.trim(),
      })
      const verified = await payServiceOrderWithRazorpay(user.accessToken, order._id)
      setOk(
        `Service order ${order._id} created + Razorpay paid (${verified.status}) — partner must Accept`,
      )
      await refresh()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const runProposalAction = async (quotationId: string, action: 'accept' | 'reject') => {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      const detail = await getQuotationDetail(user.accessToken, quotationId)
      if (!detail.proposal?._id) throw new Error('No proposal yet')
      if (detail.proposal.status !== 'sent') {
        throw new Error(`Proposal is ${detail.proposal.status} (must be sent)`)
      }
      if (action === 'accept') {
        const result = await acceptProposal(user.accessToken, detail.proposal._id)
        setMine((prev) =>
          prev.map((row) =>
            row._id === quotationId
              ? {
                  ...row,
                  proposal: result.proposal,
                  openPaymentRequest: result.paymentRequest || null,
                }
              : row,
          ),
        )
        setOk(
          result.paymentRequest
            ? `Accepted · payment request ${result.paymentRequest._id} (₹${result.paymentRequest.amount}) — use Pay with Razorpay below`
            : 'Proposal accepted — waiting for partner payment request',
        )
      } else {
        await rejectProposal(user.accessToken, detail.proposal._id)
        setOk('Proposal rejected')
      }
      await refresh()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePayPaymentRequest = async (paymentRequestId: string) => {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      const verified = await payPaymentRequestWithRazorpay(user.accessToken, paymentRequestId)
      setOk(`Razorpay paid (${verified.status}) · payment request fulfilled`)
      await refresh()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleApproveProposalWork = async (proposal: Proposal) => {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      if (proposal.paymentType === 'one_time') {
        await approveProposalWork(user.accessToken, proposal._id)
        setOk('One-time work approved')
      } else {
        const idx = (proposal.milestones || []).findIndex((m) => m.status === 'review_pending')
        if (idx < 0) throw new Error('No milestone awaiting approval')
        await approveMilestone(user.accessToken, proposal._id, idx)
        const nextIdx = idx + 1
        const hasNext = (proposal.milestones || []).length > nextIdx
        setOk(
          hasNext
            ? `Milestone ${idx + 1} approved · Partner must request payment to start milestone ${nextIdx + 1}`
            : `Milestone ${idx + 1} approved · All milestones done`,
        )
      }
      await refresh()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div>
        <h2 className="font-semibold">Book service or consultation</h2>
        <p className="text-xs text-zinc-500">
          Services → quotation or direct order. Consultations → preview &amp; book a slot.
        </p>
        <p className="text-xs text-zinc-500">
          Pick a partner, load offerings, then select a consultation to preview &amp; book, or a
          service to request a quotation as{' '}
          <span className="text-sky-300">
            {user.username} ({user.id})
          </span>
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {ok}
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className="tracking-wide text-zinc-500 uppercase">Partner id *</span>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={partnerId}
            onChange={(e) => {
              setPartnerId(e.target.value)
              setOfferingsLoaded(false)
              setSelected(null)
              setForm(emptyForm(user))
              setServices([])
              setConsultations([])
            }}
            placeholder="Mongo partner ObjectId"
            required
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="tracking-wide text-zinc-500 uppercase">Partner name</span>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={loadingOfferings || !partnerId.trim()}
          onClick={() => void loadOfferings()}
          className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50 md:col-span-2"
        >
          {loadingOfferings ? 'Loading offerings…' : 'Load services & consultations'}
        </button>
      </div>

      {offeringsLoaded ? (
        <div className="space-y-3 border-t border-zinc-800 pt-3">
          <div>
            <h3 className="mb-2 text-sm font-medium">Services ({services.length})</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {services.map((item) => (
                <OfferingCard
                  key={item._id}
                  item={item}
                  selected={selected?._id === item._id}
                  onSelect={() => selectOffering(item)}
                />
              ))}
              {!services.length ? (
                <p className="text-xs text-zinc-500 md:col-span-2">No services for this partner</p>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Consultations ({consultations.length})</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {consultations.map((item) => (
                <OfferingCard
                  key={item._id}
                  item={item}
                  selected={selected?._id === item._id}
                  onSelect={() => selectOffering(item)}
                />
              ))}
              {!consultations.length ? (
                <p className="text-xs text-zinc-500 md:col-span-2">
                  No consultations for this partner
                </p>
              ) : null}
            </div>
          </div>

          {selected?.type === 'consultation' ? (
            <UserConsultationBookPanel
              key={selected._id}
              token={user.accessToken}
              consultation={selected}
              onBooked={() => void refresh()}
              onSetupComplete={(updated) => {
                setSelected(updated)
                setConsultations((rows) =>
                  rows.map((row) => (row._id === updated._id ? { ...row, ...updated } : row)),
                )
              }}
              onError={(msg) => setError(msg)}
              onSuccess={(msg) => setOk(msg)}
            />
          ) : selected ? (
            <form
              onSubmit={(e) => void handleRequest(e)}
              className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-950/80 p-3"
            >
              <div>
                <h3 className="text-sm font-medium">Request fields (partner inbox)</h3>
                <p className="text-[11px] text-zinc-500">
                  Pre-filled from {selected.type} · {selected.title}. Edit anything the partner
                  should see, then submit.
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <label className="space-y-1 text-xs md:col-span-2">
                  <span className="tracking-wide text-zinc-500 uppercase">Title *</span>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.title}
                    onChange={(e) => patchForm('title', e.target.value)}
                    maxLength={200}
                    required
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="tracking-wide text-zinc-500 uppercase">Category *</span>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(e) => patchForm('category', e.target.value)}
                    maxLength={120}
                    required
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="tracking-wide text-zinc-500 uppercase">Duration *</span>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.duration}
                    onChange={(e) => patchForm('duration', e.target.value)}
                    maxLength={120}
                    placeholder="e.g. 2-3 weeks"
                    required
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="tracking-wide text-zinc-500 uppercase">Budget min *</span>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.budgetMin}
                    onChange={(e) => patchForm('budgetMin', e.target.value)}
                    required
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="tracking-wide text-zinc-500 uppercase">Budget max *</span>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.budgetMax}
                    onChange={(e) => patchForm('budgetMax', e.target.value)}
                    required
                  />
                </label>
                <label className="space-y-1 text-xs md:col-span-2">
                  <span className="tracking-wide text-zinc-500 uppercase">Description *</span>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) => patchForm('description', e.target.value)}
                    maxLength={2000}
                    required
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="tracking-wide text-zinc-500 uppercase">Username</span>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.username}
                    onChange={(e) => patchForm('username', e.target.value)}
                    maxLength={120}
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="tracking-wide text-zinc-500 uppercase">Phone (e164)</span>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={form.phone_e164}
                    onChange={(e) => patchForm('phone_e164', e.target.value)}
                    maxLength={20}
                  />
                </label>
              </div>

              <div className="rounded border border-zinc-800 px-2 py-1.5 text-[11px] text-zinc-500">
                Locked from listing: type <span className="text-zinc-300">{selected.type}</span> ·
                id <span className="text-zinc-300">{selected._id}</span>
                {selected.pricingType ? (
                  <>
                    {' '}
                    · pricing <span className="text-zinc-300">{selected.pricingType}</span>
                  </>
                ) : null}
              </div>

              {isDirectOrder ? (
                <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-xs text-amber-200">
                    Fixed/Tiered — create order + Razorpay checkout. Partner then Accepts on My
                    Projects (not chat). After partner marks completed, Approve here.
                  </p>
                  {selected.pricingType === 'tiered' ? (
                    <label className="block space-y-1 text-xs">
                      <span className="tracking-wide text-zinc-500 uppercase">Tier</span>
                      <select
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                        value={tierName}
                        onChange={(e) =>
                          setTierName(e.target.value as 'basic' | 'standard' | 'premium')
                        }
                      >
                        <option value="basic">basic</option>
                        <option value="standard">standard</option>
                        <option value="premium">premium</option>
                      </select>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void handleDirectOrder()}
                    className="w-full rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
                  >
                    {loading ? 'Ordering…' : 'Create order + Pay with Razorpay'}
                  </button>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-sky-400 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Request quotation'}
              </button>
            </form>
          ) : !selected ? (
            <p className="text-xs text-zinc-500">
              Select a service to request a quotation, or a consultation to preview and book.
            </p>
          ) : null}

          {!allOfferings.length ? (
            <p className="text-xs text-zinc-500">
              This partner has no listable offerings. Create a live service or consultation first.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="border-t border-zinc-800 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">My Fixed/Tiered orders</h3>
          <button
            type="button"
            className="text-xs text-zinc-400 hover:text-zinc-200"
            onClick={() => void refresh().catch((err) => setError(errMessage(err)))}
          >
            Refresh
          </button>
        </div>
        <ul className="space-y-2">
          {orders.map((order) => (
            <li
              key={order._id}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            >
              <div className="font-medium">{order.title}</div>
              <div className="text-xs text-zinc-500">
                {order.pricingType} · {order.packageName} · ₹{order.price} · pay{' '}
                {order.paymentStatus} · work {order.workStatus}
                {order.workStatus === 'awaiting_acceptance' ||
                order.workStatus === 'awaiting_first_message'
                  ? ' — waiting for partner Accept'
                  : ''}
                {order.workStatus === 'ongoing' ? ' — partner working' : ''}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {order.paymentStatus === 'pending' ? (
                  <button
                    type="button"
                    disabled={loading}
                    className="rounded border border-amber-500 px-2 py-1 text-[11px] text-amber-300 disabled:opacity-50"
                    onClick={() =>
                      void (async () => {
                        setLoading(true)
                        try {
                          const verified = await payServiceOrderWithRazorpay(
                            user.accessToken,
                            order._id,
                          )
                          setOk(`Service order Razorpay paid (${verified.status})`)
                          await refresh()
                        } catch (err) {
                          setError(errMessage(err))
                        } finally {
                          setLoading(false)
                        }
                      })()
                    }
                  >
                    Pay with Razorpay
                  </button>
                ) : null}
                {order.workStatus === 'review_pending' ? (
                  <button
                    type="button"
                    disabled={loading}
                    className="rounded border border-emerald-600 px-2 py-1 text-[11px] text-emerald-300 disabled:opacity-50"
                    onClick={() =>
                      void (async () => {
                        setLoading(true)
                        try {
                          await approveServiceOrder(user.accessToken, order._id)
                          setOk('Service order approved — rate it in Profile insights below')
                          await refresh()
                        } catch (err) {
                          setError(errMessage(err))
                        } finally {
                          setLoading(false)
                        }
                      })()
                    }
                  >
                    Approve completion
                  </button>
                ) : null}
              </div>
            </li>
          ))}
          {!orders.length ? (
            <li className="text-xs text-zinc-500">No Fixed/Tiered orders yet</li>
          ) : null}
        </ul>
      </div>

      <div className="border-t border-zinc-800 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">My consultation bookings</h3>
          <button
            type="button"
            className="text-xs text-zinc-400 hover:text-zinc-200"
            onClick={() => void refresh().catch((err) => setError(errMessage(err)))}
          >
            Refresh
          </button>
        </div>
        <ul className="space-y-2">
          {consultationBookings.map((booking) => (
            <li
              key={booking._id}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            >
              <div className="font-medium">{booking.title}</div>
              <div className="text-xs text-zinc-500">
                {new Date(booking.startAt).toLocaleString()} · {booking.durationMinutes ?? '?'} min
                · ₹{booking.price} · pay {booking.paymentStatus} · {booking.status}
                {booking.navigation?.threadId ? (
                  <>
                    {' '}
                    · thread <span className="text-sky-300">{booking.navigation.threadId}</span>
                  </>
                ) : null}
              </div>
              {booking.paymentStatus === 'pending' ? (
                <button
                  type="button"
                  disabled={loading}
                  className="mt-2 rounded border border-violet-500 px-2 py-1 text-[11px] text-violet-300 disabled:opacity-50"
                  onClick={() =>
                    void (async () => {
                      setLoading(true)
                      try {
                        const verified = await payConsultationBookingWithRazorpay(
                          user.accessToken,
                          booking._id,
                        )
                        setOk(`Consultation Razorpay paid (${verified.status})`)
                        await refresh()
                      } catch (err) {
                        setError(errMessage(err))
                      } finally {
                        setLoading(false)
                      }
                    })()
                  }
                >
                  Pay with Razorpay
                </button>
              ) : null}
            </li>
          ))}
          {!consultationBookings.length ? (
            <li className="text-xs text-zinc-500">No consultation bookings yet</li>
          ) : null}
        </ul>
      </div>

      <div className="border-t border-zinc-800 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">My quotation requests</h3>
          <button
            type="button"
            className="text-xs text-zinc-400 hover:text-zinc-200"
            onClick={() => void refresh().catch((err) => setError(errMessage(err)))}
          >
            Refresh
          </button>
        </div>
        <ul className="space-y-2">
          {mine.map((q) => {
            const proposalStatus = q.proposal?.status
            const canRespond = proposalStatus === 'sent'
            const awaitingPayment = proposalNeedsPayment(q.proposal) && !q.openPaymentRequest
            const canApproveWork =
              q.proposal?.status === 'accepted' &&
              (q.proposal.workStatus === 'review_pending' ||
                (q.proposal.milestones || []).some((m) => m.status === 'review_pending'))
            return (
              <li
                key={q._id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
              >
                <div className="font-medium">{q.title}</div>
                <div className="text-xs text-zinc-500">
                  {q.itemType || 'listing'} · {q.category} · request {q.status}
                  {proposalStatus ? ` · proposal ${proposalStatus}` : ''}
                  {q.proposal?.workStatus ? ` · work ${q.proposal.workStatus}` : ''} · partner{' '}
                  {q.partnerId}
                </div>
                <div className="mt-1 text-[11px] text-zinc-600">
                  {formatBudget(q.budget)} · {q.duration}
                  {q.phone_e164 ? ` · ${q.phone_e164}` : ''}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {canRespond ? (
                    <>
                      <button
                        type="button"
                        disabled={loading}
                        className="rounded border border-emerald-600 px-2 py-1 text-[11px] text-emerald-300 disabled:opacity-50"
                        onClick={() => void runProposalAction(q._id, 'accept')}
                      >
                        Accept proposal
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        className="rounded border border-red-600 px-2 py-1 text-[11px] text-red-300 disabled:opacity-50"
                        onClick={() => void runProposalAction(q._id, 'reject')}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  {q.openPaymentRequest ? (
                    <button
                      type="button"
                      disabled={loading}
                      className="rounded border border-amber-500 px-2 py-1 text-[11px] text-amber-300 disabled:opacity-50"
                      onClick={() => void handlePayPaymentRequest(q.openPaymentRequest!._id)}
                    >
                      Pay with Razorpay ₹{q.openPaymentRequest.amount}
                      {q.openPaymentRequest.milestoneIndex != null
                        ? ` · milestone ${q.openPaymentRequest.milestoneIndex + 1}`
                        : ''}
                    </button>
                  ) : null}
                  {awaitingPayment ? (
                    <span className="text-[11px] text-amber-400/80">
                      Payment due — refresh or ask partner to send payment request
                    </span>
                  ) : null}
                  {canApproveWork && q.proposal ? (
                    <button
                      type="button"
                      disabled={loading}
                      className="rounded border border-emerald-600 px-2 py-1 text-[11px] text-emerald-300 disabled:opacity-50"
                      onClick={() => void handleApproveProposalWork(q.proposal!)}
                    >
                      Approve completion
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
          {!mine.length ? <li className="text-xs text-zinc-500">No requests yet</li> : null}
        </ul>
      </div>

      <div className="border-t border-zinc-800 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Rate &amp; review (completed work)</h3>
          <button
            type="button"
            className="text-xs text-zinc-400 hover:text-zinc-200"
            onClick={() => void refresh().catch((err) => setError(errMessage(err)))}
          >
            Refresh
          </button>
        </div>
        <p className="mb-2 text-[11px] text-zinc-500">
          After you approve completion, leave a 1–5 star rating for the partner (Insights tab).
        </p>
        <ul className="space-y-3">
          {eligibleReviews.map((item) => {
            const key = `${item.engagementType}:${item.engagementId}`
            const draft = reviewDrafts[key] || { rating: 5, text: '' }
            return (
              <li
                key={key}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
              >
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-zinc-500">
                  {item.engagementType} · partner {item.partnerId}
                  {item.serviceId ? ` · service ${item.serviceId}` : ''}
                  {item.partnerName ? ` · ${item.partnerName}` : ''}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-[11px] text-zinc-400">
                    Stars{' '}
                    <select
                      className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                      value={draft.rating}
                      onChange={(e) =>
                        setReviewDrafts((prev) => ({
                          ...prev,
                          [key]: { ...draft, rating: Number(e.target.value) },
                        }))
                      }
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <textarea
                  className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs"
                  rows={2}
                  placeholder="Write a short review…"
                  value={draft.text}
                  onChange={(e) =>
                    setReviewDrafts((prev) => ({
                      ...prev,
                      [key]: { ...draft, text: e.target.value },
                    }))
                  }
                />
                <button
                  type="button"
                  disabled={loading}
                  className="mt-2 rounded border border-amber-400 px-2 py-1 text-[11px] text-amber-200 disabled:opacity-50"
                  onClick={() =>
                    void (async () => {
                      setLoading(true)
                      setError(null)
                      setOk(null)
                      try {
                        await submitPartnerReview(user.accessToken, {
                          partnerId: item.partnerId,
                          engagementType: item.engagementType,
                          engagementId: item.engagementId,
                          rating: draft.rating,
                          text: draft.text,
                          userName: user.username,
                        })
                        setOk(`Review submitted for ${item.title}`)
                        setReviewDrafts((prev) => {
                          const next = { ...prev }
                          delete next[key]
                          return next
                        })
                        await refresh()
                      } catch (err) {
                        setError(errMessage(err))
                      } finally {
                        setLoading(false)
                      }
                    })()
                  }
                >
                  Submit review
                </button>
              </li>
            )
          })}
          {!eligibleReviews.length ? (
            <li className="text-xs text-zinc-500">No completed services waiting for a review</li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}
