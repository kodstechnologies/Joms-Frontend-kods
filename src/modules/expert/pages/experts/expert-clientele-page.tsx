import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, SlidersHorizontal, Star, TrendingUp, User, Users } from 'lucide-react'
import { toast } from 'sonner'

import { fetchExpertClientele } from '../../api/expert-api'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

type ClienteleItem = {
  bookingId: string
  clientId: string
  clientName: string
  whatsappNumber?: string
  listingType: string
  listingName?: string
  status: string
  pricingType: string
  tierName?: string
  startDate: string
  endDate: string
  price: number
  paymentId?: string
  paymentStatus?: string
  rating?: number
}

type Metrics = {
  uniqueClients: number
  uniqueClientsTrend: number
  nps: number
  npsTrend: number
  avgRating: number
  avgRatingTrend: number
  noOfReviews: number
  noOfReviewsTrend: number
}

export function ExpertClientelePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const expertId = id || ''

  const [expertName, setExpertName] = useState('Sara Johnson')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<Metrics>({
    uniqueClients: 5,
    uniqueClientsTrend: 12.5,
    nps: 102,
    npsTrend: 12.5,
    avgRating: 3.3,
    avgRatingTrend: 12.5,
    noOfReviews: 150,
    noOfReviewsTrend: 12.5,
  })

  const [items, setItems] = useState<ClienteleItem[]>([])
  const [total, setTotal] = useState(20)
  const [totalPages, setTotalPages] = useState(2)

  useEffect(() => {
    if (!expertId) return
    let isCancelled = false
    fetchExpertClientele(expertId, { page, search, limit: 10 })
      .then((res) => {
        if (isCancelled || !res?.data) return
        const d = res.data
        if (d.expertName) setExpertName(d.expertName)
        if (d.metrics) setMetrics(d.metrics)
        if (d.items) setItems(d.items)
        if (d.pagination) {
          setTotal(d.pagination.total || d.items?.length || 20)
          setTotalPages(d.pagination.totalPages || 2)
        }
      })
      .catch((err) => {
        console.error('Failed to load expert clientele:', err)
      })
      .finally(() => {
        if (!isCancelled) setLoading(false)
      })
    return () => {
      isCancelled = true
    }
  }, [expertId, page, search])

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '--'
    try {
      const d = new Date(isoStr)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return isoStr
    }
  }

  const formatPrice = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`
  }

  const columns = useMemo<ColumnDef<ClienteleItem>[]>(
    () => [
      {
        accessorKey: 'clientId',
        header: 'Client ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {row.original.clientId}
          </span>
        ),
      },
      {
        accessorKey: 'clientName',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.clientName}</span>
        ),
      },
      {
        accessorKey: 'listingType',
        header: 'Listing Type',
        cell: ({ row }) => <span className="text-muted text-sm">{row.original.listingType}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
                status === 'Completed'
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                  : status === 'In-progress'
                    ? 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
                    : 'border border-rose-500/30 bg-rose-500/15 text-rose-400',
              )}
            >
              {status}
            </span>
          )
        },
      },
      {
        accessorKey: 'pricingType',
        header: 'Pricing Type',
        cell: ({ row }) => <span className="text-muted text-sm">{row.original.pricingType}</span>,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.startDate)}</span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.endDate)}</span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <span className="font-semibold text-white">{formatPrice(row.original.price)}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <TableActionsDropdown
              label="Client actions"
              isOpen={activeActionMenu === row.original.bookingId}
              onOpenChange={(open) => setActiveActionMenu(open ? row.original.bookingId : null)}
            >
              <TableActionsItem tone="light" onClick={() => setActiveActionMenu(null)}>
                👁️ View Details
              </TableActionsItem>
              <TableActionsItem tone="light" onClick={() => setActiveActionMenu(null)}>
                💳 Payment details
              </TableActionsItem>
              <TableActionsItem tone="light" onClick={() => setActiveActionMenu(null)}>
                📝 Add internal note
              </TableActionsItem>
              <TableActionsItem tone="light" onClick={() => setActiveActionMenu(null)}>
                ⬆️ Escalate
              </TableActionsItem>
              <TableActionsItem tone="light" onClick={() => setActiveActionMenu(null)}>
                🔀 Merge
              </TableActionsItem>
            </TableActionsDropdown>
          </div>
        ),
      },
    ],
    [activeActionMenu],
  )

  return (
    <div className="space-y-7 pb-10">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-brand-surface text-muted grid size-8 place-items-center rounded-lg border border-white/10 transition-colors hover:bg-white/5"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Clientele</h1>
          </div>
          <p className="text-body-md text-muted mt-1.5 font-medium">
            Expert: <span className="font-semibold text-white">{expertName}</span>
          </p>
        </div>

        <Button
          type="button"
          onClick={() => navigate('/experts/dashboard/metrics')}
          className="ui-manage-metrics h-10 rounded-xl px-5 text-sm font-semibold sm:w-auto"
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      {/* Top Metric Cards Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-muted font-medium">Unique clients</p>
            <div className="grid size-9 place-items-center rounded-xl bg-white/5 text-white">
              <User className="size-5" />
            </div>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-white">
            {String(metrics.uniqueClients).padStart(2, '0')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="size-3.5" />
            <span>{metrics.uniqueClientsTrend}% vs last month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-muted font-medium">NPS</p>
            <div className="grid size-9 place-items-center rounded-xl bg-white/5 text-white">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-white">{metrics.nps}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="size-3.5" />
            <span>{metrics.npsTrend}% vs last month</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-muted font-medium">Avg. Rating</p>
            <div className="grid size-9 place-items-center rounded-xl bg-white/5 text-white">
              <Star className="size-5 fill-white" />
            </div>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-white">{metrics.avgRating}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="size-3.5" />
            <span>{metrics.avgRatingTrend}% vs last month</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-muted font-medium">No.Of Reviews</p>
            <div className="grid size-9 place-items-center rounded-xl bg-white/5 text-white">
              <Star className="size-5" />
            </div>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-white">{metrics.noOfReviews}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="size-3.5" />
            <span>{metrics.noOfReviewsTrend}% vs last month</span>
          </div>
        </div>
      </div>

      {/* Global Data Table */}
      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.bookingId}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name , ID or profession"
        resourceLabel="users"
        showAdvancedFilter
        showExport
        onExport={() => toast.success('Exporting clientele data...')}
        onAdvancedFilter={() => toast.message('Advance filters opened')}
        pagination={{
          page,
          pageSize: 10,
          totalItems: total,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
