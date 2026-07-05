import { BarChart3, Ban, Clock, Download, Hourglass, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'

import { CreateMembershipModal } from '../components/create-membership-modal'
import { MembershipPlanCard } from '../components/membership-plan-card'
import { MembershipStatsBar } from '../components/membership-stats-bar'
import {
  useActivateMembership,
  useDeactivateMembership,
  useDeleteMembership,
  useMembershipFeatures,
  useMemberships,
  useMembershipVersions,
  usePauseMembership,
  useResumeMembership,
  useSetMembershipValidity,
} from '../hooks/use-memberships'
import {
  DELETE_REASON_OPTIONS,
  PAUSE_REASON_OPTIONS,
} from '../mock/membership-metrics.mock'
import { useMembershipStore } from '../store/membership-store'
import type { MembershipPlan, MembershipStatus } from '../types/membership'
import { getFeatureLines } from '../utils/membership-format'
import {
  DecisionActionModal,
} from '@/shared/components/modal/decision-action-modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

const STATUS_ROUTE_MAP = {
  active: '/memberships/plans',
  inactive: '/memberships/plans/inactive',
  paused: '/memberships/plans/paused',
  cancelled: '/memberships/plans',
  deleted: '/memberships/plans/deleted',
} as const

type MembershipPlansPageProps = {
  fixedStatus?: MembershipStatus
  title?: string
  subtitle?: string
}

export function MembershipPlansPage({
  fixedStatus,
  title = 'Membership Management',
  subtitle = 'Centralized expert membership system with analytics, plan configuration, and lifecycle controls.',
}: MembershipPlansPageProps) {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [modalType, setModalType] = useState<
    'pause' | 'resume' | 'delete' | 'deactivate' | 'activate' | 'validity' | 'features' | 'versions' | null
  >(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [validityStart, setValidityStart] = useState('')
  const [validityEnd, setValidityEnd] = useState('')

  const { searchQuery, setSearchQuery, activeStatus, setActiveStatus } = useMembershipStore()

  const statusFilter = fixedStatus ?? activeStatus

  const { data, isLoading } = useMemberships({
    search: searchQuery || undefined,
    status: statusFilter,
    limit: 50,
  })

  const pauseMutation = usePauseMembership()
  const resumeMutation = useResumeMembership()
  const deleteMutation = useDeleteMembership()
  const deactivateMutation = useDeactivateMembership()
  const activateMutation = useActivateMembership()
  const validityMutation = useSetMembershipValidity()

  const featuresQuery = useMembershipFeatures(selectedPlan?._id ?? '', modalType === 'features')
  const versionsQuery = useMembershipVersions(selectedPlan?._id ?? '', modalType === 'versions')

  const memberships = data?.data?.memberships ?? []
  const meta = data?.data?.meta
  const counts = meta?.counts ?? {
    active: 0,
    inactive: 0,
    paused: 0,
    cancelled: 0,
    deleted: 0,
    total: 0,
  }

  const statusCards: Array<{
    label: string
    count: number
    color: string
    bg: string
    border: string
    icon: LucideIcon
    status: MembershipStatus
  }> = [
    {
      label: 'Active Plans',
      count: counts.active,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      icon: Hourglass,
      status: 'active',
    },
    {
      label: 'Inactive Plans',
      count: counts.inactive,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
      icon: Ban,
      status: 'inactive',
    },
    {
      label: 'Cancelled Plans',
      count: counts.cancelled,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
      icon: Clock,
      status: 'cancelled',
    },
    {
      label: 'Deleted Plans',
      count: counts.deleted,
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
      border: 'border-slate-400/20',
      icon: Trash2,
      status: 'deleted',
    },
  ]

  const handleStatusCardClick = (status: MembershipStatus) => {
    setActiveStatus(status)

    const route = STATUS_ROUTE_MAP[status]
    if (route && window.location.pathname !== route) {
      navigate(route)
    }
  }

  const selectedStatus = fixedStatus ?? activeStatus
  const totalItems = meta?.total ?? memberships.length
  const page = meta?.page ?? 1
  const limit = meta?.limit ?? 50
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, totalItems)
  const expertPlans = useMemo(
    () => memberships.filter((plan) => plan.type === 'expert'),
    [memberships],
  )

  const openModal = (plan: MembershipPlan, type: NonNullable<typeof modalType>) => {
    setSelectedPlan(plan)
    setModalType(type)
    setAdminNotes('')
    setSelectedReasons([])
    setStartDate('')
    setEndDate('')
    setValidityStart('')
    setValidityEnd('')
  }

  const closeModal = () => {
    setSelectedPlan(null)
    setModalType(null)
  }

  const handlePause = async () => {
    if (!selectedPlan || !startDate || !endDate || !selectedReasons.length) {
      toast.error('Complete pause details')
      return
    }

    try {
      await pauseMutation.mutateAsync({
        id: selectedPlan._id,
        payload: {
          fromDate: startDate,
          toDate: endDate,
          reasons: selectedReasons,
          adminNotes,
          updatedBy: 'Admin',
        },
      })
      toast.success('Plan paused')
      closeModal()
    } catch {
      toast.error('Failed to pause plan')
    }
  }

  const handleResume = async () => {
    if (!selectedPlan) return

    try {
      await resumeMutation.mutateAsync({
        id: selectedPlan._id,
        payload: { adminNotes, updatedBy: 'Admin' },
      })
      toast.success('Plan resumed')
      closeModal()
    } catch {
      toast.error('Failed to resume plan')
    }
  }

  const handleDelete = async () => {
    if (!selectedPlan || !selectedReasons.length) {
      toast.error('Select at least one reason')
      return
    }

    try {
      await deleteMutation.mutateAsync({
        id: selectedPlan._id,
        payload: { reasons: selectedReasons, adminNotes, updatedBy: 'Admin' },
      })
      toast.success('Plan deleted')
      closeModal()
    } catch {
      toast.error('Failed to delete plan')
    }
  }

  const handleDeactivate = async () => {
    if (!selectedPlan) return

    try {
      await deactivateMutation.mutateAsync({
        id: selectedPlan._id,
        payload: { adminNotes, updatedBy: 'Admin' },
      })
      toast.success('Plan deactivated')
      closeModal()
    } catch {
      toast.error('Failed to deactivate plan')
    }
  }

  const handleActivate = async () => {
    if (!selectedPlan) return

    try {
      await activateMutation.mutateAsync({
        id: selectedPlan._id,
        payload: { adminNotes, updatedBy: 'Admin' },
      })
      toast.success('Plan activated')
      closeModal()
    } catch {
      toast.error('Failed to activate plan')
    }
  }

  const handleSetValidity = async () => {
    if (!selectedPlan || !validityStart || !validityEnd) {
      toast.error('Select validity dates')
      return
    }

    try {
      await validityMutation.mutateAsync({
        id: selectedPlan._id,
        payload: {
          startDate: validityStart,
          endDate: validityEnd,
          updatedBy: 'Admin',
        },
      })
      toast.success('Plan validity updated')
      closeModal()
    } catch {
      toast.error('Failed to update validity')
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-400 md:text-base">{subtitle}</p>
        </div>
        <Button
          variant="secondary"
          className="w-full md:w-auto"
          onClick={() => toast.info('Metrics configuration coming soon')}
        >
          <BarChart3 className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <MembershipStatsBar />

      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
          <TabButton active>Membership Plans</TabButton>
          <TabButton onClick={() => navigate('/memberships/experts')}>
            Expert Memberships Management
          </TabButton>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by membership"
            className="border-white/10 bg-black/40 pl-10 text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast.info('Export coming soon')}>
            <Download className="size-4" />
            Export Data
          </Button>
          <Button onClick={() => navigate('/memberships/plans/create')}>
            <Plus className="size-4" />
            Add New Plan
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-400">
          Showing {rangeStart}-{rangeEnd} of {totalItems} plans
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => handleStatusCardClick(card.status)}
              className={cn(
                'flex items-center justify-between rounded-xl border p-4 transition-all hover:scale-[1.02]',
                card.bg,
                card.border,
                selectedStatus === card.status && 'ring-2 ring-amber-400/50',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', card.bg)}>
                  <card.icon className={cn('size-5', card.color)} />
                </div>
                <span className="text-sm font-medium text-slate-300">{card.label}</span>
              </div>
              <span className={cn('text-lg font-bold', card.color)}>
                {String(card.count).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading membership plans...</p>
      ) : !memberships.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111111] px-6 py-12 text-center">
          <p className="text-base font-medium text-white">No membership plans found</p>
          <p className="mt-2 text-sm text-slate-400">
            Create your first plan to start managing memberships.
          </p>
          <Button className="mt-5" onClick={() => navigate('/memberships/plans/create')}>
            <Plus className="size-4" />
            Add New Plan
          </Button>
        </div>
      ) : (
        <>
          <PlanSection
            title="Expert Membership Plans"
            plans={expertPlans}
            onEdit={(plan) => navigate(`/memberships/plans/${plan._id}/edit`)}
            onPause={(plan) => openModal(plan, 'pause')}
            onResume={(plan) => openModal(plan, 'resume')}
            onDelete={(plan) => openModal(plan, 'delete')}
            onDeactivate={(plan) => openModal(plan, 'deactivate')}
            onActivate={(plan) => openModal(plan, 'activate')}
            onViewFeatures={(plan) => openModal(plan, 'features')}
            onViewVersions={(plan) => openModal(plan, 'versions')}
            onSetValidity={(plan) => openModal(plan, 'validity')}
          />
        </>
      )}

      <CreateMembershipModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <DecisionActionModal
        open={modalType === 'pause'}
        variant="suspend"
        title="Pause Plan"
        description={`Are you sure you want to pause "${selectedPlan?.planName}"?`}
        submitLabel="Pause Plan"
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handlePause}
        reasonOptions={PAUSE_REASON_OPTIONS}
        selectedReasons={selectedReasons}
        onReasonToggle={(value) =>
          setSelectedReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showTimeline
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        isSubmitting={pauseMutation.isPending}
      />

      <DecisionActionModal
        open={modalType === 'resume'}
        variant="approve"
        title="Resume Plan"
        description={`Resume "${selectedPlan?.planName}"?`}
        submitLabel="Resume Plan"
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handleResume}
        isSubmitting={resumeMutation.isPending}
      />

      <DecisionActionModal
        open={modalType === 'delete'}
        variant="reject"
        title="Delete Plan"
        description={`Permanently delete "${selectedPlan?.planName}"?`}
        submitLabel="Delete Plan"
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handleDelete}
        reasonOptions={DELETE_REASON_OPTIONS}
        selectedReasons={selectedReasons}
        onReasonToggle={(value) =>
          setSelectedReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        isSubmitting={deleteMutation.isPending}
      />

      <DecisionActionModal
        open={modalType === 'deactivate'}
        variant="suspend"
        title="Deactivate Plan"
        description={`Deactivate "${selectedPlan?.planName}"?`}
        submitLabel="Deactivate Plan"
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handleDeactivate}
        isSubmitting={deactivateMutation.isPending}
      />

      <DecisionActionModal
        open={modalType === 'activate'}
        variant="approve"
        title="Activate Plan"
        description={`Activate "${selectedPlan?.planName}"?`}
        submitLabel="Activate Plan"
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handleActivate}
        isSubmitting={activateMutation.isPending}
      />

      {modalType === 'validity' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6">
            <h3 className="text-lg font-semibold text-white">Set Plan Validity</h3>
            <p className="mt-1 text-xs text-slate-400">{selectedPlan?.planName}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Input type="date" value={validityStart} onChange={(e) => setValidityStart(e.target.value)} />
              <Input type="date" value={validityEnd} onChange={(e) => setValidityEnd(e.target.value)} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSetValidity} disabled={validityMutation.isPending}>
                Save Validity
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {modalType === 'features' ? (
        <InfoModal title="Feature List" onClose={closeModal}>
          <ul className="space-y-2">
            {getFeatureLines(featuresQuery.data?.data?.features ?? selectedPlan?.features ?? {
              accessToBasicNetworkingFeatures: false,
              joinCommunities: { enabled: false, count: 0 },
              platformHostedEvents: { enabled: false, count: 0 },
              profileCustomization: false,
              dedicatedAccountManager: false,
            }).map((feature) => (
              <li key={feature} className="text-sm text-slate-300">• {feature}</li>
            ))}
          </ul>
        </InfoModal>
      ) : null}

      {modalType === 'versions' ? (
        <InfoModal title="Version History" onClose={closeModal}>
          <div className="space-y-3">
            {(versionsQuery.data?.data?.versionHistory ?? []).length ? (
              versionsQuery.data?.data?.versionHistory.map((entry: { version: number; updatedAt?: string; updatedBy?: string }) => (
                <div key={entry.version} className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-300">
                  Version {entry.version} · {entry.updatedBy ?? 'Admin'} · {entry.updatedAt ?? '—'}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No previous versions yet.</p>
            )}
          </div>
        </InfoModal>
      ) : null}
    </div>
  )
}

function PlanSection({
  title,
  plans,
  ...handlers
}: {
  title: string
  plans: MembershipPlan[]
} & Omit<ComponentProps<typeof MembershipPlanCard>, 'plan'>) {
  if (!plans.length) return null

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {plans.map((plan) => (
          <MembershipPlanCard key={plan._id} plan={plan} {...handlers} />
        ))}
      </div>
    </section>
  )
}

function TabButton({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-[#1a1a1a] text-white shadow-sm'
          : 'text-slate-400 hover:text-white',
      )}
    >
      {children}
    </button>
  )
}

function InfoModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
