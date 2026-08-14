import { useEffect, useState } from 'react'
import {
  createPaymentRequest,
  getProposalWork,
  getQuotationDetail,
  listPartnerServiceProjects,
  markMilestoneCompleted,
  markProposalCompleted,
  type Proposal,
  type ProposalMilestone,
  type QuotationRequest,
  type ServiceProjectCard,
  type ServiceProjectStatus,
} from '../api/quotation.api'
import {
  listPartnerConsultationProjects,
  type ConsultationProjectCard,
  type ConsultationProjectStatus,
} from '../api/consultation-booking.api'
import { PartnerConsultationDetailPanel } from './partner-consultation-detail-panel'
import {
  acceptServiceOrder,
  getServiceOrder,
  linkServiceOrderThread,
  markServiceOrderCompleted,
  type ServiceOrder,
} from '../api/service-order.api'

type Props = {
  token: string
}

type ProjectTab = 'services' | 'consultation'

const filters: Array<{ value: ServiceProjectStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'newservice', label: 'New' },
  { value: 'ongoing', label: 'On-going' },
  { value: 'completed', label: 'Completed' },
]

function errorMessage(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (error instanceof Error ? error.message : 'Unable to load projects')
  )
}

function paymentLabel(type: ServiceProjectCard['paymentType']) {
  if (type === 'milestone') return 'Milestones'
  if (type === 'one_time') return 'Single Payment'
  if (type === 'fixed') return 'Fixed'
  if (type === 'tiered') return 'Tiered'
  return 'Quotation'
}

function activityLabel(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const elapsed = Date.now() - date.getTime()
  const days = Math.floor(elapsed / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function previousMilestonesDone(milestones: ProposalMilestone[], index: number) {
  return milestones
    .slice(0, index)
    .every((m) => m.status === 'approved' || m.status === 'payment_completed')
}

/** Next milestone partner can start by requesting payment (after prior ones are approved). */
function canRequestPaymentForMilestone(milestones: ProposalMilestone[], index: number) {
  const m = milestones[index]
  if (!m) return false
  if (m.status !== 'approval_pending') return false
  return previousMilestonesDone(milestones, index)
}

function navHintLabel(project: { navigation: { screenHint: string; threadId: string | null } }) {
  const hint = project.navigation.screenHint.replaceAll('_', ' ')
  return project.navigation.threadId ? `${hint} · ${project.navigation.threadId}` : hint
}

function milestoneStatusLabel(status: string) {
  switch (status) {
    case 'approval_pending':
      return 'Approval pending'
    case 'payment_pending':
      return 'Payment pending'
    case 'ongoing':
      return 'On-going'
    case 'review_pending':
      return 'Review pending'
    case 'approved':
      return 'Approved'
    case 'payment_completed':
      return 'Payment completed'
    default:
      return status
  }
}

export function PartnerMyProjects({ token }: Props) {
  const [tab, setTab] = useState<ProjectTab>('services')
  const [status, setStatus] = useState<ServiceProjectStatus>('all')
  const [projects, setProjects] = useState<ServiceProjectCard[]>([])
  const [consultationProjects, setConsultationProjects] = useState<ConsultationProjectCard[]>([])
  const [selected, setSelected] = useState<ServiceProjectCard | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationProjectCard | null>(
    null,
  )
  const [quotationDetail, setQuotationDetail] = useState<{
    quotation: QuotationRequest
    proposal: Proposal | null
  } | null>(null)
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null)
  const [workProposal, setWorkProposal] = useState<Proposal | null>(null)
  const [threadIdInput, setThreadIdInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const reloadList = async () => {
    if (tab === 'services') {
      const rows = await listPartnerServiceProjects(token, status)
      setProjects(rows)
      return rows
    }
    const rows = await listPartnerConsultationProjects(token, status as ConsultationProjectStatus)
    setConsultationProjects(rows)
    return rows
  }

  const resetSelection = () => {
    setSelected(null)
    setSelectedConsultation(null)
    setQuotationDetail(null)
    setServiceOrder(null)
    setWorkProposal(null)
    setError(null)
    setOk(null)
  }

  const changeTab = (next: ProjectTab) => {
    setTab(next)
    setStatus('all')
    resetSelection()
    setLoading(true)
  }

  const changeStatus = (next: ServiceProjectStatus) => {
    setStatus(next)
    resetSelection()
    setLoading(true)
  }

  useEffect(() => {
    let active = true
    const loader =
      tab === 'services'
        ? listPartnerServiceProjects(token, status)
        : listPartnerConsultationProjects(token, status as ConsultationProjectStatus)
    void loader
      .then((rows) => {
        if (!active) return
        if (tab === 'services') setProjects(rows as ServiceProjectCard[])
        else setConsultationProjects(rows as ConsultationProjectCard[])
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [status, token, tab])

  const openProject = async (project: ServiceProjectCard) => {
    setSelected(project)
    setSelectedConsultation(null)
    setQuotationDetail(null)
    setServiceOrder(null)
    setWorkProposal(null)
    setDetailLoading(true)
    setError(null)
    setOk(null)
    try {
      if (project.engagementType === 'fixed_tiered' && project.serviceOrderId) {
        const order = await getServiceOrder(token, project.serviceOrderId)
        setServiceOrder(order)
        setThreadIdInput(order.threadId || '')
      } else if (project.quotationRequestId) {
        setQuotationDetail(await getQuotationDetail(token, project.quotationRequestId))
        if (
          project.proposalId &&
          (project.navigation.screenHint === 'service_work_one_time' ||
            project.navigation.screenHint === 'service_work_milestones' ||
            project.navigation.screenHint === 'payment' ||
            project.projectStatus === 'ongoing' ||
            project.projectStatus === 'completed')
        ) {
          const work = await getProposalWork(token, project.proposalId)
          setWorkProposal(work.proposal)
        }
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDetailLoading(false)
    }
  }

  const openConsultationProject = async (project: ConsultationProjectCard) => {
    setSelectedConsultation(project)
    setSelected(null)
    setQuotationDetail(null)
    setServiceOrder(null)
    setWorkProposal(null)
    setError(null)
    setOk(null)
  }

  const runAction = async (fn: () => Promise<void>, successMsg: string) => {
    setActionLoading(true)
    setError(null)
    setOk(null)
    try {
      await fn()
      setOk(successMsg)
      const rows = await reloadList()
      if (selected && tab === 'services') {
        const next = (rows as ServiceProjectCard[]).find((p) => p.id === selected.id)
        await openProject(next || selected)
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <div className="border-b border-zinc-800 px-4 pt-5 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">My projects</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Fixed/tiered: after user dummy pay, open the card → Accept request → Mark completed. Chat
          does not start the job.
        </p>
        <div className="mt-5 flex gap-6 text-sm">
          <button
            type="button"
            onClick={() => changeTab('services')}
            className={`pb-3 font-medium ${
              tab === 'services'
                ? 'border-b-2 border-amber-400 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => changeTab('consultation')}
            className={`pb-3 font-medium ${
              tab === 'consultation'
                ? 'border-b-2 border-amber-400 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Consultation
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => changeStatus(filter.value)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                status === filter.value
                  ? 'bg-amber-400 text-zinc-950'
                  : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        {ok ? (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {ok}
          </div>
        ) : null}

        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading projects…</p>
        ) : null}

        {!loading && tab === 'services' && !projects.length ? (
          <p className="rounded-xl border border-dashed border-zinc-700 py-10 text-center text-sm text-zinc-500">
            No {status === 'all' ? '' : `${status} `}service projects
          </p>
        ) : null}

        {!loading && tab === 'consultation' && !consultationProjects.length ? (
          <p className="rounded-xl border border-dashed border-zinc-700 py-10 text-center text-sm text-zinc-500">
            No {status === 'all' ? '' : `${status} `}consultation bookings
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {tab === 'services'
            ? projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => void openProject(project)}
                  className={`group flex min-w-0 gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-zinc-600 ${
                    selected?.id === project.id
                      ? 'border-amber-400/60 bg-amber-400/5'
                      : 'border-zinc-800 bg-zinc-950/60'
                  }`}
                >
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    {project.serviceImage ? (
                      <img
                        src={project.serviceImage}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-zinc-600">
                        ◇
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-zinc-100">
                        {project.title}
                      </h3>
                      <span className="shrink-0 text-[10px] text-zinc-500">
                        {activityLabel(project.lastActivityAt)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-xs text-zinc-400">
                      Client: {project.client.username || project.client.userId}
                      <span className="px-1 text-zinc-700">|</span>
                      {paymentLabel(project.paymentType)}
                      <span className="px-1 text-zinc-700">|</span>
                      {project.engagementType === 'fixed_tiered' ? 'Fixed/Tiered' : 'Custom'}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-300 capitalize">
                        {project.projectStatus === 'ongoing'
                          ? 'On-going'
                          : project.projectStatus === 'newservice'
                            ? 'New'
                            : project.projectStatus}
                      </span>
                      <span className="truncate text-[10px] text-amber-300">
                        {navHintLabel(project)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            : consultationProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => void openConsultationProject(project)}
                  className={`group flex min-w-0 gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-zinc-600 ${
                    selectedConsultation?.id === project.id
                      ? 'border-amber-400/60 bg-amber-400/5'
                      : 'border-zinc-800 bg-zinc-950/60'
                  }`}
                >
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-2xl text-zinc-600">
                    🎧
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-zinc-100">
                        {project.title}
                      </h3>
                      <span className="shrink-0 text-[10px] text-zinc-500">
                        {activityLabel(project.lastActivityAt)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-xs text-zinc-400">
                      Client: {project.client.username}
                      <span className="px-1 text-zinc-700">|</span>
                      {project.durationMinutes ?? '?'} min
                      <span className="px-1 text-zinc-700">|</span>₹{project.price}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-300 capitalize">
                        {project.projectStatus === 'ongoing'
                          ? 'On-going'
                          : project.projectStatus === 'newservice'
                            ? 'New'
                            : project.projectStatus}
                      </span>
                      <span className="truncate text-[10px] text-amber-300">
                        {navHintLabel(project)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
        </div>

        {selected && tab === 'services' ? (
          <div className="mt-5 space-y-4 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">
                {selected.engagementType === 'fixed_tiered'
                  ? selected.navigation.screenHint === 'service_work_one_time'
                    ? 'Service (work)'
                    : selected.navigation.screenHint === 'completed'
                      ? 'Service (completed)'
                      : 'Service request'
                  : selected.navigation.screenHint === 'service_work_one_time'
                    ? 'One-time work'
                    : selected.navigation.screenHint === 'service_work_milestones'
                      ? 'Milestones work'
                      : 'Project context'}
              </h3>
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
                {navHintLabel(selected)}
              </span>
            </div>

            {detailLoading ? <p className="text-sm text-zinc-500">Loading detail…</p> : null}

            {serviceOrder ? (
              <div className="space-y-3 text-sm text-zinc-300">
                <p>{serviceOrder.description}</p>
                <p className="text-xs text-zinc-500">
                  {serviceOrder.pricingType} · {serviceOrder.packageName} · ₹{serviceOrder.price} ·
                  pay {serviceOrder.paymentStatus} · work {serviceOrder.workStatus}
                </p>
                {serviceOrder.inclusions ? (
                  <p className="text-xs text-zinc-400">Includes: {serviceOrder.inclusions}</p>
                ) : null}

                {serviceOrder.workStatus === 'awaiting_acceptance' ||
                serviceOrder.workStatus === 'awaiting_first_message' ? (
                  <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                    User paid. Accept this service request to start work (`POST
                    /service-orders/:id/accept`). Then Mark completed.
                  </p>
                ) : null}
                {serviceOrder.workStatus === 'ongoing' ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    Accepted — work ongoing. Mark completed when done.
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <input
                    value={threadIdInput}
                    onChange={(e) => setThreadIdInput(e.target.value)}
                    placeholder="Chat threadId"
                    className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    disabled={actionLoading || !threadIdInput.trim()}
                    onClick={() =>
                      void runAction(async () => {
                        await linkServiceOrderThread(token, serviceOrder._id, threadIdInput.trim())
                      }, 'Thread linked')
                    }
                    className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-50"
                  >
                    Link thread
                  </button>
                  {serviceOrder.workStatus === 'awaiting_acceptance' ||
                  serviceOrder.workStatus === 'awaiting_first_message' ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        void runAction(async () => {
                          const updated = await acceptServiceOrder(token, serviceOrder._id)
                          setServiceOrder(updated)
                        }, 'Service request accepted — work ongoing')
                      }
                      className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-50"
                    >
                      Accept request
                    </button>
                  ) : null}
                  {serviceOrder.workStatus === 'ongoing' ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        void runAction(async () => {
                          await markServiceOrderCompleted(token, serviceOrder._id)
                        }, 'Marked completed — awaiting user approve')
                      }
                      className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-50"
                    >
                      Mark completed
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {quotationDetail && !workProposal ? (
              <div className="space-y-1 text-sm text-zinc-300">
                <p>{quotationDetail.quotation.description}</p>
                <p className="text-xs text-zinc-500">
                  Quotation {quotationDetail.quotation.status}
                  {quotationDetail.proposal
                    ? ` · Proposal ${quotationDetail.proposal.status} · ₹${quotationDetail.proposal.payableAmount ?? quotationDetail.proposal.totalPrice}`
                    : ' · No proposal yet'}
                </p>
              </div>
            ) : null}

            {workProposal?.paymentType === 'one_time' ? (
              <div className="space-y-3 text-sm">
                <p className="text-zinc-300">
                  Work status:{' '}
                  <span className="text-amber-300">
                    {workProposal.workStatus || 'awaiting pay'}
                  </span>
                </p>
                {workProposal.workStatus === 'ongoing' ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      void runAction(async () => {
                        await markProposalCompleted(token, workProposal._id)
                      }, 'One-time work marked completed')
                    }
                    className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-50"
                  >
                    Mark completed
                  </button>
                ) : null}
              </div>
            ) : null}

            {workProposal?.paymentType === 'milestone' ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  After the user approves a milestone, request payment for the next one to unlock
                  it.
                </p>
                {(workProposal.milestones || []).map((m, index) => {
                  const milestones = workProposal.milestones || []
                  const canStartNext = canRequestPaymentForMilestone(milestones, index)
                  return (
                    <div
                      key={m._id || index}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-zinc-100">
                          {index + 1}. {m.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase">
                          {milestoneStatusLabel(m.status ?? '')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">₹{m.price}</p>

                      {m.status === 'ongoing' ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            void runAction(
                              async () => {
                                await markMilestoneCompleted(token, workProposal._id, index)
                              },
                              `Milestone ${index + 1} marked completed — waiting for user approve`,
                            )
                          }
                          className="mt-2 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-50"
                        >
                          Mark completed
                        </button>
                      ) : null}

                      {m.status === 'review_pending' ? (
                        <p className="mt-2 text-[11px] text-amber-200/80">
                          Waiting for user to approve this milestone
                        </p>
                      ) : null}

                      {m.status === 'payment_pending' ? (
                        <p className="mt-2 text-[11px] text-sky-300/80">
                          Waiting for user to pay this milestone
                        </p>
                      ) : null}

                      {canStartNext ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            void runAction(
                              async () => {
                                await createPaymentRequest(token, workProposal._id, {
                                  milestoneIndex: index,
                                })
                              },
                              index === 0
                                ? `Payment requested for milestone ${index + 1}`
                                : `Next milestone ${index + 1} started — payment requested`,
                            )
                          }
                          className="mt-2 rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-50"
                        >
                          {index === 0
                            ? 'Request payment'
                            : `Approve & start next · Request payment (M${index + 1})`}
                        </button>
                      ) : null}

                      {m.status === 'approved' || m.status === 'payment_completed' ? (
                        <p className="mt-2 text-[11px] text-emerald-300/80">Milestone done</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {selectedConsultation && tab === 'consultation' ? (
          <PartnerConsultationDetailPanel
            key={selectedConsultation.consultationBookingId}
            token={token}
            project={selectedConsultation}
            onChanged={() => void reloadList()}
            onError={(msg) => setError(msg)}
            onSuccess={(msg) => setOk(msg)}
          />
        ) : null}
      </div>
    </section>
  )
}
