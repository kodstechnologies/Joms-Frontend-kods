import {
  AlertCircle,
  Ban,
  BarChart3,
  Download,
  Hourglass,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'

import { CreateMembershipModal } from '../components/create-membership-modal'
import { MembershipPlanCard } from '../components/membership-plan-card'
import {
  DeletePlanModal,
  PausePlanModal,
  ResumePlanModal,
} from '../components/membership-plan-lifecycle-modals'
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
import { useMembershipStore } from '../store/membership-store'
import type { MembershipPlan, MembershipStatus } from '../types/membership'
import { getFeatureLines } from '../utils/membership-format'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { statusCardTones } from '@/shared/lib/design-tokens'

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
  subtitle = 'Centralized expert membership system with analytics, plan configuration, and lifecycle controls',
}: MembershipPlansPageProps) {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [modalType, setModalType] = useState<
    | 'pause'
    | 'resume'
    | 'delete'
    | 'deactivate'
    | 'activate'
    | 'validity'
    | 'features'
    | 'versions'
    | null
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

  const memberships = useMemo(() => data?.data?.memberships ?? [], [data?.data?.memberships])
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
    tone: 'gold' | 'danger'
    icon: LucideIcon
    status: MembershipStatus
  }> = [
    {
      label: 'Active Plans',
      count: counts.active,
      tone: 'gold',
      icon: Hourglass,
      status: 'active',
    },
    {
      label: 'Inactive Plans',
      count: counts.inactive,
      tone: 'danger',
      icon: Ban,
      status: 'inactive',
    },
    {
      label: 'Cancelled Plans',
      count: counts.cancelled,
      tone: 'danger',
      icon: AlertCircle,
      status: 'cancelled',
    },
    {
      label: 'Deleted Plans',
      count: counts.deleted,
      tone: 'danger',
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
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="max-w-3xl">
          <h1 className="text-h1 text-brand-text tracking-tight">{title}</h1>
          <p className="text-body-md text-muted mt-2 leading-relaxed">{subtitle}</p>
        </div>
        <Button
          className="ui-manage-metrics ui-cta ui-cta-primary w-full shrink-0 md:w-auto"
          onClick={() => toast.info('Metrics configuration coming soon')}
        >
          <BarChart3 className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <MembershipStatsBar />

      <div className="flex justify-center">
        <div className="bg-brand-bg inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/10 p-1">
          <TabButton active>Membership Plans</TabButton>
          <TabButton onClick={() => navigate('/memberships/experts')}>
            Expert Memberships Management
          </TabButton>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by membership"
            className="bg-brand-bg text-body-md placeholder:text-muted h-11 rounded-full border-white/10 pl-11 text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button className="ui-export-data" onClick={() => toast.info('Export coming soon')}>
            <Download className="size-4" />
            Export Data
          </Button>
          <Button className="ui-cta ui-cta-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add New Plan
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-body-md text-muted">
          Showing{' '}
          <span className="font-semibold text-white">
            {rangeStart}-{rangeEnd}
          </span>{' '}
          of <span className="font-semibold text-white">{totalItems}</span> users
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((card) => {
            const isSelected = selectedStatus === card.status
            const isGold = card.tone === 'gold'

            return (
              <button
                key={card.label}
                type="button"
                onClick={() => handleStatusCardClick(card.status)}
                className={cn(
                  'flex items-center justify-between rounded-[10px] border px-4 py-3.5 text-white transition-all',
                  isGold
                    ? `${statusCardTones.warning.background} ${statusCardTones.warning.border}`
                    : `${statusCardTones.danger.background} ${statusCardTones.danger.border}`,
                  isSelected &&
                    (isGold ? 'ring-brand-accent/50 ring-2' : 'ring-brand-danger/50 ring-2'),
                )}
              >
                <div className="flex items-center gap-3">
                  <card.icon className="size-5 shrink-0" strokeWidth={1.75} />
                  <span className="text-body-md-medium">{card.label}</span>
                </div>
                <span className="text-body-lg font-bold tabular-nums">
                  {String(card.count).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <p className="text-body-md text-muted">Loading membership plans...</p>
      ) : !memberships.length ? (
        <div className="bg-brand-bg rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
          <p className="text-body-lg font-medium text-white">No membership plans found</p>
          <p className="text-body-md text-muted mt-2">
            Create your first plan to start managing memberships.
          </p>
          <Button className="ui-cta ui-cta-primary mt-5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add New Plan
          </Button>
        </div>
      ) : (
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
      )}

      <CreateMembershipModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <PausePlanModal
        open={modalType === 'pause'}
        plan={selectedPlan}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        selectedReasons={selectedReasons}
        onReasonToggle={(value) =>
          setSelectedReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onClose={closeModal}
        onSubmit={handlePause}
        isSubmitting={pauseMutation.isPending}
      />

      <ResumePlanModal
        open={modalType === 'resume'}
        plan={selectedPlan}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handleResume}
        isSubmitting={resumeMutation.isPending}
      />

      <DeletePlanModal
        open={modalType === 'delete'}
        plan={selectedPlan}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        selectedReasons={selectedReasons}
        onReasonToggle={(value) =>
          setSelectedReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        onClose={closeModal}
        onSubmit={handleDelete}
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
          <div className="ui-modal-shell max-w-md">
            <div className="ui-modal-header">
              <div>
                <h3 className="text-h4 text-brand-text">Set Plan Validity</h3>
                <p className="text-body-sm text-muted mt-1">{selectedPlan?.planName}</p>
              </div>
            </div>
            <div className="ui-modal-body">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={validityStart}
                  onChange={(e) => setValidityStart(e.target.value)}
                />
                <Input
                  type="date"
                  value={validityEnd}
                  onChange={(e) => setValidityEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="ui-modal-footer">
              <Button
                variant="secondary"
                onClick={closeModal}
                className="ui-modal-btn ui-modal-btn-cancel"
              >
                Cancel
              </Button>
              <Button
                className="ui-modal-btn ui-modal-btn-gold"
                onClick={handleSetValidity}
                disabled={validityMutation.isPending}
              >
                Save Validity
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {modalType === 'features' ? (
        <InfoModal title="Feature List" onClose={closeModal}>
          <ul className="space-y-2">
            {getFeatureLines(
              featuresQuery.data?.data?.features ??
                selectedPlan?.features ?? {
                  accessToBasicNetworkingFeatures: false,
                  joinCommunities: { enabled: false, count: 0 },
                  platformHostedEvents: { enabled: false, count: 0 },
                  profileCustomization: false,
                  dedicatedAccountManager: false,
                },
            ).map((feature) => (
              <li key={feature} className="text-body-md text-brand-text/80">
                • {feature}
              </li>
            ))}
          </ul>
        </InfoModal>
      ) : null}

      {modalType === 'versions' ? (
        <InfoModal title="Version History" onClose={closeModal}>
          <div className="space-y-3">
            {(versionsQuery.data?.data?.versionHistory ?? []).length ? (
              versionsQuery.data?.data?.versionHistory.map(
                (entry: { version: number; updatedAt?: string; updatedBy?: string }) => (
                  <div
                    key={entry.version}
                    className="text-body-md text-brand-text/80 rounded-lg border border-white/10 bg-black/30 p-3"
                  >
                    Version {entry.version} · {entry.updatedBy ?? 'Admin'} ·{' '}
                    {entry.updatedAt ?? '—'}
                  </div>
                ),
              )
            ) : (
              <p className="text-body-md text-muted">No previous versions yet.</p>
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
      <h2 className="text-h4 text-white">{title}</h2>
      <div className="grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        'text-body-md-medium rounded-lg px-5 py-2.5 transition-colors',
        active ? 'bg-black text-white shadow-sm' : 'text-muted hover:text-white',
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
      <div className="ui-modal-shell max-w-lg">
        <div className="ui-modal-header">
          <h3 className="text-h4 text-brand-text">{title}</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            Close
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  )
}
