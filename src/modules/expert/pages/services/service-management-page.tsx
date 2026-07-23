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

import { SERVICE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { useServices, useSuspendService, useDeleteService } from '../../hooks/use-services'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
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
import { StatusQuickLinkCard, StatusQuickLinkRow } from '@/shared/components/status-quick-link-card'
import { Button } from '@/shared/components/ui/button'
import { statusCardTones } from '@/shared/lib/design-tokens'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'

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
  const tableColumnPreferencesQuery = useTableColumnPreferences(SERVICE_MANAGEMENT_MODULE_KEY)
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    activeStatus,
    setActiveStatus,
  } = useServiceStore()

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'service-management',
  })

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: activeStatus !== 'all' ? activeStatus : undefined,
    search: searchQuery,
  })

  const services = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta
  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const selectedServiceCount = selectedServiceIds.length
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) =>
    selectedServiceIds.includes(id),
  )
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
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
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
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(
            err?.response?.data?.message || 'Failed to suspend service. Please try again.',
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

  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const selectColumn: ColumnDef<Service> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all services"
          checked={allVisibleServicesSelected}
          ref={(input) => {
            if (input)
              input.indeterminate = someVisibleServicesSelected && !allVisibleServicesSelected
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
    }

    const dataColumnsById: Record<string, ColumnDef<Service>> = {
      'service-id': {
        id: 'service-id',
        accessorKey: 'serviceid',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase">
            {row.original.serviceid || row.original._id}
          </span>
        ),
      },
      name: {
        id: 'name',
        accessorKey: 'title',
        header: 'Service Name',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.title}</span>,
      },
      category: {
        id: 'category',
        accessorKey: 'categoryName',
        header: 'Service Category',
        cell: ({ row }) => {
          const value = row.original.categoryName
          if (!value) return <span className="text-[#777]">—</span>
          return <span>{value}</span>
        },
      },
      type: {
        id: 'type',
        accessorKey: 'serviceType',
        header: 'Service Type',
      },
      pricing: {
        id: 'pricing',
        accessorKey: 'pricing',
        header: 'Pricing',
        cell: ({ row }) => formatPrice(row.original.pricing),
      },
      'expert-id': {
        id: 'expert-id',
        accessorKey: 'expertid',
        header: 'Expert ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.expertid || 'Not provided'}</span>
        ),
      },
      'expert-name': {
        id: 'expert-name',
        accessorKey: 'expertName',
        header: 'Expert Name',
      },
      status: {
        id: 'status',
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
      'created-at': {
        id: 'created-at',
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
    }

    const defaultVisibleIds = [
      'service-id',
      'name',
      'category',
      'type',
      'pricing',
      'expert-id',
      'expert-name',
      'status',
      'created-at',
    ]

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : defaultVisibleIds

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<Service> = {
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
    }

    return [selectColumn, ...preferenceColumns, actionsColumn]
  }, [
    activeDropdownId,
    allVisibleServicesSelected,
    navigate,
    openDeleteModal,
    openSuspendModal,
    selectedServiceIds,
    someVisibleServicesSelected,
    tableColumnPreferencesQuery.data,
    toggleServiceSelection,
    toggleVisibleServices,
  ])

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
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: Hourglass,
      status: 'pending',
    },
    {
      label: 'Reported Services',
      count: counts.reportedServices,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: AlertCircle,
      status: 'reported',
    },
    {
      label: 'Suspended Services',
      count: counts.suspendedServices,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: Ban,
      status: 'suspended',
    },
    {
      label: 'Deleted Services',
      count: counts.deletedServices,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
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
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/services/dashboard/metrics')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
        </div>
      </div>

      <StatusQuickLinkRow>
        {statusCards.map((card) => (
          <StatusQuickLinkCard
            key={card.label}
            title={card.label}
            value={card.count}
            icon={card.icon}
            background={card.gradient}
            border={card.border}
            selected={activeStatus === card.status}
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
          />
        ))}
      </StatusQuickLinkRow>

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
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
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

      {exportFilterModals}

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
