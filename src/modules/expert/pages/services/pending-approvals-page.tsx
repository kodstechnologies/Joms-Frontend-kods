import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useServices } from '../../hooks/use-services'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

const formatCreatedAt = (value: string) => {
  const createdAt = new Date(value)

  return createdAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PendingApprovalsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: 'in_review',
    search: searchQuery,
  })

  const services = data?.data || []
  const meta = data?.meta
  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) => selectedServiceIds.includes(id))

  const toggleVisibleServices = useCallback(() => {
    setSelectedServiceIds((currentIds) => {
      if (allVisibleServicesSelected) {
        return currentIds.filter((id) => !visibleServiceIds.includes(id))
      }

      return Array.from(new Set([...currentIds, ...visibleServiceIds]))
    })
  }, [allVisibleServicesSelected, visibleServiceIds])

  const toggleServiceSelection = useCallback((serviceId: string) => {
    setSelectedServiceIds((currentIds) =>
      currentIds.includes(serviceId)
        ? currentIds.filter((id) => id !== serviceId)
        : [...currentIds, serviceId],
    )
  }, [])

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all pending services"
            checked={allVisibleServicesSelected}
            ref={(input) => {
              if (input) input.indeterminate = someVisibleServicesSelected && !allVisibleServicesSelected
            }}
            onChange={toggleVisibleServices}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.title}`}
            checked={selectedServiceIds.includes(row.original._id)}
            onChange={() => toggleServiceSelection(row.original._id)}
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
        accessorKey: 'serviceid',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase">{row.original.serviceid || 'SER001'}</span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Service Name',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.title}</span>,
      },
      {
        accessorKey: 'categoryName',
        header: 'Service Category',
      },
      {
        accessorKey: 'serviceType',
        header: 'Service Type',
      },
      {
        accessorKey: 'pricing',
        header: 'Service',
        cell: ({ row }) => formatPrice(row.original.pricing),
      },
      {
        accessorKey: 'expertid',
        header: 'Expert ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.expertid || 'Not provided'}</span>
        ),
      },
      {
        accessorKey: 'expertName',
        header: 'Expert Name',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: () => (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
            Pending
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created at',
        cell: ({ row }) => formatCreatedAt(row.original.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerClassName: 'pr-5 text-right',
          cellClassName: 'relative pr-5 text-right',
        },
        cell: ({ row }) => {
          const service = row.original
          const isOpen = activeDropdownId === service._id

          return (
            <TableActionsDropdown
              label={`Open actions for ${service.title}`}
              isOpen={isOpen}
              onOpenChange={(open) => setActiveDropdownId(open ? service._id : null)}
              menuWidth={160}
            >
              <TableActionsItem
                icon={<Eye className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  navigate(getServiceManagementViewPath(service))
                }}
              >
                View Details
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [
      activeDropdownId,
      allVisibleServicesSelected,
      navigate,
      selectedServiceIds,
      someVisibleServicesSelected,
      toggleServiceSelection,
      toggleVisibleServices,
    ],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/services/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Pending Approvals</span>
        </button>

        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigate('/services/management')}
            className="transition-colors hover:text-white"
          >
            Service Management
          </button>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">Pending Approvals</span>
        </div>
      </header>

      <DataTable
        columns={columns}
        data={services}
        getRowId={(service) => service._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        onExport={() => toast.message('Export coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No pending approvals found."
      />
    </div>
  )
}
