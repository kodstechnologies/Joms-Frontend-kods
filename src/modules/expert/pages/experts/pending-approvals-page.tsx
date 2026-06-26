import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    AlertCircle,
    Archive,
    BarChart3,
    Bell,
    CheckSquare,
    Eye,
    Image,
    Mail,
    PauseCircle,
    Plus,
    ShieldCheck,
    Trash2,
    User,
    Wallet,


    Flag,
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

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price)

export const ApprovalsPendingPage = () => {
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
    const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([])
    const navigate = useNavigate()
    const {
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        
    } = useExpertStore()

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: 'pending',
    search: searchQuery,
})
    console.log('Experts Data =>', data)
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
            },

            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => (
                    <span className="cursor-pointer underline">
                        {row.original.name}
                    </span>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email ID',
            },
            {
                accessorKey: 'profession',
                header: 'Profession',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span className="inline-flex items-center rounded-full bg-green-900/40 px-2 py-1 text-xs font-medium text-green-400">
                        {row.original.status}
                    </span>
                ),
            },
            {
                accessorKey: 'serviceType',
                header: 'Service Type',
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => {
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
                                    navigate(`/experts/profile/${expert.expertId}`)
                                }}
                            >
                                View Profile
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


    return (
        <div className="flex flex-col gap-4 p-0 md:gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <div
                        className="mb-4 flex cursor-pointer items-center gap-2 text-white"
                        onClick={() => navigate('/experts/management')}
                    >
                        ←
                    </div>

                    <h1 className="text-2xl font-bold text-white md:text-3xl">
                        Pending Approvals
                    </h1>

                    <p className="mt-1 text-sm text-slate-400 md:text-base">
                        User Management / Pending Approvals
                    </p>
                </div>
                <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
                    <Button className="bg-[#E6BE73] text-black hover:bg-[#D9AE5A]">
                        <BarChart3 className="size-4" />
                        Manage Metrics
                    </Button>

                   
                </div>
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
                searchPlaceholder="Search by name, ID or profession"
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
