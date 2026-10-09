import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import {
  AlertCircle,
  Ban,
  Bell,
  CheckSquare,
  CircleMinus,
  Eye,
  EyeOff,
  FileText,
  Hourglass,
  Mail,
  Package,
  PauseCircle,
  PlayCircle,
  BarChart3,
  ShoppingBag,
  Tag,
  Trash2,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  END_MUST_AFTER_START_MESSAGE,
  isEndOnOrBeforeStart,
  isStartBeforeToday,
  START_BEFORE_TODAY_MESSAGE,
} from '@/shared/utils/date-range'

import { SERVICE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_SERVICE_MANAGEMENT_VISIBLE_COLUMN_IDS,
  SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '../../config/service-management-table-columns.config'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import {
  useServices,
  useSuspendService,
  useDeleteService,
  useBulkDeleteServices,
  useBulkPauseServices,
  useBulkHideServices,
  useBulkDisableServices,
} from '../../hooks/use-services'
import { useUnpauseServiceListing } from '../../hooks/use-service-drilldown'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import {
  getServiceManagementViewPath,
  getServiceViewDetailsPath,
  servicePerformancePath,
  consultationPerformancePath,
} from '../../lib/service-navigation'
import { useServiceStore } from '../../store/service-store'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { SERVICE_MANAGEMENT_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { PauseCategoryModal } from '../../components/category/pause-category-modal'
import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
import { StatusQuickLinkCard, StatusQuickLinkRow } from '@/shared/components/status-quick-link-card'
import { Button } from '@/shared/components/ui/button'
import { statusCardTones } from '@/shared/lib/design-tokens'
import { useEntityTags } from '@/shared/hooks/use-entity-tags'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  buildServiceListQueryParams,
  createServiceFilteredExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import { fetchServices } from '../../api/service-api'
import { SERVICE_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  escalateConsultationApplication,
  escalateServiceApplication,
} from '@/modules/my-tasks/api/escalation-api'

export const ServiceManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const { tagModalOpen, openTagModal, closeTagModal, saveTags, initialTags } = useEntityTags()

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
  const [bulkDeleteConfirmed, setBulkDeleteConfirmed] = useState(false)

  const [isBulkPauseModalOpen, setIsBulkPauseModalOpen] = useState(false)
  const [pauseListingTarget, setPauseListingTarget] = useState<Service | null>(null)

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [escalateTarget, setEscalateTarget] = useState<Service | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const suspendServiceMutation = useSuspendService()
  const deleteServiceMutation = useDeleteService()
  const bulkDeleteMutation = useBulkDeleteServices()
  const bulkPauseMutation = useBulkPauseServices()
  const unpauseListingMutation = useUnpauseServiceListing()
  const bulkHideMutation = useBulkHideServices()
  const bulkDisableMutation = useBulkDisableServices()

  const { data: assigneesData } = useEscalationAssignees('services.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendService)
  const { options: pauseReasonOptions, buildPayload: buildPauseReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.pauseService)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteService)

  const confirmBulkDelete = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    if (deleteReasonOptions.length > 0 && bulkDeleteReasons.length === 0) {
      toast.error('Please select at least one reason for deletion.')
      return
    }
    if (!bulkDeleteConfirmed) {
      toast.error('Please confirm the delete reasons before continuing.')
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
          setBulkDeleteConfirmed(false)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(error, 'Failed to delete services'))
        },
      },
    )
  }, [
    selectedServiceIds,
    bulkDeleteReasons,
    bulkDeleteConfirmed,
    bulkDeleteAdminNotes,
    deleteReasonOptions.length,
    bulkDeleteMutation,
  ])

  const confirmBulkPause = useCallback(
    (payload: { reasons: string[]; adminNotes: string }) => {
      const serviceIds = pauseListingTarget ? [pauseListingTarget._id] : selectedServiceIds
      if (serviceIds.length === 0) return
      const reasonPayload = buildPauseReasonPayload(payload.reasons)
      if (pauseReasonOptions.length > 0 && reasonPayload.selectedReasons.length === 0) {
        toast.error('Please select at least one reason for pausing.')
        return
      }
      if (!payload.adminNotes.trim()) {
        toast.error('Admin notes are required for pausing.')
        return
      }

      bulkPauseMutation.mutate(
        {
          serviceIds,
          selectedReasons: reasonPayload.selectedReasons,
          adminNotes: payload.adminNotes.trim(),
          indefinite: true,
        },
        {
          onSuccess: () => {
            if (reasonPayload.reasonIds.length > 0) {
              recordReasonUsage.mutate(reasonPayload.reasonIds)
            }
            toast.success(
              pauseListingTarget
                ? `Paused ${pauseListingTarget.title || 'listing'}`
                : `Paused ${serviceIds.length} selected service(s)`,
            )
            setSelectedServiceIds([])
            setPauseListingTarget(null)
            setIsBulkPauseModalOpen(false)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(getApiErrorMessage(error, 'Failed to pause services'))
          },
        },
      )
    },
    [
      pauseListingTarget,
      selectedServiceIds,
      pauseReasonOptions.length,
      buildPauseReasonPayload,
      recordReasonUsage,
      bulkPauseMutation,
    ],
  )

  const handleBulkHide = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkHideMutation.mutate(selectedServiceIds, {
      onSuccess: () => {
        toast.success(`Hidden / Unpublished ${selectedServiceIds.length} selected service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(getApiErrorMessage(error, 'Failed to hide services'))
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
        toast.error(getApiErrorMessage(error, 'Failed to disable services'))
      },
    })
  }, [selectedServiceIds, bulkDisableMutation])

  const tableColumnPreferencesQuery = useTableColumnPreferences(SERVICE_MANAGEMENT_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_SERVICE_MANAGEMENT_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })
  const { fileFormat } = useDefaultExportFormat()

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryIdFromUrl = searchParams.get('categoryId')?.trim() || ''
  const categoryFromUrl = searchParams.get('category')?.trim() || ''
  const subCategoryFromUrl = searchParams.get('subCategory')?.trim() || ''

  const { currentPage, setCurrentPage, activeStatus, setActiveStatus } = useServiceStore()
  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })

  useEffect(() => {
    if (!categoryIdFromUrl && !categoryFromUrl && !subCategoryFromUrl) return

    setAppliedAdvancedFilters({
      ...(categoryIdFromUrl ? { 'services.categoryId': categoryIdFromUrl } : {}),
      ...(categoryFromUrl ? { 'services.category': categoryFromUrl } : {}),
      ...(subCategoryFromUrl ? { 'services.subCategory': subCategoryFromUrl } : {}),
    })
    setCurrentPage(1)
  }, [categoryIdFromUrl, categoryFromUrl, subCategoryFromUrl, setCurrentPage])

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      setAppliedAdvancedFilters(values)
      setCurrentPage(1)
      toast.success('Filters applied')
    },
    [setCurrentPage, setAppliedAdvancedFilters],
  )

  const handleExportData = useMemo(
    () =>
      createServiceFilteredExportHandler(
        fetchServices,
        SERVICE_EXPORT_COLUMN_MAP,
        'services_export',
        {
          status: activeStatus !== 'all' ? activeStatus : undefined,
          ...enhancedSearch.buildSearchParams(),
          categoryId: categoryIdFromUrl || undefined,
        },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [activeStatus, catalogColumnIds, categoryIdFromUrl, enhancedSearch, exportColumnIds],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'service-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const serviceQueryParams = useMemo(
    () =>
      buildServiceListQueryParams(appliedAdvancedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: activeStatus !== 'all' ? activeStatus : undefined,
        categoryId: categoryIdFromUrl || undefined,
      }),
    [
      appliedAdvancedFilters,
      activeStatus,
      categoryIdFromUrl,
      currentPage,
      enhancedSearch,
      serverSort.sortParams,
    ],
  )

  const { data, isLoading } = useServices(serviceQueryParams)

  const services = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta
  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const selectedServiceCount = selectedServiceIds.length
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) =>
    selectedServiceIds.includes(id),
  )
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service._id)),
    [services, selectedServiceIds],
  )
  const selectedPartnerIds = useMemo(
    () => [
      ...new Set(
        selectedServices.map((service) => String(service.partnerId || '').trim()).filter(Boolean),
      ),
    ],
    [selectedServices],
  )

  const closeEscalateModal = useCallback(() => {
    setIsEscalateModalOpen(false)
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const openPauseListing = useCallback((service: Service) => {
    setPauseListingTarget(service)
    setIsBulkPauseModalOpen(true)
  }, [])

  const handleResumeListing = useCallback(
    async (service: Service) => {
      try {
        await unpauseListingMutation.mutateAsync({
          serviceId: service._id,
          payload: undefined as never,
        })
        toast.success(`Resumed ${service.title || 'listing'}`)
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to resume listing'))
      }
    },
    [unpauseListingMutation],
  )

  const openEscalateListing = useCallback((service: Service) => {
    setEscalateTarget(service)
    setIsEscalateModalOpen(true)
  }, [])

  const openViewExpert = useCallback(
    (service: Service) => {
      const partnerId = String(service.partnerId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      navigate(`/experts/management/profile/${partnerId}`)
    },
    [navigate],
  )

  const openListingPerformance = useCallback(
    (service: Service) => {
      const partnerId = String(service.partnerId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing for this listing.')
        return
      }
      const isConsultation = String(service.serviceType || '')
        .toLowerCase()
        .includes('consultation')
      navigate(
        isConsultation
          ? consultationPerformancePath(partnerId, service._id)
          : servicePerformancePath(partnerId, service._id),
      )
    },
    [navigate],
  )

  const handleExportServiceRow = useCallback(
    async (service: Service) => {
      try {
        await exportMappedItemsToFile(
          SERVICE_EXPORT_COLUMN_MAP,
          [service],
          fileFormat,
          `service_${service.serviceid || service._id}`,
          { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
        )
        toast.success('Service exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export service'))
      }
    },
    [catalogColumnIds, exportColumnIds, fileFormat],
  )

  const handleBulkExport = useCallback(() => {
    if (selectedServiceCount === 0) {
      toast.error('Please select at least one service.')
      return
    }
    if (selectedServices.length === 0) {
      toast.error(
        'Selected services are not loaded on this page. Go back to the page where they were selected, then export.',
      )
      return
    }

    try {
      void exportMappedItemsToFile(
        SERVICE_EXPORT_COLUMN_MAP,
        selectedServices,
        fileFormat,
        'selected_services_export',
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      )
        .then(() => toast.success(`Exported ${selectedServices.length} selected service(s)`))
        .catch((error) => {
          toast.error(getApiErrorMessage(error, 'Failed to export selected services.'))
        })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export selected services.'))
    }
  }, [catalogColumnIds, exportColumnIds, fileFormat, selectedServiceCount, selectedServices])

  const handleBulkNotify = useCallback(() => {
    if (selectedPartnerIds.length === 0) {
      toast.error('Selected services do not have partner IDs to notify.')
      return
    }
    const params = new URLSearchParams({
      channel: 'push',
      audience: 'experts',
      partnerIds: selectedPartnerIds.join(','),
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [navigate, selectedPartnerIds])

  const handleBulkMessage = useCallback(() => {
    if (selectedPartnerIds.length === 0) {
      toast.error('Selected services do not have partner IDs to message.')
      return
    }
    const params = new URLSearchParams({
      channel: 'email',
      audience: 'experts',
      partnerIds: selectedPartnerIds.join(','),
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [navigate, selectedPartnerIds])

  const handleEscalateSubmit = useCallback(async () => {
    const servicesToEscalate = escalateTarget ? [escalateTarget] : selectedServices
    if (servicesToEscalate.length === 0) {
      toast.error('Please select at least one service.')
      return
    }
    if (!selectedEscalationOption) {
      toast.error('Please select a sub-admin to assign.')
      return
    }
    if (!escalateAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const selectedAssignee = (assigneesData?.data ?? []).find(
      (item) => item.id === selectedEscalationOption,
    )
    const note = escalateAdminNotes.trim()
    setIsEscalating(true)

    try {
      const results = await Promise.allSettled(
        servicesToEscalate.map((service) => {
          const isConsultation = String(service.serviceType || '')
            .toLowerCase()
            .includes('consultation')
          const payload = {
            assigneeSubAdminId: selectedEscalationOption,
            assigneeName: selectedAssignee?.fullname || '',
            adminNote: note,
            entityTitle: service.title,
            applicationUrl: getServiceManagementViewPath(service),
          }
          return isConsultation
            ? escalateConsultationApplication(service._id, payload)
            : escalateServiceApplication(service._id, payload)
        }),
      )

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      if (successCount === 0) {
        const firstError = results.find((result) => result.status === 'rejected') as
          | PromiseRejectedResult
          | undefined
        toast.error(getApiErrorMessage(firstError?.reason, 'Failed to escalate services.'))
        return
      }

      toast.success(
        failedCount > 0
          ? `Escalated ${successCount} service(s); ${failedCount} failed.`
          : escalateTarget
            ? 'Listing escalated'
            : `Successfully escalated ${successCount} service(s)`,
      )
      if (!escalateTarget) setSelectedServiceIds([])
      closeEscalateModal()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to escalate services.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    escalateTarget,
    selectedEscalationOption,
    selectedServices,
  ])

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
          toast.error(getApiErrorMessage(err, 'Failed to delete service.'))
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

    if (!suspendIndefinitely && isStartBeforeToday(suspendStartDate)) {
      toast.error(START_BEFORE_TODAY_MESSAGE)
      return
    }

    if (!suspendIndefinitely && isEndOnOrBeforeStart(suspendStartDate, suspendEndDate)) {
      toast.error(END_MUST_AFTER_START_MESSAGE)
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
          toast.error(getApiErrorMessage(err, 'Failed to suspend service. Please try again.'))
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
          className="ui-table-checkbox"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.title}`}
          checked={selectedServiceIds.includes(row.original._id)}
          onChange={() => toggleServiceSelection(row.original._id)}
          onClick={(event) => event.stopPropagation()}
          className="ui-table-checkbox"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById = buildServiceDataColumnsById()
    const defaultVisibleIds = DEFAULT_SERVICE_MANAGEMENT_VISIBLE_COLUMN_IDS

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : defaultVisibleIds

    const preferenceColumns = pickServicePreferenceColumns(
      dataColumnsById,
      visibleIds,
      defaultVisibleIds,
    )

    const actionsColumn: ColumnDef<Service> = {
      id: 'actions',
      accessorFn: () => null,
      header: 'Actions',
      meta: {
        headerClassName: 'pr-5 text-right',
        cellClassName: 'relative pr-5 text-right',
      },
      cell: ({ row }) => {
        const service = row.original
        const isOpen = activeDropdownId === service._id
        const isSuspended = Boolean(service.isSuspend) || service.status === 'suspended'
        const isDeleted = Boolean(service.isDeleted) || service.status === 'deleted'
        const isPaused = Boolean(service.isPaused) || service.status === 'paused'

        return (
          <TableActionsDropdown
            label={`Open actions for ${service.title}`}
            isOpen={isOpen}
            onOpenChange={(open) => setActiveDropdownId(open ? service._id : null)}
            menuWidth={240}
            maxVisibleItems={8}
          >
            <TableActionsItem
              icon={<Eye className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                navigate(getServiceViewDetailsPath(service))
              }}
            >
              View Details
            </TableActionsItem>
            {!isSuspended && !isDeleted ? (
              <TableActionsItem
                icon={<Tag className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  openTagModal(service._id)
                }}
              >
                Add Tags
              </TableActionsItem>
            ) : null}
            {!isSuspended && !isDeleted ? (
              <TableActionsItem
                icon={<PauseCircle className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  openSuspendModal(service)
                }}
              >
                Suspend Service
              </TableActionsItem>
            ) : null}
            {!isSuspended && !isDeleted ? (
              <TableActionsItem
                icon={<Trash2 className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  openDeleteModal(service)
                }}
              >
                Delete Service
              </TableActionsItem>
            ) : null}
            {!isSuspended && !isDeleted ? (
              <TableActionsItem
                icon={
                  isPaused ? (
                    <PlayCircle className="size-3.5" aria-hidden="true" />
                  ) : (
                    <PauseCircle className="size-3.5" aria-hidden="true" />
                  )
                }
                onClick={() => {
                  setActiveDropdownId(null)
                  if (isPaused) {
                    void handleResumeListing(service)
                    return
                  }
                  openPauseListing(service)
                }}
              >
                {isPaused ? 'Resume Listing' : 'Pause Listing'}
              </TableActionsItem>
            ) : null}
            <TableActionsItem
              icon={<ShoppingBag className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                openListingPerformance(service)
              }}
            >
              View Orders & Bookings
            </TableActionsItem>
            <TableActionsItem
              icon={<User className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                openViewExpert(service)
              }}
            >
              View Expert
            </TableActionsItem>
            <TableActionsItem
              icon={<BarChart3 className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                openListingPerformance(service)
              }}
            >
              View Analytics
            </TableActionsItem>
            <TableActionsItem
              icon={<AlertCircle className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                openEscalateListing(service)
              }}
            >
              Escalate Listing
            </TableActionsItem>
            <TableActionsItem
              icon={<ExportDataIcon className="size-3.5" />}
              onClick={() => {
                setActiveDropdownId(null)
                void handleExportServiceRow(service)
              }}
            >
              Export Record
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta(
      [selectColumn, ...preferenceColumns, actionsColumn],
      SERVICE_COLUMN_SORT_FIELDS,
    )
  }, [
    activeDropdownId,
    allVisibleServicesSelected,
    handleExportServiceRow,
    navigate,
    openDeleteModal,
    openEscalateListing,
    openListingPerformance,
    openViewExpert,
    handleResumeListing,
    openPauseListing,
    openSuspendModal,
    openTagModal,
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
      label: 'Export selected services',
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
      label: 'Notify selected experts',
      icon: Bell,
      onClick: handleBulkNotify,
    },
    {
      label: 'Escalate selected services',
      icon: FileText,
      onClick: () => setIsEscalateModalOpen(true),
    },
    {
      label: 'Message selected experts',
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
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Comprehensive service data and admin controls
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() =>
              navigate('/metrics/service-management?returnTo=/services/management&section=table')
            }
          >
            <ManageMetricsIcon />
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
                {action.label.toLowerCase().includes('export') ? (
                  <ExportDataIcon className="size-3.5" />
                ) : (
                  <action.icon className="size-3.5" aria-hidden="true" />
                )}
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
        {...serverSort.dataTableSortProps}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_MANAGEMENT_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by service name or ID"
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
        description="Are you sure you want to suspend this service? It will be hidden from users until reactivated."
        submitLabel="Suspend Service"
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
        description="Are you sure you want to delete this service? This action cannot be undone."
        submitLabel="Delete Service"
        heroLayout="inline"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        showReasonsLabel
        confirmationLabel="I confirm that I want to delete this service."
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
        description={
          selectedServiceIds.length > 1
            ? `Are you sure you want to delete ${selectedServiceIds.length} selected service(s)? This action cannot be undone.`
            : 'Are you sure you want to delete this service? This action cannot be undone.'
        }
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
        showReasonsLabel
        confirmationLabel="I confirm that I want to delete the selected service(s)."
        confirmationChecked={bulkDeleteConfirmed}
        onConfirmationChange={setBulkDeleteConfirmed}
        adminNotes={bulkDeleteAdminNotes}
        onAdminNotesChange={setBulkDeleteAdminNotes}
        onClose={() => {
          setIsBulkDeleteModalOpen(false)
          setBulkDeleteConfirmed(false)
        }}
        onSubmit={confirmBulkDelete}
        isSubmitting={bulkDeleteMutation.isPending}
      />

      <PauseCategoryModal
        open={isBulkPauseModalOpen}
        title={
          pauseListingTarget
            ? 'Pause Listing'
            : selectedServiceIds.length > 1
              ? `Pause ${selectedServiceIds.length} Services`
              : 'Pause Service'
        }
        heading={
          pauseListingTarget
            ? undefined
            : selectedServiceIds.length > 1
              ? `Are you sure you want  Pause these ${selectedServiceIds.length} Services.`
              : undefined
        }
        description="Pausing this service will temporarily stop all new requests."
        submitLabel="Pause Service"
        reasonCategorySlug={MODERATION_CATEGORY_SLUGS.pauseService}
        onClose={() => {
          setIsBulkPauseModalOpen(false)
          setPauseListingTarget(null)
        }}
        onConfirm={confirmBulkPause}
        isSubmitting={bulkPauseMutation.isPending}
      />

      <DecisionActionModal
        open={isEscalateModalOpen}
        variant="escalate"
        title={
          escalateTarget
            ? 'Escalate Listing'
            : selectedServiceCount > 1
              ? `Escalate ${selectedServiceCount} Services`
              : 'Escalate Application'
        }
        description={
          escalateTarget
            ? 'Are you sure you want to escalate this listing? It will be reviewed by the selected sub-admin.'
            : selectedServiceCount > 1
              ? `Are you sure you want to escalate ${selectedServiceCount} selected services? These will be reviewed by the selected sub-admin.`
              : 'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.'
        }
        submitLabel="Escalate"
        escalationOptions={escalationOptions}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        adminNotes={escalateAdminNotes}
        onAdminNotesChange={setEscalateAdminNotes}
        onClose={closeEscalateModal}
        onSubmit={() => {
          void handleEscalateSubmit()
        }}
        isSubmitting={isEscalating}
      />

      <AddTagModal
        open={tagModalOpen}
        onClose={closeTagModal}
        initialTags={initialTags}
        onSubmit={saveTags}
      />
    </div>
  )
}
