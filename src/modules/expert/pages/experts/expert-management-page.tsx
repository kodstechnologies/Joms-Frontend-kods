import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    AlertCircle,
    Ban,
    BarChart3,
    Bell,
    CheckSquare,
    Eye,
    Hourglass,
    Mail,
    PauseCircle,
    Plus,
    ShieldCheck,
    Trash2,
    UserPlus,
    ListPlus,
    type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useExperts } from '../../hooks/use-expert'
import { useExpertStore } from '../../store/expert-store'
import type { Expert } from '../../type/expert'
import { DataTable } from '@/shared/components/table/data-table'
import {
    TableActionsDropdown,
    TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const displayValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'string' && value.trim() === '') return 'N/A'
    return String(value)
}

export const ExpertManagementPage = () => {
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
    const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([])
    const navigate = useNavigate()
    const {
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        activeStatus,
        setActiveStatus,
    } = useExpertStore()

    const { data, isLoading } = useExperts({
        page: currentPage,
        limit: 10,
        status: activeStatus !== 'all' ? activeStatus : undefined,
        search: searchQuery,
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
                cell: ({ row }) => displayValue(row.original.lastActive),
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
                            menuWidth={192}
                        >
                            <TableActionsItem
                                icon={<Eye className="size-3.5" aria-hidden="true" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(`/experts/management/application/${expert.expertId}`)
                                }}
                            >
                                Application View
                            </TableActionsItem>
                            <TableActionsItem
                                icon={<UserPlus className="size-3.5" aria-hidden="true" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(
                                        `/venues/management/onboarding?partnerId=${encodeURIComponent(expert.expertId)}`,
                                    )
                                }}
                            >
                                Create Profile
                            </TableActionsItem>
                            <TableActionsItem
                                icon={<ListPlus className="size-3.5" aria-hidden="true" />}
                                onClick={() => {
                                    setActiveDropdownId(null)
                                    navigate(
                                        `/venues/management/create?partnerId=${encodeURIComponent(expert.expertId)}`,
                                    )
                                }}
                            >
                                Venue Listing
                            </TableActionsItem>
                            <TableActionsItem onClick={() => setActiveDropdownId(null)}>
                                View Payout History
                            </TableActionsItem>
                            <TableActionsItem onClick={() => setActiveDropdownId(null)}>
                                Suspend Expert
                            </TableActionsItem>
                            <TableActionsItem onClick={() => setActiveDropdownId(null)}>
                                Delete Expert
                            </TableActionsItem>
                            <TableActionsItem onClick={() => setActiveDropdownId(null)}>
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
                    <Button variant="secondary" className="w-full md:w-auto">
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

                            if (card.status === 'deactivated') {
                                navigate('/experts/deleted')
                                return
                            }

                            setActiveStatus(activeStatus === card.status ? 'all' : card.status)
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
        </div>
    )
}
