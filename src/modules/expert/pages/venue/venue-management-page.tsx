import { useState } from 'react'
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    PauseCircle,
    Trash2,
    BarChart3,
    Plus,
    Eye,
    type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVenues } from '../../hooks/use-venues'
import { useVenueStore } from '../../store'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

export const VenueManagementPage = () => {
    const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null)

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
        status: activeStatus !== 'all' ? activeStatus : undefined,
        search: searchQuery,
    })
    console.log('VENUES API DATA =>', data)
    console.log('FULL RESPONSE =>', data)
    console.log('VENUES =>', data?.data)
    console.log('META =>', data?.meta)

    const venues = data?.data || []
    console.log('VENUES', venues)
    const meta = data?.meta
    const formatVenueId = (index: number) => {
        return `EXP-${String(index + 10234)}`
    }

    const formatSpaceId = (index: number) => {
        return `SP${String(index + 1).padStart(3, '0')}`
    }
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

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Venue Management
                    </h1>

                    <p className="text-slate-400 mt-1 text-sm md:text-base">
                        Manage venue listings, approvals and venue details
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <Button className="bg-amber-400 text-black hover:bg-amber-500 font-semibold gap-2 w-full md:w-auto justify-center">
                        <BarChart3 className="size-4" />
                        Manage Metrics
                    </Button>

                    <Button
                        className="bg-white text-black hover:bg-slate-200 font-semibold gap-2 w-full md:w-auto justify-center"
                        onClick={() => navigate('/venues/management/create')}
                    >
                        <Plus className="size-4" />
                        Create
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statusCards.map((card) => (
                    <button
                        key={card.label}
                        onClick={() =>
                            setActiveStatus(
                                activeStatus === card.status ? 'all' : card.status,
                            )
                        }
                        className={cn(
                            'flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02]',
                            card.bg,
                            card.border,
                            activeStatus === card.status
                                ? 'ring-2 ring-amber-400/50'
                                : '',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', card.bg)}>
                                <card.icon className={cn('size-5', card.color)} />
                            </div>

                            <span className="text-sm font-medium text-slate-300">
                                {card.label}
                            </span>
                        </div>

                        <span className={cn('text-lg font-bold', card.color)}>
                            {String(card.count ?? 0).padStart(2, '0')}
                        </span>
                    </button>
                ))}
            </div>
            <div className="bg-[#121212] border border-slate-800 rounded-2xl overflow-visible">

                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />

                        <Input
                            placeholder="Search by venue name or venue ID"
                            className="pl-10 bg-[#1A1A1A] border-slate-800 text-white placeholder:text-slate-600 focus:ring-amber-400/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            className="flex-1 sm:flex-none border-slate-800 bg-transparent text-white gap-2 text-xs md:text-sm"
                        >
                            <Filter className="size-4" />
                            Advance Filters
                        </Button>

                        <Button className="flex-1 sm:flex-none bg-amber-100 text-black hover:bg-amber-200 font-semibold gap-2 text-xs md:text-sm">
                            <Download className="size-4" />
                            Export Data
                        </Button>
                    </div>
                </div>

                <div className="px-5 pb-3">
                    <p className="text-xs text-slate-500">
                        Showing{' '}
                        <span className="text-slate-300">
                            1-{venues.length}
                        </span>{' '}
                        of{' '}
                        <span className="text-slate-300">
                            {meta?.pagination?.total || 0}
                        </span>{' '}
                        venues
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-y border-slate-800/50">
                            <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4 font-semibold">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-700 bg-transparent"
                                    />
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Venue ID
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Venue Name
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Venue Category
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Space ID
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Space Name
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Status
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Event Type
                                </th>

                                <th className="px-3 py-4 font-semibold">
                                    Created At
                                </th>

                                <th className="px-5 py-4 font-semibold text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4">
                                            <div className="h-4 w-4 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-20 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-32 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-24 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-20 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-20 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-16 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-20 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="h-4 w-24 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="ml-auto h-4 w-4 rounded bg-slate-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : venues.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-5 py-10 text-center text-slate-500"
                                    >
                                        No Venues found.
                                    </td>
                                </tr>
                            ) : (
                                venues.map((venue: any, index: number) => (
                                    <tr
                                        key={venue._id}
                                        className="text-sm text-slate-300 hover:bg-slate-800/20 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-700 bg-transparent"
                                            />
                                        </td>

                                        <td className="px-3 py-4 font-mono text-xs">
                                            {formatVenueId(index)}
                                        </td>

                                        <td className="px-3 py-4 font-medium text-white">
                                            {venue.venueName}
                                        </td>

                                        <td className="px-3 py-4">
                                            {venue.venueCategory}
                                        </td>

                                        <td className="px-3 py-4">
                                            {venue.spaceId ? formatSpaceId(index) : '—'}
                                        </td>

                                        <td className="px-3 py-4">
                                            {venue.spaceName || '—'}
                                        </td>

                                        <td className="px-3 py-4">
                                            <span
                                                className={cn(
                                                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                                                    venue.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-500'
                                                        : venue.status === 'approved'
                                                            ? 'bg-green-500/10 text-green-500'
                                                            : 'bg-slate-500/10 text-slate-500',
                                                )}
                                            >
                                                {venue.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4">
                                            {venue.eventType}
                                        </td>

                                        <td className="px-3 py-4">
                                            {new Date(
                                                venue.createdAt,
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="px-5 py-4 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()

                                                    setActiveDropdownIndex(
                                                        activeDropdownIndex === index
                                                            ? null
                                                            : index,
                                                    )
                                                }}
                                                className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800/50"
                                            >
                                                <MoreVertical className="size-4" />
                                            </button>

                                            {activeDropdownIndex === index && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() =>
                                                            setActiveDropdownIndex(null)
                                                        }
                                                    />

                                                    <div className="absolute right-12 top-0 z-[9999] w-40 rounded-xl border border-slate-800 bg-[#1A1A1A] py-1.5 shadow-2xl">
                                                        <button
                                                            onClick={() => {
                                                                setActiveDropdownIndex(null)

                                                                navigate(`/venues/management/create?venueId=${venue._id}&view=true`)
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all flex items-center gap-2"
                                                        >
                                                            <Eye className="size-3.5" />
                                                            View Details
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto border-slate-800 bg-transparent text-white gap-2 disabled:opacity-50"
                        onClick={() =>
                            setCurrentPage(
                                Math.max(1, currentPage - 1),
                            )
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-1 md:gap-2">
                        {(() => {
                            const totalPages =
                                meta?.pagination?.pages || 1

                            const maxVisible = 5

                            let start = Math.max(
                                1,
                                currentPage -
                                Math.floor(maxVisible / 2),
                            )

                            const end = Math.min(
                                totalPages,
                                start + maxVisible - 1,
                            )

                            if (
                                end - start + 1 <
                                maxVisible
                            ) {
                                start = Math.max(
                                    1,
                                    end - maxVisible + 1,
                                )
                            }
                            return Array.from(
                                { length: end - start + 1 },
                                (_, i) => start + i,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        setCurrentPage(page)
                                    }
                                    className={cn(
                                        'size-8 rounded flex items-center justify-center text-xs md:text-sm font-medium transition-colors',
                                        currentPage === page
                                            ? 'bg-amber-400 text-black'
                                            : 'text-slate-500 hover:text-white',
                                    )}
                                >
                                    {page
                                        .toString()
                                        .padStart(2, '0')}
                                </button>
                            ))
                        })()}
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto border-slate-800 bg-transparent text-white gap-2 disabled:opacity-50"
                        onClick={() =>
                            setCurrentPage(
                                Math.min(
                                    meta?.pagination?.pages || 1,
                                    currentPage + 1,
                                ),
                            )
                        }
                        disabled={
                            currentPage ===
                            (meta?.pagination?.pages || 1)
                        }
                    >
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}