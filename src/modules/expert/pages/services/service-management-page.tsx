import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  Archive,
  Ban,
  BarChart3,
  Bell,
  CheckSquare,
  Eye,
  Hourglass,
  Image,
  Mail,
  PauseCircle,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useServices, useSuspendService, useDeleteService } from '../../hooks/use-services'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import { ADMIN_DELETE_REASON_OPTIONS } from '../../constants/soft-delete'
import { useServiceStore } from '../../store/service-store'
import type { Service } from '../../type/service'
import { getManagementStatusDisplay } from '../../utils/management-status'
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

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

const SUSPEND_REASON_OPTIONS: DecisionActionModalOption[] = [
  { label: 'Policy violation', value: 'policy_violation' },
  { label: 'Temporary operational issue', value: 'temporary_operational_issue' },
  { label: 'Quality concern', value: 'quality_concern' },
  { label: 'System verification in progress', value: 'system_verification_in_progress' },
  { label: 'Admin review required', value: 'admin_review_required' },
]


export const ServiceManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const [suspendServiceTarget, setSuspendServiceTarget] = useState<Service | null>(null)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendReasonDetails, setSuspendReasonDetails] = useState('')
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')

  const [deleteServiceTarget, setDeleteServiceTarget] = useState<Service | null>(null)
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteReasonDetails, setDeleteReasonDetails] = useState('')
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')

  const suspendServiceMutation = useSuspendService()
  const deleteServiceMutation = useDeleteService()

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

  const openSuspendModal = useCallback((service: Service) => {
    setSuspendServiceTarget(service)
    setSuspendReasons([])
    setSuspendStartDate('')
    setSuspendEndDate('')
    setSuspendIndefinitely(false)
    setSuspendReasonDetails('')
    setSuspendAdminNotes('')
  }, [])

  const closeSuspendModal = useCallback(() => {
    setSuspendServiceTarget(null)
  }, [])

  const openDeleteModal = useCallback((service: Service) => {
    setDeleteServiceTarget(service)
    setDeleteReasons([])
    setDeleteReasonDetails('')
    setDeleteAdminNotes('')
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteServiceTarget(null)
    setDeleteReasons([])
  }, [])

  const toggleDeleteReason = useCallback((value: string) => {
    setDeleteReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const handleDeleteSubmit = useCallback(() => {
    if (!deleteServiceTarget) return

    if (deleteReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    if (!deleteAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    deleteServiceMutation.mutate(
      {
        id: deleteServiceTarget._id,
        payload: {
          selectedReasons: deleteReasons,
          reasonDetails: deleteReasonDetails.trim(),
          adminNotes: deleteAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Service deleted successfully')
          closeDeleteModal()
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to delete service.')
        },
      },
    )
  }, [
    closeDeleteModal,
    deleteAdminNotes,
    deleteReasonDetails,
    deleteReasons,
    deleteServiceMutation,
    deleteServiceTarget,
  ])

  const toggleSuspendReason = useCallback((value: string) => {
    setSuspendReasons((current) =>
      current.includes(value)
        ? current.filter((reason) => reason !== value)
        : [...current, value],
    )
  }, [])

  const handleSuspendSubmit = useCallback(() => {
    if (!suspendServiceTarget) return

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

    suspendServiceMutation.mutate(
      {
        id: suspendServiceTarget._id,
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
          toast.success('Service suspended successfully')
          closeSuspendModal()
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to suspend service. Please try again.',
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
    suspendServiceMutation,
    suspendServiceTarget,
    suspendStartDate,
  ])

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
        cell: ({ row }) => {
          const { label, className } = getManagementStatusDisplay(row.original.status, {
            isSuspend: row.original.isSuspend,
            isDeleted: row.original.status === 'deleted',
          })

          return <span className={className}>{label}</span>
        },
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
          const isOpen = activeDropdownId === service._id

          return (
            <TableActionsDropdown
              label={`Open actions for ${service.title}`}
              isOpen={isOpen}
              onOpenChange={(open) => setActiveDropdownId(open ? service._id : null)}
              menuWidth={192}
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
                icon={<PauseCircle className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  openSuspendModal(service)
                }}
              >
                Suspend Service
              </TableActionsItem>
              <TableActionsItem
                icon={<Trash2 className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  openDeleteModal(service)
                }}
              >
                Delete Service
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
      openDeleteModal,
      openSuspendModal,
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
      label: 'Reported Services',
      count: counts.reportedServices,
      gradient: 'bg-gradient-to-r from-red-800/55 to-transparent',
      border: 'border-red-800/60',
      icon: AlertCircle,
      status: 'reported',
    },
    {
      label: 'Suspended Services',
      count: counts.suspendedServices,
      gradient: 'bg-gradient-to-r from-red-800/55 to-transparent',
      border: 'border-red-800/60',
      icon: Ban,
      status: 'suspended',
    },
    {
      label: 'Deleted Services',
      count: counts.deletedServices,
      gradient: 'bg-gradient-to-r from-red-800/55 to-transparent',
      border: 'border-red-800/60',
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
          <Button className="w-full md:w-auto" onClick={() => navigate('/services/dashboard/metrics')}>
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
              if (card.status === 'reported') {
                return
              }
              if (card.status === 'deleted') {
                navigate('/services/management/deleted')
                return
              }
              if (card.status === 'pending') {
                navigate('/services/management/pending')
                return
              }
              if (card.status === 'suspended') {
                navigate('/services/management/suspended')
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

      <DecisionActionModal
        open={Boolean(suspendServiceTarget)}
        variant="suspend"
        title="Suspend Service"
        description="Are you sure you want to suspend this service? This action will hide it from the marketplace and notify the expert."
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
        isSubmitting={suspendServiceMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(deleteServiceTarget)}
        variant="reject"
        title="Delete Service"
        description="Are you sure you want to delete this service? It will be permanently removed after 21 days unless restored."
        submitLabel="Delete Service"
        reasonOptions={ADMIN_DELETE_REASON_OPTIONS}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        reason={deleteReasonDetails}
        onReasonChange={setDeleteReasonDetails}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deleteServiceMutation.isPending}
      />
    </div>
  )
}
