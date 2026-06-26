import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    CheckSquare,
    ShieldCheck,
    AlertCircle,
    PauseCircle,
    Trash2,
    BarChart3,
    Eye,
    UserPlus,
    ListPlus,
    Bell,
    Archive,
    Mail,
    Image,
    ClipboardCheck,
    LayoutDashboard,
    type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useVenues, useSuspendVenue } from '../../hooks/use-venues'
import { useVenueStore } from '../../store'
import type { Venue, VenueStatus } from '../../type/venue'
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
import {
    formatVenueStatus,
    getVenueApiId,
    getVenueDisplayId,
    getVenueDisplaySpaceId,
    getVenuePartnerId,
    getVenueStatusClassName,
} from '../../utils/venue-list'

const SUSPEND_REASON_OPTIONS: DecisionActionModalOption[] = [
    { label: 'Temporary operational issue', value: 'temporary_operational_issue' },
    { label: 'Scheduled maintenance', value: 'scheduled_maintenance' },
    { label: 'Availability issue', value: 'availability_issue' },
    { label: 'System verification in progress', value: 'system_verification_in_progress' },
    { label: 'Admin review required', value: 'admin_review_required' },
]

export const VenueManagementPage = () => {
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
    const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])

    const [suspendVenueTarget, setSuspendVenueTarget] = useState<Venue | null>(null)
    const [suspendReasons, setSuspendReasons] = useState<string[]>([])
    const [suspendStartDate, setSuspendStartDate] = useState('')
    const [suspendEndDate, setSuspendEndDate] = useState('')
    const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
    const [suspendReasonDetails, setSuspendReasonDetails] = useState('')
    const [suspendAdminNotes, setSuspendAdminNotes] = useState('')

    const suspendVenueMutation = useSuspendVenue()

    const navigate = useNavigate()

    const {
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        activeStatus,
        setActiveStatus,
    } = useVenueStore()

    const { data, isLoading } = useVenues({
        page: currentPage,
        limit: 10,
        status:
            activeStatus !== 'all'
                ? (activeStatus as VenueStatus | 'reported')
                : undefined,
        search: searchQuery,
    })
    const venues = data?.data || []
    const meta = data?.meta
    const visibleVenueIds = useMemo(() => venues.map((venue) => venue._id), [venues])
    const selectedVenueCount = selectedVenueIds.length
    const allVisibleVenuesSelected =
        visibleVenueIds.length > 0 && visibleVenueIds.every((id) => selectedVenueIds.includes(id))
    const someVisibleVenuesSelected = visibleVenueIds.some((id) => selectedVenueIds.includes(id))

    const toggleVisibleVenues = useCallback(() => {
        setSelectedVenueIds((currentIds) => {
            if (allVisibleVenuesSelected) {
                return currentIds.filter((id) => !visibleVenueIds.includes(id))
            }

            return Array.from(new Set([...currentIds, ...visibleVenueIds]))
        })
    }, [allVisibleVenuesSelected, visibleVenueIds])

    const toggleVenueSelection = useCallback((venueId: string) => {
        setSelectedVenueIds((currentIds) =>
            currentIds.includes(venueId)
                ? currentIds.filter((id) => id !== venueId)
                : [...currentIds, venueId],
        )
    }, [])

    const openSuspendModal = useCallback((venue: Venue) => {
        setSuspendVenueTarget(venue)
        setSuspendReasons([])
        setSuspendStartDate('')
        setSuspendEndDate('')
        setSuspendIndefinitely(false)
        setSuspendReasonDetails('')
        setSuspendAdminNotes('')
    }, [])

    const closeSuspendModal = useCallback(() => {
        setSuspendVenueTarget(null)
    }, [])

    const toggleSuspendReason = useCallback((value: string) => {
        setSuspendReasons((current) =>
            current.includes(value)
                ? current.filter((reason) => reason !== value)
                : [...current, value],
        )
    }, [])

    const handleSuspendSubmit = useCallback(() => {
        if (!suspendVenueTarget) return

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

        suspendVenueMutation.mutate(
            {
                venueId: getVenueApiId(suspendVenueTarget),
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
                    toast.success('Venue suspended successfully')
                    closeSuspendModal()
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message || 'Failed to suspend venue. Please try again.',
                    )
                },
            },
        )
    }, [
        closeSuspendModal,
        suspendAdminNotes,
        suspendEndDate,
        suspendIndefinitely,
        suspendReasonDetails,
        suspendReasons,
        suspendStartDate,
        suspendVenueMutation,
        suspendVenueTarget,
    ])
    const counts = {
        approvalsPending: meta?.counts?.approvalsPending ?? 0,
        reportedVenues: meta?.counts?.reportedVenues ?? 0,
        suspendedVenues: meta?.counts?.suspendedVenues ?? 0,
        deletedVenues: meta?.counts?.deletedVenues ?? 0,
    }

    const statusCards: {
        label: string
        count: number
        color: string
        bg: string
        border: string
        icon: LucideIcon
        status: string
    }[] = [
            {
                label: 'Approvals Pending',
                count: counts.approvalsPending,
                color: 'text-amber-400',
                bg: 'bg-amber-400/10',
                border: 'border-amber-400/20',
                icon: ShieldCheck,
                status: 'pending',
            },
            {
                label: 'Reported Venues',
                count: counts.reportedVenues,
                color: 'text-red-400',
                bg: 'bg-red-400/10',
                border: 'border-red-400/20',
                icon: AlertCircle,
                status: 'reported',
            },
            {
                label: 'Suspended Venues',
                count: counts.suspendedVenues,
                color: 'text-purple-400',
                bg: 'bg-purple-400/10',
                border: 'border-purple-400/20',
                icon: PauseCircle,
                status: 'suspended',
            },
            {
                label: 'Deleted Venues',
                count: counts.deletedVenues,
                color: 'text-slate-400',
                bg: 'bg-slate-400/10',
                border: 'border-slate-400/20',
                icon: Trash2,
                status: 'deleted',
            },
        ]

    const columns = useMemo<ColumnDef<Venue>[]>(
        () => [
            {
                id: 'select',
                header: () => (
                    <input
                        type="checkbox"
                        aria-label="Select all venues"
                        checked={allVisibleVenuesSelected}
                        ref={(input) => {
                            if (input) input.indeterminate = someVisibleVenuesSelected && !allVisibleVenuesSelected
                        }}
                        onChange={toggleVisibleVenues}
                        className="rounded border-slate-700 bg-transparent"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        aria-label={`Select ${row.original.venueName}`}
                        checked={selectedVenueIds.includes(row.original._id)}
                        onChange={() => toggleVenueSelection(row.original._id)}
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
                accessorKey: 'venueid',
                header: 'Venue ID',
                cell: ({ row }) => (
                    <span className="font-mono text-xs uppercase">
                        {getVenueDisplayId(row.original)}
                    </span>
                ),
            },
            {
                accessorKey: 'venueName',
                header: 'Venue Name',
                cell: ({ row }) => <span className="font-medium text-white">{row.original.venueName}</span>,
            },
            {
                accessorKey: 'venueCategory',
                header: 'Venue Category',
            },
            {
                accessorKey: 'spaceid',
                header: 'Space ID',
                cell: ({ row }) => (
                    <span className="font-mono text-xs">
                        {getVenueDisplaySpaceId(row.original)}
                    </span>
                ),
            },
            {
                accessorKey: 'spaceName',
                header: 'Space Name',
                cell: ({ row }) => row.original.spaceName || '—',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span className={getVenueStatusClassName(row.original.status)}>
                        {formatVenueStatus(row.original.status)}
                    </span>
                ),
            },
            {
                accessorKey: 'eventType',
                header: 'Event Type',
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => {
                    if (!row.original.createdAt) return '—'
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
                id: 'actions',
                header: 'Actions',
                meta: {
                    headerClassName: 'pr-5 text-right',
                    cellClassName: 'relative pr-5 text-right',
                },
                cell: ({ row }) => {
                    const venue = row.original
                    const isOpen = activeDropdownId === venue._id

                    return (
                        <TableActionsDropdown
                            label={`Open actions for ${venue.venueName}`}
                            isOpen={isOpen}
                            onOpenChange={(open) => setActiveDropdownId(open ? venue._id : null)}
                        >
                            <TableActionsItem
                                icon={<Eye className="size-3.5" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(
                                        `/venues/management/create?venueId=${getVenueApiId(venue)}&view=true`,
                                    )
                                }}
                            >
                                View Details
                            </TableActionsItem>

                            <TableActionsItem
                                icon={<ClipboardCheck className="size-3.5" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(
                                        `/venues/management/application/${getVenueApiId(venue)}`,
                                    )
                                }}
                            >
                                View Application
                            </TableActionsItem>

                            <TableActionsItem
                                icon={<LayoutDashboard className="size-3.5" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(
                                        `/venues/management/profile/${getVenueApiId(venue)}`,
                                    )
                                }}
                            >
                                Profile View
                            </TableActionsItem>

                            <TableActionsItem
                                icon={<UserPlus className="size-3.5" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    const partnerId = getVenuePartnerId(venue)

                                    if (!partnerId) {
                                        toast.error('Partner ID not found for this venue.')
                                        return
                                    }

                                    const params = new URLSearchParams({
                                        partnerId,
                                        venueId: getVenueApiId(venue),
                                    })
                                    navigate(`/venues/management/onboarding?${params.toString()}`)
                                }}
                            >
                                Create Profile
                            </TableActionsItem>

                            <TableActionsItem
                                icon={<ListPlus className="size-3.5" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    const partnerId = getVenuePartnerId(venue)
                                    const params = new URLSearchParams({
                                        venueId: getVenueApiId(venue),
                                    })
                                    if (partnerId) params.set('partnerId', partnerId)
                                    navigate(`/venues/management/create?${params.toString()}`)
                                }}
                            >
                                Venue Listing
                            </TableActionsItem>

                            <TableActionsItem
                                icon={<PauseCircle className="size-3.5" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    openSuspendModal(venue)
                                }}
                            >
                                Suspend Venue
                            </TableActionsItem>
                        </TableActionsDropdown>
                    )
                },
            },
        ],
        [
            activeDropdownId,
            allVisibleVenuesSelected,
            navigate,
            openSuspendModal,
            selectedVenueIds,
            someVisibleVenuesSelected,
            toggleVenueSelection,
            toggleVisibleVenues,
        ],
    )

    const bulkActions = [
        { label: 'Delete selected venues', icon: Trash2 },
        { label: 'Manage selected venue media', icon: Image },
        { label: 'Archive selected venues', icon: Archive },
        { label: 'Review selected venues', icon: ShieldCheck },
        { label: 'Notify selected owners', icon: Bell },
        { label: 'Message selected owners', icon: Mail },
        { label: 'Suspend selected venues', icon: PauseCircle },
    ]

    return (
        <div className="flex flex-col gap-4 p-0 md:gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Venue Management</h1>
                    <p className="mt-1 text-sm text-slate-400 md:text-base">
                        Manage venue listings, approvals and venue details
                    </p>
                </div>
                <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
                    <Button className="w-full gap-2 bg-amber-400 font-semibold text-black hover:bg-amber-500 md:w-auto">
                        <BarChart3 className="size-4" />
                        Manage Metrics
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
                                navigate('/venues/management/pending')
                                return
                            }
                            if (card.status === 'suspended') {
                                navigate('/venues/management/suspended')
                                return
                            }
                            setActiveStatus(activeStatus === card.status ? 'all' : card.status)
                        }}
                        className={cn(
                            'flex min-w-[220px] flex-1 items-center justify-between rounded-xl border p-4 transition-all hover:scale-[1.02]',
                            card.bg,
                            card.border,
                            activeStatus === card.status && 'ring-2 ring-amber-400/50',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn('rounded-lg p-2', card.bg)}>
                                <card.icon className={cn('size-5', card.color)} />
                            </div>
                            <span className="text-sm font-medium text-slate-300">{card.label}</span>
                        </div>
                        <span className={cn('text-lg font-bold', card.color)}>
                            {String(card.count ?? 0).padStart(2, '0')}
                        </span>
                    </button>
                ))}
            </div>

            {selectedVenueCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <CheckSquare className="size-3.5" aria-hidden="true" />
                        <span>
                            {selectedVenueCount} {selectedVenueCount === 1 ? 'Venue' : 'Venues'} Selected
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
                data={venues}
                getRowId={(venue) => venue._id}
                isLoading={isLoading}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by venue name or venue ID"
                onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
                onExport={() => toast.message('Venue export is coming soon')}
                pagination={{
                    page: currentPage,
                    pageSize: meta?.pagination.limit || 10,
                    totalItems: meta?.pagination.total || 0,
                    totalPages: meta?.pagination.pages || 1,
                    onPageChange: setCurrentPage,
                }}
                resourceLabel="venues"
                emptyMessage="No venues found."
            />

            <DecisionActionModal
                open={Boolean(suspendVenueTarget)}
                variant="suspend"
                title="Suspend Venue"
                description="Are you sure you want to suspend this venue? This action will prevent new bookings and notify existing customers."
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
                isSubmitting={suspendVenueMutation.isPending}
            />
        </div>
    )
}