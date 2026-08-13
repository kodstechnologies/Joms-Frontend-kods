import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  Ban,
  BarChart3,
  Bell,
  CheckSquare,
  CircleMinus,
  Eye,
  EyeOff,
  Hourglass,
  Mail,
  Package,
  PauseCircle,
  Trash2,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { SERVICE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import {
  useServices,
  useSuspendService,
  useDeleteService,
  useBulkDeleteServices,
  useBulkPauseServices,
  useBulkHideServices,
  useBulkDisableServices,
  useBulkExportServices,
  useBulkNotifyServices,
  useBulkMessageServices,
} from '../../hooks/use-services'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import { useServiceStore } from '../../store/service-store'
import type { Service } from '../../type/service'
import { getManagementStatusDisplay } from '../../utils/management-status'
import { DataTable } from '@/shared/components/table/data-table'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { StatusQuickLinkCard, StatusQuickLinkRow } from '@/shared/components/status-quick-link-card'
import { Button } from '@/shared/components/ui/button'
import { statusCardTones } from '@/shared/lib/design-tokens'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export const ServiceManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const [suspendServiceTarget, setSuspendServiceTarget] = useState<Service | null>(null)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')

  const [deleteServiceTarget, setDeleteServiceTarget] = useState<Service | null>(null)
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<FilterValues>({})

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [bulkDeleteReasons, setBulkDeleteReasons] = useState<string[]>([])
  const [bulkDeleteAdminNotes, setBulkDeleteAdminNotes] = useState('')

  const [isBulkPauseModalOpen, setIsBulkPauseModalOpen] = useState(false)
  const [bulkPauseReasons, setBulkPauseReasons] = useState<string[]>([])
  const [bulkPauseStartDate, setBulkPauseStartDate] = useState('')
  const [bulkPauseEndDate, setBulkPauseEndDate] = useState('')
  const [bulkPauseIndefinitely, setBulkPauseIndefinitely] = useState(false)
  const [bulkPauseAdminNotes, setBulkPauseAdminNotes] = useState('')

  const suspendServiceMutation = useSuspendService()
  const deleteServiceMutation = useDeleteService()
  const bulkDeleteMutation = useBulkDeleteServices()
  const bulkPauseMutation = useBulkPauseServices()
  const bulkHideMutation = useBulkHideServices()
  const bulkDisableMutation = useBulkDisableServices()
  const bulkExportMutation = useBulkExportServices()
  const bulkNotifyMutation = useBulkNotifyServices()
  const bulkMessageMutation = useBulkMessageServices()

  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendService)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteService)

  const confirmBulkDelete = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    if (deleteReasonOptions.length > 0 && bulkDeleteReasons.length === 0) {
      toast.error('Please select at least one reason for deletion.')
      return
    }
    if (!bulkDeleteAdminNotes.trim()) {
      toast.error('Admin notes are required for deletion.')
      return
    }

    bulkDeleteMutation.mutate(
      {
        serviceIds: selectedServiceIds,
        selectedReasons: bulkDeleteReasons,
        adminNotes: bulkDeleteAdminNotes.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Deleted ${selectedServiceIds.length} selected service(s)`)
          setSelectedServiceIds([])
          setIsBulkDeleteModalOpen(false)
          setBulkDeleteReasons([])
          setBulkDeleteAdminNotes('')
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(error?.response?.data?.message || 'Failed to delete services')
        },
      },
    )
  }, [
    selectedServiceIds,
    bulkDeleteReasons,
    bulkDeleteAdminNotes,
    deleteReasonOptions.length,
    bulkDeleteMutation,
  ])

  const confirmBulkPause = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    if (suspendReasonOptions.length > 0 && bulkPauseReasons.length === 0) {
      toast.error('Please select at least one reason for pausing.')
      return
    }
    if (!bulkPauseAdminNotes.trim()) {
      toast.error('Admin notes are required for pausing.')
      return
    }

    bulkPauseMutation.mutate(
      {
        serviceIds: selectedServiceIds,
        selectedReasons: bulkPauseReasons,
        adminNotes: bulkPauseAdminNotes.trim(),
        startDate: bulkPauseStartDate,
        endDate: bulkPauseEndDate,
        indefinite: bulkPauseIndefinitely,
      },
      {
        onSuccess: () => {
          toast.success(`Paused ${selectedServiceIds.length} selected service(s)`)
          setSelectedServiceIds([])
          setIsBulkPauseModalOpen(false)
          setBulkPauseReasons([])
          setBulkPauseAdminNotes('')
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(error?.response?.data?.message || 'Failed to pause services')
        },
      },
    )
  }, [
    selectedServiceIds,
    bulkPauseReasons,
    bulkPauseAdminNotes,
    suspendReasonOptions.length,
    bulkPauseStartDate,
    bulkPauseEndDate,
    bulkPauseIndefinitely,
    bulkPauseMutation,
  ])

  const handleBulkHide = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkHideMutation.mutate(selectedServiceIds, {
      onSuccess: () => {
        toast.success(`Hidden / Unpublished ${selectedServiceIds.length} selected service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to hide services')
      },
    })
  }, [selectedServiceIds, bulkHideMutation])

  const handleBulkDisable = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkDisableMutation.mutate(selectedServiceIds, {
      onSuccess: () => {
        toast.success(`Disabled ${selectedServiceIds.length} selected service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to disable services')
      },
    })
  }, [selectedServiceIds, bulkDisableMutation])

  const handleBulkExport = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkExportMutation.mutate(selectedServiceIds, {
      onSuccess: (res: { data?: { services?: unknown[] } }) => {
        const servicesData = res?.data?.services ?? []
        toast.success(`Exported ${servicesData.length || selectedServiceIds.length} service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to export services')
      },
    })
  }, [selectedServiceIds, bulkExportMutation])

  const handleBulkNotify = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkNotifyMutation.mutate(selectedServiceIds, {
      onSuccess: (res: { message?: string; data?: { message?: string } }) => {
        toast.success(
          res?.data?.message ||
            res?.message ||
            `Notified experts for ${selectedServiceIds.length} service(s)`,
        )
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to notify experts')
      },
    })
  }, [selectedServiceIds, bulkNotifyMutation])

  const handleBulkMessage = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkMessageMutation.mutate(selectedServiceIds, {
      onSuccess: (res: { message?: string; data?: { message?: string } }) => {
        toast.success(
          res?.data?.message ||
            res?.message ||
            `Sent message/ticket for ${selectedServiceIds.length} service(s)`,
        )
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to send message')
      },
    })
  }, [selectedServiceIds, bulkMessageMutation])

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

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      setAppliedAdvancedFilters(values)
      setCurrentPage(1)
      toast.success('Filters applied')
    },
    [setCurrentPage],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'service-management',
    onApplyFilters: handleApplyFilters,
  })

  const apiFilterParams = useMemo(() => {
    const params: Record<string, string> = {}

    Object.entries(appliedAdvancedFilters).forEach(([rawKey, val]) => {
      if (val === undefined || val === null || val === '') return

      const parts = rawKey.split('.')
      const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

      if (fieldId === 'location' && typeof val === 'object' && val !== null) {
        const loc = val as { state?: string; city?: string }
        if (loc.state?.trim()) params.locationState = loc.state.trim()
        if (loc.city?.trim()) params.locationCity = loc.city.trim()
        return
      }

      if (Array.isArray(val)) {
        if (val.length > 0) {
          params[fieldId] = val.join(',')
        }
        return
      }

      if (typeof val === 'object' && val !== null) {
        const range = val as { from?: string | number; to?: string | number }
        if (range.from !== undefined && range.from !== '') {
          params[`${fieldId}Min`] = String(range.from).trim()
        }
        if (range.to !== undefined && range.to !== '') {
          params[`${fieldId}Max`] = String(range.to).trim()
        }
        return
      }

      if (typeof val === 'string' && val.trim()) {
        params[fieldId] = val.trim()
        return
      }

      if (typeof val === 'number' || typeof val === 'boolean') {
        params[fieldId] = String(val)
      }
    })

    return params
  }, [appliedAdvancedFilters])

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: activeStatus !== 'all' ? activeStatus : apiFilterParams.listingStatus,
    search: searchQuery,
    ...apiFilterParams,
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
    setSuspendAdminNotes('')
  }, [])

  const closeSuspendModal = useCallback(() => {
    setSuspendServiceTarget(null)
  }, [])

  const openDeleteModal = useCallback((service: Service) => {
    setDeleteServiceTarget(service)
    setDeleteReasons([])
    setDeleteAdminNotes('')
    setDeleteConfirmed(false)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteServiceTarget(null)
    setDeleteReasons([])
    setDeleteConfirmed(false)
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

    if (!deleteConfirmed) {
      toast.error('Please confirm the delete reasons before continuing.')
      return
    }

    if (!deleteAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const reasonPayload = buildDeleteReasonPayload(deleteReasons)
    if (reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    deleteServiceMutation.mutate(
      {
        id: deleteServiceTarget._id,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          reasonDetails: reasonPayload.reasonDetails,
          adminNotes: deleteAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
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
    buildDeleteReasonPayload,
    closeDeleteModal,
    deleteAdminNotes,
    deleteConfirmed,
    deleteReasons,
    deleteServiceMutation,
    deleteServiceTarget,
    recordReasonUsage,
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

    const reasonPayload = buildSuspendReasonPayload(suspendReasons)
    if (reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    suspendServiceMutation.mutate(
      {
        id: suspendServiceTarget._id,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          suspendIndefinitely,
          startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
          endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
          reasonDetails: reasonPayload.reasonDetails,
          adminNotes: suspendAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
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
    buildSuspendReasonPayload,
    closeSuspendModal,
    recordReasonUsage,
    suspendAdminNotes,
    suspendEndDate,
    suspendIndefinitely,
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
          <span className="ui-table-id uppercase">
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
          <span className="ui-table-id">{row.original.expertid || 'Not provided'}</span>
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
        cell: ({ row }) => <TableDateTimeCell value={row.original.createdAt} />,
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
    {
      label: 'Delete selected services (Delete Listings)',
      icon: Trash2,
      onClick: () => setIsBulkDeleteModalOpen(true),
    },
    {
      label: 'Export selected services (Export Selected)',
      icon: Upload,
      onClick: handleBulkExport,
    },
    {
      label: 'Hide selected services (Hide Listings)',
      icon: EyeOff,
      onClick: handleBulkHide,
    },
    {
      label: 'Disable selected services (Disable / Change Status)',
      icon: CircleMinus,
      onClick: handleBulkDisable,
    },
    {
      label: 'Notify selected experts / services',
      icon: Bell,
      onClick: handleBulkNotify,
    },
    {
      label: 'Message / Raise Ticket / Escalate selected services',
      icon: Mail,
      onClick: handleBulkMessage,
    },
    {
      label: 'Suspend selected services (Suspend Listings)',
      icon: PauseCircle,
      onClick: () => setIsBulkPauseModalOpen(true),
    },
  ]

  const defaultMetricIds = useMemo(
    () => ['approvals-pending', 'reported-services', 'suspended-services', 'deleted-services'],
    [],
  )
  const activeMetricIds = useActiveMetricIds(SERVICE_MANAGEMENT_MODULE_KEY, defaultMetricIds)

  const statusCardCatalog: {
    id: string
    label: string
    count: number
    gradient: string
    border: string
    icon: LucideIcon
    status: string
  }[] = [
    {
      id: 'approvals-pending',
      label: 'Approvals Pending',
      count: counts.approvalsPending,
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: Hourglass,
      status: 'pending',
    },
    {
      id: 'reported-services',
      label: 'Reported Services',
      count: counts.reportedServices,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: AlertCircle,
      status: 'reported',
    },
    {
      id: 'suspended-services',
      label: 'Suspended Services',
      count: counts.suspendedServices,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: Ban,
      status: 'suspended',
    },
    {
      id: 'deleted-services',
      label: 'Deleted Services',
      count: counts.deletedServices,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: Trash2,
      status: 'deleted',
    },
    {
      id: 'active-services',
      label: 'Active Services',
      count: meta?.pagination?.total ?? 0,
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: CheckSquare,
      status: 'active',
    },
    {
      id: 'total-services',
      label: 'Total Services',
      count: meta?.pagination?.total ?? 0,
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: Package,
      status: 'all',
    },
  ]

  const statusCards = orderByActiveMetricIds(statusCardCatalog, activeMetricIds)

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
            onClick={() => navigate('/services/management/metrics?section=table')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
        </div>
      </div>

      <StatusQuickLinkRow>
        {statusCards.map((card) => (
          <StatusQuickLinkCard
            key={card.id}
            title={card.label}
            value={card.count}
            icon={card.icon}
            background={card.gradient}
            border={card.border}
            size="listing"
            selected={activeStatus === card.status}
            onClick={() => {
              if (card.status === 'reported') {
                navigate('/services/management/reported')
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
              if (card.status === 'all' || card.status === 'active') {
                setActiveStatus('all')
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
                title={action.label}
                onClick={action.onClick}
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
        description="Are you sure you want to suspend this Service? This will result in removal of the account."
        submitLabel="Suspend User"
        reasonOptions={suspendReasonOptions}
        selectedReasons={suspendReasons}
        onReasonToggle={toggleSuspendReason}
        showTimeline
        startDate={suspendStartDate}
        onStartDateChange={setSuspendStartDate}
        endDate={suspendEndDate}
        onEndDateChange={setSuspendEndDate}
        indefinite={suspendIndefinitely}
        onIndefiniteChange={setSuspendIndefinitely}
        indefiniteLabel="Suspend indefinitely (until manually reactivated)"
        adminNotes={suspendAdminNotes}
        onAdminNotesChange={setSuspendAdminNotes}
        onClose={closeSuspendModal}
        onSubmit={handleSuspendSubmit}
        isSubmitting={suspendServiceMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(deleteServiceTarget)}
        variant="delete"
        title="Delete Service"
        description="Are you sure you want to delete this user? This will result in removal of the account."
        submitLabel="Delete User"
        heroLayout="inline"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        showReasonsLabel
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        confirmationChecked={deleteConfirmed}
        onConfirmationChange={setDeleteConfirmed}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deleteServiceMutation.isPending}
      />

      <DecisionActionModal
        open={isBulkDeleteModalOpen}
        variant="delete"
        title={
          selectedServiceIds.length > 1
            ? `Delete ${selectedServiceIds.length} Services`
            : 'Delete Service'
        }
        description={`Are you sure you want to delete ${selectedServiceIds.length} selected service(s)? This action cannot be undone.`}
        submitLabel={
          selectedServiceIds.length > 1
            ? `Delete ${selectedServiceIds.length} Services`
            : 'Delete Service'
        }
        heroLayout="inline"
        reasonOptions={deleteReasonOptions}
        selectedReasons={bulkDeleteReasons}
        onReasonToggle={(value) =>
          setBulkDeleteReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        adminNotes={bulkDeleteAdminNotes}
        onAdminNotesChange={setBulkDeleteAdminNotes}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onSubmit={confirmBulkDelete}
        isSubmitting={bulkDeleteMutation.isPending}
      />

      <DecisionActionModal
        open={isBulkPauseModalOpen}
        variant="suspend"
        title={
          selectedServiceIds.length > 1
            ? `Pause ${selectedServiceIds.length} Services`
            : 'Pause Service'
        }
        description={`Are you sure you want to pause ${selectedServiceIds.length} selected service(s)? They will be hidden from clients until reactivated.`}
        submitLabel={
          selectedServiceIds.length > 1
            ? `Pause ${selectedServiceIds.length} Services`
            : 'Pause Service'
        }
        reasonOptions={suspendReasonOptions}
        selectedReasons={bulkPauseReasons}
        onReasonToggle={(value) =>
          setBulkPauseReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showTimeline
        startDate={bulkPauseStartDate}
        onStartDateChange={setBulkPauseStartDate}
        endDate={bulkPauseEndDate}
        onEndDateChange={setBulkPauseEndDate}
        indefinite={bulkPauseIndefinitely}
        onIndefiniteChange={setBulkPauseIndefinitely}
        adminNotes={bulkPauseAdminNotes}
        onAdminNotesChange={setBulkPauseAdminNotes}
        onClose={() => setIsBulkPauseModalOpen(false)}
        onSubmit={confirmBulkPause}
        isSubmitting={bulkPauseMutation.isPending}
      />
    </div>
  )
}
