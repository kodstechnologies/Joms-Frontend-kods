import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  Eye,
  PlayCircle,
  Plus,
  SlidersHorizontal,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'

import { useActivateService, useServices } from '../../hooks/use-services'
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

export function SuspendedServicesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: 'suspended',
    search: searchQuery,
  })

  const activateServiceMutation = useActivateService()

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

  const handleActivate = useCallback(
    (service: Service) => {
      activateServiceMutation.mutate(service._id, {
        onSuccess: () => {
          toast.success('Service activated successfully')
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to activate service. Please try again.',
          )
        },
      })
    },
    [activateServiceMutation],
  )

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all suspended services"
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
          <span className="font-mono text-xs uppercase">{row.original.serviceid || row.original._id}</span>
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
          <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-purple-400">
            Suspended
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
              menuWidth={180}
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
              <TableActionsItem
                icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  handleActivate(service)
                }}
              >
                Activate Service
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [
      activeDropdownId,
      allVisibleServicesSelected,
      handleActivate,
      navigate,
      selectedServiceIds,
      someVisibleServicesSelected,
      toggleServiceSelection,
      toggleVisibleServices,
    ],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <header className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/services/management')}
            className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-brand-accent"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Suspended Services</span>
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
            <span className="font-bold text-white">Suspended Services</span>
          </div>
        </header>
      </div>

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
        emptyMessage="No suspended services found."
      />
    </div>
  )
}
