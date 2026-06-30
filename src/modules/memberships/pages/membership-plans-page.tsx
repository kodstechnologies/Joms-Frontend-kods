import { Download, Plus, Search } from 'lucide-react'
import { useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { CreateMembershipModal } from '../components/create-membership-modal'
import { MembershipPlanCard } from '../components/membership-plan-card'
import { MembershipPlanStatsBar, MembershipStatsBar } from '../components/membership-stats-bar'
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
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import {
  DecisionActionModal,
} from '@/shared/components/modal/decision-action-modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

const STATUS_FILTERS: Array<{ key: MembershipStatus | 'all'; label: string; to?: string }> = [
  { key: 'all', label: 'Active Plans' },
  { key: 'inactive', label: 'Inactive Plans', to: '/memberships/plans/inactive' },
  { key: 'cancelled', label: 'Cancelled Plans' },
  { key: 'deleted', label: 'Deleted Plans', to: '/memberships/plans/deleted' },
]

type MembershipPlansPageProps = {
  fixedStatus?: MembershipStatus
  title?: string
  subtitle?: string
}

export function MembershipPlansPage({
  fixedStatus,
  title = 'Membership Management',
  subtitle = 'Centralized membership system supporting User App and Expert App with analytics, plan configuration, and lifecycle controls.',
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

  const statusFilter = fixedStatus ?? (activeStatus === 'all' ? undefined : activeStatus)

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
  const userPlans = useMemo(
    () => memberships.filter((plan) => plan.type === 'user'),
    [memberships],
  )
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
    <div className="space-y-6">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actions={[
          {
            label: 'Manage Metrics',
            onClick: () => toast.info('Metrics configuration coming soon'),
          },
        ]}
      />

      <MembershipStatsBar />
      <MembershipPlanStatsBar />

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <TabButton active>Membership Plans</TabButton>
        <TabButton onClick={() => toast.info('Users memberships management is not available')}>
          Users Memberships Management
        </TabButton>
        <TabButton onClick={() => navigate('/memberships/experts')}>
          Expert Memberships Management
        </TabButton>
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
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add New Plan
          </Button>
        </div>
      </div>

      {!fixedStatus ? (
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => {
                if (filter.to) {
                  navigate(filter.to)
                  return
                }
                setActiveStatus(filter.key)
              }}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                activeStatus === filter.key
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                  : 'border-white/10 text-slate-400 hover:text-white',
              )}
            >
              {filter.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate('/memberships/plans/paused')}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Paused Plans
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading membership plans...</p>
      ) : (
        <>
          <PlanSection
            title="Users Membership Plans"
            plans={userPlans}
            onPause={(plan) => openModal(plan, 'pause')}
            onResume={(plan) => openModal(plan, 'resume')}
            onDelete={(plan) => openModal(plan, 'delete')}
            onDeactivate={(plan) => openModal(plan, 'deactivate')}
            onActivate={(plan) => openModal(plan, 'activate')}
            onViewFeatures={(plan) => openModal(plan, 'features')}
            onViewVersions={(plan) => openModal(plan, 'versions')}
            onSetValidity={(plan) => openModal(plan, 'validity')}
          />
          <PlanSection
            title="Experts Membership Plans"
            plans={expertPlans}
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
        'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-amber-400/10 text-amber-200' : 'text-slate-400 hover:text-white',
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
