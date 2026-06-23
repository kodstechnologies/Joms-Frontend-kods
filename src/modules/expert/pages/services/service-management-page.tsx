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
  MoreVertical,
  PauseCircle,
  Plus,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useServices } from '../../hooks/use-services'
import { useServiceStore } from '../../store/service-store'
import type { Service } from '../../type/service'
import { DataTable } from '@/shared/components/table/data-table'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export const ServiceManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const navigate = useNavigate()
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    activeStatus,
    setActiveStatus,
  } = useServiceStore()

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: activeStatus !== 'all' ? activeStatus : undefined,
    search: searchQuery,
  })

  const services = data?.data || []
  const meta = data?.meta
  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const selectedServiceCount = selectedServiceIds.length
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) => selectedServiceIds.includes(id))
  const counts = meta?.counts || {
    approvalsPending: 0,
    reportedServices: 0,
    suspendedServices: 0,
    deletedServices: 0,
  }

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
            aria-label="Select all services"
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
        header: 'Pricing',
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
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
              row.original.status === 'live'
                ? 'bg-green-500/10 text-green-500'
                : row.original.status === 'in_review'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-slate-500/10 text-slate-500',
            )}
          >
            {row.original.status.replace('_', ' ')}
          </span>
        ),
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
        id: 'actions',
        header: 'Actions',
        meta: {
          headerClassName: 'pr-5 text-right',
          cellClassName: 'relative pr-5 text-right',
        },
        cell: ({ row }) => {
          const service = row.original

          return (
            <>
              <button
                type="button"
                aria-label={`Open actions for ${service.title}`}
                aria-expanded={activeDropdownId === service._id}
                onClick={(event) => {
                  event.stopPropagation()
                  setActiveDropdownId(activeDropdownId === service._id ? null : service._id)
                }}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-white"
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </button>

              {activeDropdownId === service._id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveDropdownId(null)}
                  />
                  <div className="absolute right-5 z-20 mt-2 w-40 rounded-xl border border-slate-800 bg-[#1A1A1A] py-1.5 text-left shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdownId(null)
                        navigate(
                          `/services/management/view/${service._id}?type=${encodeURIComponent(service.serviceType)}`,
                        )
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800/80 hover:text-amber-400"
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                      View Details
                    </button>
                  </div>
                </>
              )}
            </>
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

  const bulkActions = [
    { label: 'Delete selected services', icon: Trash2 },
    { label: 'Manage selected service media', icon: Image },
    { label: 'Archive selected services', icon: Archive },
    { label: 'Review selected services', icon: ShieldCheck },
    { label: 'Notify selected experts', icon: Bell },
    { label: 'Message selected experts', icon: Mail },
    { label: 'Suspend selected services', icon: PauseCircle },
  ]

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
      label: 'Reported Services',
      count: counts.reportedServices,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
      icon: AlertCircle,
      status: 'reported',
    },
    {
      label: 'Suspended Services',
      count: counts.suspendedServices,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
      icon: PauseCircle,
      status: 'suspended',
    },
    {
      label: 'Deleted Services',
      count: counts.deletedServices,
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
      border: 'border-slate-400/20',
      icon: Trash2,
      status: 'deleted',
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Service Management</h1>
          <p className="mt-1 text-sm text-slate-400 md:text-base">
            Comprehensive service data and admin controls
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button className="w-full gap-2 bg-amber-400 font-semibold text-black hover:bg-amber-500 md:w-auto">
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button
            className="w-full gap-2 bg-white font-semibold text-black hover:bg-slate-200 md:w-auto"
            onClick={() => navigate('/services/management/create')}
          >
            <Plus className="size-4" />
            Create
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
                navigate('/services/management/pending')
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
              {card.count.toString().padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>

      {selectedServiceCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>
              {selectedServiceCount} {selectedServiceCount === 1 ? 'Service' : 'Services'} Selected
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
        data={services}
        getRowId={(service) => service._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
        onExport={() => toast.message('Service export is coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No services found."
      />
    </div>
  )
}
