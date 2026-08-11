import { useEffect, useState, type FormEvent } from 'react'
import {
  createPaymentRequest,
  declineQuotation,
  getQuotationDetail,
  listPartnerQuotations,
  sendProposal,
  upsertProposal,
  withdrawProposal,
  type Proposal,
  type QuotationRequest,
} from '../api/quotation.api'

type Props = {
  token: string
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

export function PartnerQuotationPanel({ token }: Props) {
  const [list, setList] = useState<QuotationRequest[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [quotation, setQuotation] = useState<QuotationRequest | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [paymentType, setPaymentType] = useState<'one_time' | 'milestone'>('one_time')
  const [deliverables, setDeliverables] = useState(
    'Reviewed NDA with comments + clean revised version + summary.',
  )
  const [totalPrice, setTotalPrice] = useState('60000')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [timelineValue, setTimelineValue] = useState('3')
  const [timelineUnit, setTimelineUnit] = useState<'days' | 'weeks' | 'months'>('months')
  const [validTill, setValidTill] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })
  const [milestoneTitle, setMilestoneTitle] = useState('Concept & Design Approval')
  const [milestoneDesc, setMilestoneDesc] = useState('Initial review and scope confirmation')
  const [milestonePrice, setMilestonePrice] = useState('25000')
  const [milestoneTv, setMilestoneTv] = useState('1')
  const [milestoneTu, setMilestoneTu] = useState<'days' | 'weeks' | 'months'>('weeks')

  const refreshList = async () => {
    const rows = await listPartnerQuotations(token)
    setList(rows)
  }

  const openDetail = async (id: string) => {
    setSelectedId(id)
    const detail = await getQuotationDetail(token, id)
    setQuotation(detail.quotation)
    setProposal(detail.proposal)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate partner quotations from API
    void refreshList().catch((err) => setError(errMessage(err)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when auth token changes
  }, [token])

  const handleDecline = async () => {
    if (!selectedId) return
    setLoading(true)
    setError(null)
    try {
      await declineQuotation(token, selectedId)
      setOk('Declined')
      await refreshList()
      await openDetail(selectedId)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const validTillIso = () => {
    // End of selected calendar day so "today" passes backend validation.
    const d = new Date(`${validTill}T23:59:59.999`)
    return d.toISOString()
  }

  const canEditDraft =
    quotation &&
    quotation.status !== 'declined' &&
    quotation.status !== 'closed' &&
    (!proposal || ['draft', 'withdrawn'].includes(proposal.status))

  const handleSaveDraft = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedId || !quotation || !canEditDraft) return
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      const body =
        paymentType === 'one_time'
          ? {
              quotationRequestId: selectedId,
              deliverables,
              paymentType,
              totalPrice: Number(totalPrice),
              discountPercent: Number(discountPercent) || 0,
              timeline: { value: Number(timelineValue), unit: timelineUnit },
              validTill: validTillIso(),
              title: quotation.title,
              category: quotation.category,
            }
          : {
              quotationRequestId: selectedId,
              deliverables,
              paymentType,
              discountPercent: Number(discountPercent) || 0,
              milestones: [
                {
                  title: milestoneTitle,
                  description: milestoneDesc,
                  price: Number(milestonePrice),
                  timeline: { value: Number(milestoneTv), unit: milestoneTu },
                },
              ],
              validTill: validTillIso(),
              title: quotation.title,
              category: quotation.category,
            }
      const p = await upsertProposal(token, body)
      setProposal(p)
      setOk(`Draft saved: ${p._id}`)
      await refreshList()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      await fn()
      setOk(success)
      if (selectedId) await openDetail(selectedId)
      await refreshList()
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Quotation inbox</h2>
        <button
          type="button"
          className="text-xs text-zinc-400 hover:text-zinc-200"
          onClick={() => void refreshList().catch((err) => setError(errMessage(err)))}
        >
          Refresh
        </button>
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

      <ul className="max-h-40 space-y-1 overflow-auto">
        {list.map((q) => (
          <li key={q._id}>
            <button
              type="button"
              className={`w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-zinc-800 ${selectedId === q._id ? 'bg-zinc-800' : ''}`}
              onClick={() => void openDetail(q._id).catch((err) => setError(errMessage(err)))}
            >
              <div className="font-medium">{q.title}</div>
              <div className="text-[11px] text-zinc-500">
                {q.username || q.userId} · {q.status}
              </div>
            </button>
          </li>
        ))}
        {!list.length ? <li className="text-xs text-zinc-500">No quotation requests</li> : null}
      </ul>

      {quotation ? (
        <div className="space-y-3 border-t border-zinc-800 pt-3">
          <div>
            <div className="text-lg font-medium">{quotation.title}</div>
            <div className="text-xs text-zinc-500">
              {quotation.category} · {quotation.duration} · ₹{quotation.budget.min}–
              {quotation.budget.max}
            </div>
            <p className="mt-2 text-sm text-zinc-300">{quotation.description}</p>
            <p className="mt-1 text-xs text-zinc-500">
              Client: {quotation.username} ({quotation.userId}) · {quotation.phone_e164}
            </p>
          </div>

          {quotation.status === 'pending' ? (
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm"
              onClick={() => void handleDecline()}
            >
              Decline
            </button>
          ) : null}

          {proposal ? (
            <div className="rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400">
              Proposal {proposal._id} · {proposal.status} · ₹
              {proposal.payableAmount ?? proposal.totalPrice}
            </div>
          ) : null}

          <form onSubmit={(e) => void handleSaveDraft(e)} className="space-y-2">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                disabled={!canEditDraft}
                className={`rounded-lg px-3 py-1.5 disabled:opacity-50 ${paymentType === 'one_time' ? 'bg-amber-400 text-zinc-950' : 'border border-zinc-700'}`}
                onClick={() => setPaymentType('one_time')}
              >
                One-time
              </button>
              <button
                type="button"
                disabled={!canEditDraft}
                className={`rounded-lg px-3 py-1.5 disabled:opacity-50 ${paymentType === 'milestone' ? 'bg-amber-400 text-zinc-950' : 'border border-zinc-700'}`}
                onClick={() => setPaymentType('milestone')}
              >
                Milestone
              </button>
            </div>
            <textarea
              className="min-h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="Deliverables"
              required
            />
            {paymentType === 'one_time' ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  placeholder="Price"
                />
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Discount %"
                />
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={timelineValue}
                  onChange={(e) => setTimelineValue(e.target.value)}
                  placeholder="Timeline"
                />
                <select
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={timelineUnit}
                  onChange={(e) => setTimelineUnit(e.target.value as typeof timelineUnit)}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Milestone title"
                />
                <input
                  className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Milestone description"
                />
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  value={milestonePrice}
                  onChange={(e) => setMilestonePrice(e.target.value)}
                  placeholder="Milestone price"
                />
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={milestoneTv}
                    onChange={(e) => setMilestoneTv(e.target.value)}
                  />
                  <select
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-sm"
                    value={milestoneTu}
                    onChange={(e) => setMilestoneTu(e.target.value as typeof milestoneTu)}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            )}
            <label className="block text-xs text-zinc-500">
              Valid till
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={validTill}
                onChange={(e) => setValidTill(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading || !canEditDraft}
              className="w-full rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
            >
              Save draft proposal
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {proposal && ['draft', 'withdrawn'].includes(proposal.status) ? (
              <button
                type="button"
                disabled={loading}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950"
                onClick={() =>
                  void runAction(() => sendProposal(token, proposal._id), 'Proposal sent to chat')
                }
              >
                Send proposal
              </button>
            ) : null}
            {proposal?.status === 'sent' ? (
              <button
                type="button"
                disabled={loading}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-sm"
                onClick={() =>
                  void runAction(() => withdrawProposal(token, proposal._id), 'Withdrawn')
                }
              >
                Withdraw
              </button>
            ) : null}
            {proposal?.status === 'accepted' ? (
              <button
                type="button"
                disabled={loading}
                className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-medium text-zinc-950"
                onClick={() =>
                  void runAction(
                    () => createPaymentRequest(token, proposal._id),
                    'Payment request sent in chat',
                  )
                }
              >
                Send payment request
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
