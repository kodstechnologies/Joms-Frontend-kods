import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  SquarePen,
  Tag,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  financeServiceRowsMock,
  financeServiceTabs,
  type FinanceServiceRow,
  type FinanceServiceTab,
} from '@/modules/payments/mock/finance-services.mock'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

function getStatusClassName(status: FinanceServiceRow['status']) {
  if (status === 'Paid') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  }
  return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
}

export function FinanceServicesPage() {
  const [activeTab, setActiveTab] = useState<FinanceServiceTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const tabRows = useMemo(
    () => financeServiceRowsMock.filter((row) => row.tab === activeTab),
    [activeTab],
  )

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return tabRows

    return tabRows.filter((row) =>
      [row.serviceId, row.name, row.expertName, row.bookingId, row.userName]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [searchQuery, tabRows])

  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, safePage])

  const visibleRowIds = useMemo(() => pageRows.map((row) => row.id), [pageRows])
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRowIds.includes(id))
  const someVisibleSelected = visibleRowIds.some((id) => selectedRowIds.includes(id))

  const toggleVisibleRows = useCallback(() => {
    setSelectedRowIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleRowIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleRowIds]))
    })
  }, [allVisibleSelected, visibleRowIds])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId)
        ? currentIds.filter((id) => id !== rowId)
        : [...currentIds, rowId],
    )
  }, [])

  const renderActions = useCallback(
    (record: FinanceServiceRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open service record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={220}
          menuClassName="border-slate-200 bg-white py-1.5 shadow-xl"
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              toast.message(`View details for ${record.name}`)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<SquarePen className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              toast.message('Add internal note coming soon')
            }}
          >
            Add internal note
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              toast.message('Add tags coming soon')
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              toast.message('Escalate coming soon')
            }}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="size-3.5 text-rose-500" aria-hidden="true" />}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => {
              setActiveDropdownId(null)
              toast.message('Delete coming soon')
            }}
          >
            Delete
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId],
  )

  const columns = useMemo<ColumnDef<FinanceServiceRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all service records"
            checked={allVisibleSelected}
            ref={(input) => {
              if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
            }}
            onChange={toggleVisibleRows}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.name}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
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
        accessorKey: 'serviceId',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase text-white">{row.original.serviceId}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.name}</span>,
      },
      { accessorKey: 'expertName', header: 'Expert Name' },
      {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase text-white">{row.original.bookingId}</span>
        ),
      },
      { accessorKey: 'userName', header: 'User Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              getStatusClassName(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.revenue}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [
      allVisibleSelected,
      renderActions,
      selectedRowIds,
      someVisibleSelected,
      toggleRowSelection,
      toggleVisibleRows,
    ],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Serivce</h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Manage service bookings, expert commissions, and payouts
          </p>
          <p className="mt-3 text-[12px] text-[#888888]">
            <Link to="/finance/dashboard" className="transition-colors hover:text-white">
              Finance Management
            </Link>
            <span> / </span>
            <span className="font-semibold text-white">Services</span>
          </p>
        </div>
        <Button onClick={() => toast.message('Metrics configuration coming soon')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {financeServiceTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              setCurrentPage(1)
              setSearchQuery('')
              setSelectedRowIds([])
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors',
              activeTab === tab.id
                ? 'bg-[#2A2A2A] text-white'
                : 'text-[#888888] hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={pageRows}
        getRowId={(row) => row.id}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={() => toast.message('Advance filters coming soon')}
        onExport={() => toast.message('Export coming soon')}
        pagination={{
          page: safePage,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No service records found."
      />
    </div>
  )
}
