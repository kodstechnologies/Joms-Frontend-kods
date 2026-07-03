import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    AlertCircle,
    Ban,
    BarChart3,
    Bell,
    CheckSquare,
    Hourglass,
    Mail,
    PauseCircle,
    Plus,
    ShieldCheck,
    Trash2,
    User,
    type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useDeactivateExpert, useExperts, useSuspendExpert } from '../../hooks/use-expert'
import { ADMIN_DELETE_REASON_OPTIONS } from '../../constants/soft-delete'
import { useExpertStore } from '../../store/expert-store'
import type { Expert } from '../../type/expert'
import { DataTable } from '@/shared/components/table/data-table'
import {
    TableActionsDropdown,
    TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import {
    DecisionActionModal,
    type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const ACTION_MENU_CLASS = 'border border-slate-200 bg-white shadow-xl'
const ACTION_ITEM_CLASS =
    'text-slate-800 hover:bg-slate-100 hover:text-slate-900'

const SUSPEND_REASON_OPTIONS: DecisionActionModalOption[] = [
    { label: 'Policy violation', value: 'policy_violation' },
    { label: 'Temporary operational issue', value: 'temporary_operational_issue' },
    { label: 'Quality concern', value: 'quality_concern' },
    { label: 'System verification in progress', value: 'system_verification_in_progress' },
    { label: 'Admin review required', value: 'admin_review_required' },
]

const displayValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'string' && value.trim() === '') return 'N/A'
    return String(value)
}

export const ExpertManagementPage = () => {
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
    const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([])
    const [suspendExpertTarget, setSuspendExpertTarget] = useState<Expert | null>(null)
    const [deleteExpertTarget, setDeleteExpertTarget] = useState<Expert | null>(null)
    const [suspendReasons, setSuspendReasons] = useState<string[]>([])
    const [suspendStartDate, setSuspendStartDate] = useState('')
    const [suspendEndDate, setSuspendEndDate] = useState('')
    const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
    const [suspendReasonDetails, setSuspendReasonDetails] = useState('')
    const [suspendAdminNotes, setSuspendAdminNotes] = useState('')
    const [deleteReasons, setDeleteReasons] = useState<string[]>([])
    const [deleteReason, setDeleteReason] = useState('')
    const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
    const navigate = useNavigate()
    const suspendExpertMutation = useSuspendExpert()
    const deactivateExpertMutation = useDeactivateExpert()
    const {
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        activeStatus,
    } = useExpertStore()

    const { data, isLoading } = useExperts({
        page: currentPage,
        limit: 10,
        status: activeStatus !== 'all' ? activeStatus : undefined,
        search: searchQuery,
        serviceType: 'concierge',
    })
    const experts = data?.data || []
    const meta = data?.meta
    const visibleExpertIds = useMemo(
        () => experts.map((expert) => expert.expertId),
        [experts]
    )
    const selectedExpertCount = selectedExpertIds.length
    const allVisibleExpertsSelected =
        visibleExpertIds.length > 0 && visibleExpertIds.every((id) => selectedExpertIds.includes(id))
    const someVisibleExpertsSelected = visibleExpertIds.some((id) => selectedExpertIds.includes(id))
    const counts = meta?.counts || {
        approvalsPending: 0,
        reportedExperts: 0,
        suspendedExperts: 0,
        deletedExperts: 0,
    }

    const toggleVisibleexperts = useCallback(() => {
        setSelectedExpertIds((currentIds) => {
            if (allVisibleExpertsSelected) {
                return currentIds.filter((id) => !visibleExpertIds.includes(id))
            }

            return Array.from(new Set([...currentIds, ...visibleExpertIds]))
        })
    }, [allVisibleExpertsSelected, visibleExpertIds])

    const toggleExpertSelection = useCallback((serviceId: string) => {
        setSelectedExpertIds((currentIds) =>
            currentIds.includes(serviceId)
                ? currentIds.filter((id) => id !== serviceId)
                : [...currentIds, serviceId],
        )
    }, [])

    const openSuspendModal = useCallback((expert: Expert) => {
        setSuspendExpertTarget(expert)
        setSuspendReasons([])
        setSuspendStartDate('')
        setSuspendEndDate('')
        setSuspendIndefinitely(false)
        setSuspendReasonDetails('')
        setSuspendAdminNotes('')
    }, [])

    const closeSuspendModal = useCallback(() => {
        setSuspendExpertTarget(null)
    }, [])

    const openDeleteModal = useCallback((expert: Expert) => {
        setDeleteExpertTarget(expert)
        setDeleteReasons([])
        setDeleteReason('')
        setDeleteAdminNotes('')
    }, [])

    const closeDeleteModal = useCallback(() => {
        setDeleteExpertTarget(null)
        setDeleteReasons([])
    }, [])

    const toggleDeleteReason = useCallback((value: string) => {
        setDeleteReasons((current) =>
            current.includes(value)
                ? current.filter((reason) => reason !== value)
                : [...current, value],
        )
    }, [])

    const toggleSuspendReason = useCallback((value: string) => {
        setSuspendReasons((current) =>
            current.includes(value)
                ? current.filter((reason) => reason !== value)
                : [...current, value],
        )
    }, [])

    const handleSuspendSubmit = useCallback(() => {
        if (!suspendExpertTarget) return

        if (suspendReasons.length === 0) {
            toast.error('Please select at least one reason.')
            return
        }

        if (!suspendIndefinitely && (!suspendStartDate || !suspendEndDate)) {
            toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
            return
        }

        if (!suspendAdminNotes.trim()) {
            toast.error('Admin notes are required.')
            return
        }

        const toIso = (value: string) =>
            value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

        suspendExpertMutation.mutate(
            {
                id: suspendExpertTarget.id,
                payload: {
                    selectedReasons: suspendReasons,
                    suspendIndefinitely,
                    startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
                    endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
                    reasonDetails: suspendReasonDetails.trim(),
                    adminNotes: suspendAdminNotes.trim(),
                },
            },
            {
                onSuccess: () => {
                    toast.success('Expert suspended successfully')
                    closeSuspendModal()
                },
                onError: (error: unknown) => {
                    const err = error as { response?: { data?: { message?: string } } }
                    toast.error(
                        err?.response?.data?.message || 'Failed to suspend expert. Please try again.',
                    )
                },
            },
        )
    }, [
        closeSuspendModal,
        suspendAdminNotes,
        suspendEndDate,
        suspendIndefinitely,
        suspendExpertMutation,
        suspendExpertTarget,
        suspendReasonDetails,
        suspendReasons,
        suspendStartDate,
    ])

    const handleDeleteSubmit = useCallback(() => {
        if (!deleteExpertTarget) return

        if (deleteReasons.length === 0) {
            toast.error('Please select at least one reason.')
            return
        }

        if (!deleteAdminNotes.trim()) {
            toast.error('Admin notes are required.')
            return
        }

        deactivateExpertMutation.mutate(
            {
                id: deleteExpertTarget.id,
                payload: {
                    selectedReasons: deleteReasons,
                    reasonDetails: deleteReason.trim(),
                    adminNotes: deleteAdminNotes.trim(),
                },
            },
            {
                onSuccess: () => {
                    toast.success('Expert deleted successfully')
                    closeDeleteModal()
                },
                onError: (error: unknown) => {
                    const err = error as { response?: { data?: { message?: string } } }
                    toast.error(
                        err?.response?.data?.message || 'Failed to delete expert. Please try again.',
                    )
                },
            },
        )
    }, [
        closeDeleteModal,
        deactivateExpertMutation,
        deleteAdminNotes,
        deleteExpertTarget,
        deleteReason,
        deleteReasons,
    ])

    const columns = useMemo<ColumnDef<Expert>[]>(
        () => [
            {
                id: 'select',
                header: () => (
                    <input
                        type="checkbox"
                        aria-label="Select all services"
                        checked={allVisibleExpertsSelected}
                        ref={(input) => {
                            if (input) input.indeterminate = someVisibleExpertsSelected && !allVisibleExpertsSelected
                        }}
                        onChange={toggleVisibleexperts}
                        className="rounded border-slate-700 bg-transparent"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        aria-label={`Select ${row.original.name}`}
                        checked={selectedExpertIds.includes(row.original.expertId)}
                        onChange={() => toggleExpertSelection(row.original.expertId)}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded border-slate-700 bg-transparent"
                    />
                ),
                meta: {
                    headerClassName: 'pl-5',
                    cellClassName: 'pl-5',
                },
            },
            {
                accessorKey: 'expertId',
                header: 'Expert ID',
                cell: ({ row }) => (
                    <span className="font-mono text-xs uppercase">
                        {displayValue(row.original.expertId)}
                    </span>
                ),
            },

            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => (
                    <span className="font-medium text-white">
                        {displayValue(row.original.name)}
                    </span>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email ID',
                cell: ({ row }) => displayValue(row.original.email),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = (row.original.status || '').toLowerCase()
                    const isActive = status === 'active'

                    return (
                        <span
                            className={cn(
                                'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                                isActive
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-slate-500/10 text-slate-400',
                            )}
                        >
                            {displayValue(row.original.status)}
                        </span>
                    )
                },
            },
            {
                accessorKey: 'serviceType',
                header: 'Service Type',
                cell: ({ row }) => displayValue(row.original.serviceType),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => {
                    if (!row.original.createdAt) return 'N/A'
                    const createdAt = new Date(row.original.createdAt)

                    return (
                        <div className="flex flex-col">
                            <span>
                                {createdAt.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                {createdAt.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    )
                },
            },
            {
                accessorKey: 'lastActive',
                header: 'Last Active',
                cell: ({ row }) => {
                    if (!row.original.lastActive) return 'N/A'
                    const lastActive = new Date(row.original.lastActive)

                    return (
                        <div className="flex flex-col">
                            <span>
                                {lastActive.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                {lastActive.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    )
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                meta: {
                    headerClassName: 'pr-5 text-right',
                    cellClassName: 'relative pr-5 text-right',
                },
                cell: ({ row }) => {
                    const expert = row.original
                    const isOpen = activeDropdownId === expert.expertId

                    return (
                        <TableActionsDropdown
                            label={`Open actions for ${expert.name}`}
                            isOpen={isOpen}
                            onOpenChange={(open) => setActiveDropdownId(open ? expert.expertId : null)}
                            menuWidth={220}
                            menuClassName={ACTION_MENU_CLASS}
                        >
                            <TableActionsItem
                                icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
                                className={ACTION_ITEM_CLASS}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(`/experts/management/profile/${expert.id}`)
                                }}
                            >
                                View Profile
                            </TableActionsItem>
                            <TableActionsItem
                                icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
                                className={ACTION_ITEM_CLASS}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    toast.message('View Payout History is coming soon')
                                }}
                            >
                                View Payout History
                            </TableActionsItem>
                            <TableActionsItem
                                icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
                                className={ACTION_ITEM_CLASS}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    openSuspendModal(expert)
                                }}
                            >
                                Suspend Expert
                            </TableActionsItem>
                            <TableActionsItem
                                icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
                                className={ACTION_ITEM_CLASS}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    openDeleteModal(expert)
                                }}
                            >
                                Delete Expert
                            </TableActionsItem>
                            <TableActionsItem
                                icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
                                className={ACTION_ITEM_CLASS}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    toast.message('Report Expert is coming soon')
                                }}
                            >
                                Report Expert
                            </TableActionsItem>
                        </TableActionsDropdown>
                    )
                },
            },
        ],
        [
            activeDropdownId,
            allVisibleExpertsSelected,
            navigate,
            openDeleteModal,
            openSuspendModal,
            selectedExpertIds,
            someVisibleExpertsSelected,
            toggleExpertSelection,
            toggleVisibleexperts,
        ],
    )

    const bulkActions = [
        { label: 'Delete selected experts', icon: Trash2 },
        { label: 'Suspend selected experts', icon: PauseCircle },
        { label: 'Notify selected experts', icon: Bell },
        { label: 'Message selected experts', icon: Mail },
        { label: 'Review selected experts', icon: ShieldCheck },
    ]

    const statusCards: {
        label: string
        count: number
        gradient: string
        border: string
        icon: LucideIcon
        status: string
    }[] = [
            {
                label: 'Approvals Pending',
                count: counts.approvalsPending,
                gradient: 'bg-gradient-to-r from-amber-700/55 to-transparent',
                border: 'border-amber-600/60',
                icon: Hourglass,
                status: 'pending',
            },
            {
                label: 'Reported Experts',
                count: counts.reportedExperts,
                gradient: 'bg-gradient-to-r from-red-800/55 to-transparent',
                border: 'border-red-800/60',
                icon: AlertCircle,
                status: 'reported',
            },
            {
                label: 'Suspended Experts',
                count: counts.suspendedExperts,
                gradient: 'bg-gradient-to-r from-red-800/55 to-transparent',
                border: 'border-red-800/60',
                icon: Ban,
                status: 'suspended',
            },
            {
                label: 'Deleted Experts',
                count: counts.deletedExperts,
                gradient: 'bg-gradient-to-r from-red-800/55 to-transparent',
                border: 'border-red-800/60',
                icon: Trash2,
                status: 'deactivated',
            },
        ]

    return (
        <div className="flex flex-col gap-4 p-0 md:gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">
                        Expert Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-400 md:text-base">
                        Comprehensive user data and admin controls
                    </p>
                </div>
                <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
                    <Button
                        variant="secondary"
                        className="w-full md:w-auto"
                        onClick={() => navigate('/experts/dashboard/metrics')}
                    >
                        <BarChart3 className="size-4" />
                        Manage Metrics
                    </Button>

                    <Button
                        className="w-full md:w-auto"
                        onClick={() => navigate('/experts/management/create')}
                    >
                        <Plus className="size-4" />
                        Create Account
                    </Button>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 md:gap-4">
                {statusCards.map((card) => (
                    <button
                        key={card.label}
                        type="button"
                        onClick={() => {
                            if (card.status === 'pending') {
                                navigate('/experts/pending-approvals')
                                return
                            }
                            if (card.status === 'suspended') {
                                navigate('/experts/suspended')
                                return
                            }

                            if (card.status === 'reported') {
                                navigate('/experts/reported')
                                return
                            }

                            if (card.status === 'deactivated') {
                                navigate('/experts/deleted')
                                return
                            }
                        }}
                        className={cn(
                            'flex min-w-[220px] flex-1 items-center justify-between gap-3 rounded-xl border p-4 transition-all hover:brightness-110',
                            card.gradient,
                            card.border,
                            activeStatus === card.status && 'ring-2 ring-amber-400/50',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <card.icon className="size-5 text-white" />
                            <span className="text-sm font-medium text-white">{card.label}</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                            {String(card.count ?? 0).padStart(2, '0')}
                        </span>
                    </button>
                ))}
            </div>

            {selectedExpertCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <CheckSquare className="size-3.5" aria-hidden="true" />
                        <span>
                            {selectedExpertCount} {selectedExpertCount === 1 ? 'Expert' : 'Experts'} Selected
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {bulkActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                aria-label={action.label}
                                onClick={() => toast.message(`${action.label} action is coming soon`)}
                                className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
                            >
                                <action.icon className="size-3.5" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <DataTable
                columns={columns}
                data={experts}
                getRowId={(expert) => expert.expertId}
                isLoading={isLoading}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or expert ID"
                onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
                onExport={() => toast.message('Expert export is coming soon')}
                pagination={{
                    page: currentPage,
                    pageSize: meta?.pagination.limit || 10,
                    totalItems: meta?.pagination.total || 0,
                    totalPages: meta?.pagination.pages || 1,
                    onPageChange: setCurrentPage,
                }}
                resourceLabel="experts"
                emptyMessage="No experts found."
            />

            <DecisionActionModal
                open={Boolean(suspendExpertTarget)}
                variant="suspend"
                title="Suspend Expert"
                description="Are you sure you want to suspend this expert? This action will restrict their account access and hide their services."
                submitLabel="Suspend"
                reasonOptions={SUSPEND_REASON_OPTIONS}
                selectedReasons={suspendReasons}
                onReasonToggle={toggleSuspendReason}
                showTimeline
                startDate={suspendStartDate}
                onStartDateChange={setSuspendStartDate}
                endDate={suspendEndDate}
                onEndDateChange={setSuspendEndDate}
                indefinite={suspendIndefinitely}
                onIndefiniteChange={setSuspendIndefinitely}
                reason={suspendReasonDetails}
                onReasonChange={setSuspendReasonDetails}
                adminNotes={suspendAdminNotes}
                onAdminNotesChange={setSuspendAdminNotes}
                onClose={closeSuspendModal}
                onSubmit={handleSuspendSubmit}
                isSubmitting={suspendExpertMutation.isPending}
            />

            <DecisionActionModal
                open={Boolean(deleteExpertTarget)}
                variant="reject"
                title="Delete Expert"
                description="Are you sure you want to delete this user? This will result in removal of the account after 21 days unless restored."
                submitLabel="Delete Expert"
                reasonOptions={ADMIN_DELETE_REASON_OPTIONS}
                selectedReasons={deleteReasons}
                onReasonToggle={toggleDeleteReason}
                reason={deleteReason}
                onReasonChange={setDeleteReason}
                adminNotes={deleteAdminNotes}
                onAdminNotesChange={setDeleteAdminNotes}
                onClose={closeDeleteModal}
                onSubmit={handleDeleteSubmit}
                isSubmitting={deactivateExpertMutation.isPending}
            />
        </div>
    )
}
