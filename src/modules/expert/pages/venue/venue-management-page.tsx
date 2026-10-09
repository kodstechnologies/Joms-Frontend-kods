import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import {
  CheckSquare,
  CircleMinus,
  AlertCircle,
  PauseCircle,
  Tag,
  Trash2,
  Upload,
  Ban,
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Eye,
  Bell,
  Mail,
  FileText,
  MessageSquare,
  User,
  XCircle,
  EyeOff,
  Hourglass,
  Flag,
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
import { VENUE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import { ensureTrendChangeSign, TrendBadge } from '@/shared/components/dashboard/trend-badge'
import {
  useVenues,
  useSuspendVenue,
  useDeleteVenue,
  useBulkDeleteVenues,
  useBulkPauseVenues,
  useBulkHideVenues,
  useBulkDisableVenues,
} from '../../hooks/use-venues'
import { useVenueManagementMetrics } from '../../hooks/use-venue-dashboard'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { useVenueStore } from '../../store'
import type { Venue } from '../../type/venue'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { VENUE_MANAGEMENT_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
import { StatusQuickLinkCard, StatusQuickLinkRow } from '@/shared/components/status-quick-link-card'
import { Button } from '@/shared/components/ui/button'
import { statusCardTones } from '@/shared/lib/design-tokens'
import { useEntityTags } from '@/shared/hooks/use-entity-tags'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  getVenueApiId,
  getVenueApiSpaceId,
  getVenueDisplayId,
  getVenueDisplaySpaceId,
  getVenuePartnerId,
} from '../../utils/venue-list'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildVenueListQueryParams,
  createVenueFilteredExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import { fetchVenues } from '../../api/venue-api'
import { getListingStatusDisplay } from '../../utils/management-status'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  escalatePartnerApplication,
  escalateVenueSpaceApplication,
} from '@/modules/my-tasks/api/escalation-api'
import { fetchVenueKycByPartnerId } from '../../api/venue-kyc-api'
import {
  getVenueKycApplicationPath,
  openVenuePartnerProfile,
} from '../../utils/expert-application-navigation'
import { VenueReportSubmitModal } from '../../components/venue-report-submit-modal'
import { useAuthStore } from '@/modules/auth/store/auth-store'

type ManagementMetric = {
  id: string
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeNote?: string
  note?: string
}

import {
  DEFAULT_VENUE_MANAGEMENT_ACTIVE_METRIC_IDS,
  DEFAULT_VENUE_MANAGEMENT_VISIBLE_COLUMN_IDS,
  VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (v: Venue) => string }> = {
  'venue-id': { header: 'Venue ID', accessor: (v) => exportDisplayValue(getVenueDisplayId(v)) },
  name: { header: 'Venue Name', accessor: (v) => exportDisplayValue(v.venueName) },
  category: { header: 'Venue Category', accessor: (v) => exportDisplayValue(v.venueCategory) },
  'venue-type': {
    header: 'Venue Type',
    accessor: (v) => exportDisplayValue(v.venueType || v.eventType),
  },
  'venue-rating': {
    header: 'Venue Rating',
    accessor: (v) => exportDisplayValue(v.venueRating ?? v.ratings),
  },
  'venue-location': {
    header: 'Venue Location',
    accessor: (v) => exportDisplayValue(v.venueLocation),
  },
  status: { header: 'Venue Status', accessor: (v) => exportDisplayValue(v.status) },
  'space-id': {
    header: 'Space ID',
    accessor: (v) => exportDisplayValue(getVenueDisplaySpaceId(v)),
  },
  'space-name': { header: 'Space Name', accessor: (v) => exportDisplayValue(v.spaceName) },
  'space-category': {
    header: 'Space Category',
    accessor: (v) => exportDisplayValue(v.spaceCategory),
  },
  'space-location': {
    header: 'Space Location',
    accessor: (v) => exportDisplayValue(v.spaceLocation),
  },
  'space-type': { header: 'Space Type', accessor: (v) => exportDisplayValue(v.spaceType) },
  'space-status': { header: 'Space Status', accessor: (v) => exportDisplayValue(v.spaceStatus) },
  'space-price': { header: 'Space Price', accessor: (v) => exportDisplayValue(v.spacePrice) },
  'space-rating': { header: 'Space Rating', accessor: (v) => exportDisplayValue(v.spaceRating) },
  revenue: { header: 'Revenue', accessor: (v) => exportDisplayValue(v.revenue) },
  city: { header: 'City', accessor: (v) => exportDisplayValue(v.city) },
  'events-hosted': {
    header: 'Number of Events Hosted',
    accessor: (v) => exportDisplayValue(v.eventsHosted),
  },
  'meetups-hosted': {
    header: 'Number of Meetups Hosted',
    accessor: (v) => exportDisplayValue(v.meetupsHosted),
  },
  'repeat-booking-rate': {
    header: 'Repeat Booking Rate',
    accessor: (v) => exportDisplayValue(v.repeatBookingRate),
  },
  'space-utilization': {
    header: 'Space Utilization %',
    accessor: (v) => exportDisplayValue(v.spaceUtilization),
  },
  'venue-nps': { header: 'Venue NPS', accessor: (v) => exportDisplayValue(v.venueNps) },
  'host-cancellation-rate': {
    header: 'Host Cancellation Rate',
    accessor: (v) => exportDisplayValue(v.hostCancellationRate),
  },
  'created-at': {
    header: 'Created At',
    accessor: (v) =>
      v.createdAt
        ? new Date(v.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
  },
  'last-updated-at': {
    header: 'Last Updated At',
    accessor: (v) => {
      const d = v.lastUpdatedAt || v.updatedAt
      return d
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''
    },
  },
}

const DEFAULT_VISIBLE_IDS = DEFAULT_VENUE_MANAGEMENT_VISIBLE_COLUMN_IDS

const ACTION_ITEM_CLASS = 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'

export const VenueManagementPage = () => {
  const authUser = useAuthStore((state) => state.user)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])
  const { tagModalOpen, openTagModal, closeTagModal, saveTags, initialTags } = useEntityTags()

  const [suspendVenueTarget, setSuspendVenueTarget] = useState<Venue | null>(null)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendReasonDetails, setSuspendReasonDetails] = useState('')
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')

  const [deleteVenueTarget, setDeleteVenueTarget] = useState<Venue | null>(null)
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [reportVenueTarget, setReportVenueTarget] = useState<Venue | null>(null)
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

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const suspendVenueMutation = useSuspendVenue()
  const deleteVenueMutation = useDeleteVenue()
  const bulkDeleteMutation = useBulkDeleteVenues()
  const bulkPauseMutation = useBulkPauseVenues()
  const bulkHideMutation = useBulkHideVenues()
  const { allowAddVenues, allowDisableVenues } = useVenueManagementControls()
  const bulkDisableMutation = useBulkDisableVenues()

  const { data: assigneesData } = useEscalationAssignees('venues.*')
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
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendVenue)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteVenue)
  const tableColumnPreferencesQuery = useTableColumnPreferences(VENUE_MANAGEMENT_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_VENUE_MANAGEMENT_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })
  const { fileFormat } = useDefaultExportFormat()

  const confirmBulkDelete = useCallback(() => {
    if (selectedVenueIds.length === 0) return
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
        venueIds: selectedVenueIds,
        selectedReasons: bulkDeleteReasons,
        adminNotes: bulkDeleteAdminNotes.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Deleted ${selectedVenueIds.length} selected venue(s)`)
          setSelectedVenueIds([])
          setIsBulkDeleteModalOpen(false)
          setBulkDeleteReasons([])
          setBulkDeleteAdminNotes('')
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(error, 'Failed to delete venues'))
        },
      },
    )
  }, [
    selectedVenueIds,
    bulkDeleteReasons,
    bulkDeleteAdminNotes,
    deleteReasonOptions.length,
    bulkDeleteMutation,
  ])

  const confirmBulkPause = useCallback(() => {
    if (selectedVenueIds.length === 0) return
    if (suspendReasonOptions.length > 0 && bulkPauseReasons.length === 0) {
      toast.error('Please select at least one reason for pausing.')
      return
    }
    if (!bulkPauseAdminNotes.trim()) {
      toast.error('Admin notes are required for pausing.')
      return
    }

    if (!bulkPauseIndefinitely && (!bulkPauseStartDate || !bulkPauseEndDate)) {
      toast.error('Please provide a pause timeline or choose indefinitely.')
      return
    }

    if (!bulkPauseIndefinitely && isStartBeforeToday(bulkPauseStartDate)) {
      toast.error(START_BEFORE_TODAY_MESSAGE)
      return
    }

    if (!bulkPauseIndefinitely && isEndOnOrBeforeStart(bulkPauseStartDate, bulkPauseEndDate)) {
      toast.error(END_MUST_AFTER_START_MESSAGE)
      return
    }

    bulkPauseMutation.mutate(
      {
        venueIds: selectedVenueIds,
        selectedReasons: bulkPauseReasons,
        adminNotes: bulkPauseAdminNotes.trim(),
        startDate: bulkPauseStartDate,
        endDate: bulkPauseEndDate,
        indefinite: bulkPauseIndefinitely,
      },
      {
        onSuccess: () => {
          toast.success(`Paused ${selectedVenueIds.length} selected venue(s)`)
          setSelectedVenueIds([])
          setIsBulkPauseModalOpen(false)
          setBulkPauseReasons([])
          setBulkPauseAdminNotes('')
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(error, 'Failed to pause venues'))
        },
      },
    )
  }, [
    selectedVenueIds,
    bulkPauseReasons,
    bulkPauseAdminNotes,
    suspendReasonOptions.length,
    bulkPauseStartDate,
    bulkPauseEndDate,
    bulkPauseIndefinitely,
    bulkPauseMutation,
  ])

  const handleBulkHide = useCallback(() => {
    if (selectedVenueIds.length === 0) return
    bulkHideMutation.mutate(selectedVenueIds, {
      onSuccess: () => {
        toast.success(`Hidden ${selectedVenueIds.length} selected venue(s)`)
        setSelectedVenueIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(getApiErrorMessage(error, 'Failed to hide venues'))
      },
    })
  }, [selectedVenueIds, bulkHideMutation])

  const handleBulkDisable = useCallback(() => {
    if (selectedVenueIds.length === 0) return
    bulkDisableMutation.mutate(selectedVenueIds, {
      onSuccess: () => {
        toast.success(`Disabled ${selectedVenueIds.length} selected venue(s)`)
        setSelectedVenueIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(getApiErrorMessage(error, 'Failed to disable venues'))
      },
    })
  }, [selectedVenueIds, bulkDisableMutation])

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const viewFromUrl = searchParams.get('view') || ''
  const categoryIdFromUrl = searchParams.get('categoryId')?.trim() || ''
  const categoryFromUrl = searchParams.get('category')?.trim() || ''
  const subCategoryFromUrl = searchParams.get('subCategory')?.trim() || ''

  const { currentPage, setCurrentPage, activeStatus } = useVenueStore()

  useEffect(() => {
    if (!categoryIdFromUrl && !categoryFromUrl && !subCategoryFromUrl) return

    setAppliedAdvancedFilters({
      ...(categoryIdFromUrl ? { 'venues.categoryId': categoryIdFromUrl } : {}),
      ...(categoryFromUrl ? { 'venues.category': categoryFromUrl } : {}),
      ...(subCategoryFromUrl ? { 'venues.subCategory': subCategoryFromUrl } : {}),
    })
    setCurrentPage(1)
  }, [categoryIdFromUrl, categoryFromUrl, subCategoryFromUrl, setCurrentPage])

  const serverSort = useServerTableSort({
    sortFieldMap: VENUE_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      setAppliedAdvancedFilters(values)
      setCurrentPage(1)
      toast.success('Filters applied')
    },
    [setCurrentPage],
  )

  const venueQueryParams = useMemo(
    () =>
      buildVenueListQueryParams(appliedAdvancedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: activeStatus !== 'all' ? activeStatus : undefined,
        view: viewFromUrl || undefined,
        categoryId: categoryIdFromUrl || undefined,
      }),
    [
      appliedAdvancedFilters,
      currentPage,
      enhancedSearch,
      activeStatus,
      serverSort.sortParams,
      viewFromUrl,
      categoryIdFromUrl,
    ],
  )

  const { data, isLoading } = useVenues(venueQueryParams)
  const venues = useMemo(() => data?.data ?? [], [data?.data])

  const handleExportData = useMemo(
    () =>
      createVenueFilteredExportHandler(
        fetchVenues,
        EXPORT_COLUMN_MAP,
        'venues_export',
        {
          status: activeStatus !== 'all' ? activeStatus : undefined,
          ...enhancedSearch.buildSearchParams(),
          view: viewFromUrl || undefined,
          categoryId: categoryIdFromUrl || undefined,
        },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [
      activeStatus,
      catalogColumnIds,
      categoryIdFromUrl,
      enhancedSearch,
      exportColumnIds,
      viewFromUrl,
    ],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'venue-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })
  const meta = data?.meta
  const visibleVenueIds = useMemo(() => venues.map((venue) => venue._id), [venues])
  const selectedVenueCount = selectedVenueIds.length
  const allVisibleVenuesSelected =
    visibleVenueIds.length > 0 && visibleVenueIds.every((id) => selectedVenueIds.includes(id))
  const someVisibleVenuesSelected = visibleVenueIds.some((id) => selectedVenueIds.includes(id))
  const selectedVenues = useMemo(
    () => venues.filter((venue) => selectedVenueIds.includes(venue._id)),
    [venues, selectedVenueIds],
  )
  const selectedPartnerIds = useMemo(
    () => [...new Set(selectedVenues.map((venue) => getVenuePartnerId(venue)).filter(Boolean))],
    [selectedVenues],
  )

  const closeEscalateModal = useCallback(() => {
    setIsEscalateModalOpen(false)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleBulkExport = useCallback(() => {
    if (selectedVenueCount === 0) {
      toast.error('Please select at least one venue.')
      return
    }
    if (selectedVenues.length === 0) {
      toast.error(
        'Selected venues are not loaded on this page. Go back to the page where they were selected, then export.',
      )
      return
    }

    try {
      void exportMappedItemsToFile(
        EXPORT_COLUMN_MAP,
        selectedVenues,
        fileFormat,
        'selected_venues_export',
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      )
        .then(() => toast.success(`Exported ${selectedVenues.length} selected venue(s)`))
        .catch((error) => {
          toast.error(getApiErrorMessage(error, 'Failed to export selected venues.'))
        })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export selected venues.'))
    }
  }, [catalogColumnIds, exportColumnIds, fileFormat, selectedVenueCount, selectedVenues])

  const handleBulkNotify = useCallback(() => {
    if (selectedPartnerIds.length === 0) {
      toast.error('Selected venues do not have partner IDs to notify.')
      return
    }
    const params = new URLSearchParams({
      channel: 'push',
      audience: 'venue-partners',
      partnerIds: selectedPartnerIds.join(','),
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [navigate, selectedPartnerIds])

  const handleBulkMessage = useCallback(() => {
    if (selectedPartnerIds.length === 0) {
      toast.error('Selected venues do not have partner IDs to message.')
      return
    }
    const params = new URLSearchParams({
      channel: 'email',
      audience: 'venue-partners',
      partnerIds: selectedPartnerIds.join(','),
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [navigate, selectedPartnerIds])

  const openCommunicateWithHost = useCallback(
    (venue: Venue) => {
      const partnerId = getVenuePartnerId(venue)
      if (!partnerId) {
        toast.error('Venue partner ID is missing.')
        return
      }
      const params = new URLSearchParams({
        channel: 'email',
        audience: 'venue-partners',
        partnerIds: partnerId,
      })
      navigate(`/communication/create?${params.toString()}`)
    },
    [navigate],
  )

  const openSpaceRoute = useCallback(
    (venue: Venue, suffix = '') => {
      const venueApiId = getVenueApiId(venue)
      const spaceApiId = getVenueApiSpaceId(venue)
      if (!venueApiId || !spaceApiId) {
        toast.error('This row does not have a space to open.')
        return
      }
      navigate(`/venues/management/profile/${venueApiId}/space/${spaceApiId}${suffix}`)
    },
    [navigate],
  )

  const openViewHostProfile = useCallback(
    (venue: Venue) => {
      const partnerId = getVenuePartnerId(venue)
      if (!partnerId) {
        toast.error('Venue partner ID is missing.')
        return
      }
      void openVenuePartnerProfile(partnerId, navigate)
    },
    [navigate],
  )

  const handleExportVenueRow = useCallback(
    async (venue: Venue) => {
      try {
        await exportMappedItemsToFile(
          EXPORT_COLUMN_MAP,
          [venue],
          fileFormat,
          `venue_${getVenueDisplayId(venue)}`,
          { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
        )
        toast.success('Venue exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export venue'))
      }
    },
    [catalogColumnIds, exportColumnIds, fileFormat],
  )

  const openEscalateForVenue = useCallback((venue: Venue) => {
    setSelectedVenueIds([venue._id])
    setIsEscalateModalOpen(true)
  }, [])

  const handleEscalateSubmit = useCallback(async () => {
    if (selectedVenues.length === 0) {
      toast.error('Please select at least one venue.')
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
        selectedVenues.map((venue) => {
          const spaceId = getVenueApiSpaceId(venue)
          const venueId = getVenueApiId(venue)
          const partnerId = getVenuePartnerId(venue)
          const payload = {
            assigneeSubAdminId: selectedEscalationOption,
            assigneeName: selectedAssignee?.fullname || '',
            adminNote: note,
            entityTitle: venue.spaceName || venue.venueName,
            venueId,
          }

          if (spaceId) {
            return escalateVenueSpaceApplication(spaceId, {
              ...payload,
              applicationUrl: `/venues/management/profile/${venueId}/space/${spaceId}`,
            })
          }

          if (!partnerId) {
            return Promise.reject(new Error(`No partner found for ${venue.venueName || venueId}`))
          }

          return fetchVenueKycByPartnerId(partnerId).then((response) => {
            const kycId = String(response?.data?._id || '').trim()
            return escalatePartnerApplication(partnerId, {
              ...payload,
              escalationTarget: 'application',
              applicationUrl: kycId
                ? getVenueKycApplicationPath(kycId)
                : getVenueKycApplicationPath(partnerId),
            })
          })
        }),
      )

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      if (successCount === 0) {
        const firstError = results.find((result) => result.status === 'rejected') as
          | PromiseRejectedResult
          | undefined
        toast.error(getApiErrorMessage(firstError?.reason, 'Failed to escalate venues.'))
        return
      }

      toast.success(
        failedCount > 0
          ? `Escalated ${successCount} venue(s); ${failedCount} failed.`
          : `Successfully escalated ${successCount} venue(s)`,
      )
      setSelectedVenueIds([])
      closeEscalateModal()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to escalate venues.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    selectedEscalationOption,
    selectedVenues,
  ])

  const toggleVisibleVenues = useCallback(() => {
    setSelectedVenueIds((currentIds) => {
      if (allVisibleVenuesSelected) {
        return currentIds.filter((id) => !visibleVenueIds.includes(id))
      }

      return Array.from(new Set([...currentIds, ...visibleVenueIds]))
    })
  }, [allVisibleVenuesSelected, visibleVenueIds])

  const toggleVenueSelection = useCallback((venueId: string) => {
    setSelectedVenueIds((currentIds) =>
      currentIds.includes(venueId)
        ? currentIds.filter((id) => id !== venueId)
        : [...currentIds, venueId],
    )
  }, [])

  const openSuspendModal = useCallback(
    (venue: Venue) => {
      if (!allowDisableVenues) {
        toast.error('Disabling venues is turned off in Venue Management settings')
        return
      }
      setSuspendVenueTarget(venue)
      setSuspendReasons([])
      setSuspendStartDate('')
      setSuspendEndDate('')
      setSuspendIndefinitely(false)
      setSuspendReasonDetails('')
      setSuspendAdminNotes('')
    },
    [allowDisableVenues],
  )

  const closeSuspendModal = useCallback(() => {
    setSuspendVenueTarget(null)
  }, [])

  const openDeleteModal = useCallback((venue: Venue) => {
    setDeleteVenueTarget(venue)
    setDeleteReasons([])
    setDeleteAdminNotes('')
    setDeleteConfirmed(false)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteVenueTarget(null)
    setDeleteReasons([])
    setDeleteConfirmed(false)
  }, [])

  const toggleDeleteReason = useCallback((value: string) => {
    setDeleteReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const handleDeleteSubmit = useCallback(() => {
    if (!deleteVenueTarget) return

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

    deleteVenueMutation.mutate(
      {
        venueId: getVenueApiId(deleteVenueTarget),
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
          toast.success('Venue deleted successfully')
          closeDeleteModal()
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to delete venue.'))
        },
      },
    )
  }, [
    buildDeleteReasonPayload,
    closeDeleteModal,
    deleteAdminNotes,
    deleteConfirmed,
    deleteReasons,
    deleteVenueMutation,
    deleteVenueTarget,
    recordReasonUsage,
  ])

  const toggleSuspendReason = useCallback((value: string) => {
    setSuspendReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const handleSuspendSubmit = useCallback(() => {
    if (!suspendVenueTarget) return

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

    const templateDetails = reasonPayload.reasonDetails
    const extraDetails = suspendReasonDetails.trim()
    const reasonDetails = [templateDetails, extraDetails].filter(Boolean).join('\n\n')

    suspendVenueMutation.mutate(
      {
        venueId: getVenueApiId(suspendVenueTarget),
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          suspendIndefinitely,
          startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
          endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
          reasonDetails,
          adminNotes: suspendAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success('Venue suspended successfully')
          closeSuspendModal()
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to suspend venue. Please try again.'))
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
    suspendReasonDetails,
    suspendReasons,
    suspendStartDate,
    suspendVenueMutation,
    suspendVenueTarget,
  ])
  const counts = {
    approvalsPending: meta?.counts?.approvalsPending ?? 0,
    reportedVenues: meta?.counts?.reportedVenues ?? 0,
    suspendedVenues: meta?.counts?.suspendedVenues ?? 0,
    rejectedVenues: meta?.counts?.rejectedVenues ?? 0,
    deletedVenues: meta?.counts?.deletedVenues ?? 0,
  }

  const defaultMetricIds = useMemo(() => DEFAULT_VENUE_MANAGEMENT_ACTIVE_METRIC_IDS, [])
  const activeMetricIds = useActiveMetricIds(VENUE_MANAGEMENT_MODULE_KEY, defaultMetricIds)

  const managementMetricsQuery = useVenueManagementMetrics()
  const apiMetrics = managementMetricsQuery.data?.metrics

  const fallbackMetrics: ManagementMetric[] = useMemo(
    () => [
      { id: 'total-venues-listed', label: 'Total Venues Listed', value: '0' },
      { id: 'active-venues', label: 'Active Venues', value: '0' },
      { id: 'pending-venues', label: 'Pending Venues', value: '0' },
      { id: 'total-bookings', label: 'Total Bookings', value: '0' },
      { id: 'completed-bookings', label: 'Completed Bookings', value: '0' },
      { id: 'cancellation-pct', label: 'Cancellation %', value: '0%' },
      { id: 'total-revenue', label: 'Total Revenue', value: '₹0' },
      { id: 'avg-venue-ratings', label: 'Avg. Venue Ratings', value: '0/5' },
    ],
    [],
  )

  const metricCatalog: ManagementMetric[] = useMemo(() => {
    if (apiMetrics?.length) return apiMetrics
    return fallbackMetrics
  }, [apiMetrics, fallbackMetrics])

  const visibleMetrics = useMemo(
    () => orderByActiveMetricIds(metricCatalog, activeMetricIds),
    [activeMetricIds, metricCatalog],
  )

  const metricsLoading = managementMetricsQuery.isLoading
  const skeletonCount = activeMetricIds?.length || defaultMetricIds.length

  const statusCards: {
    id: string
    label: string
    count: number
    gradient: string
    border: string
    icon: LucideIcon
    href: string
  }[] = [
    {
      id: 'approvals-pending',
      label: 'Approvals Pending',
      count: counts.approvalsPending,
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: Hourglass,
      href: '/venues/management/pending',
    },
    {
      id: 'suspended-venues',
      label: 'Suspended Venues',
      count: counts.suspendedVenues,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: Ban,
      href: '/venues/management/suspended',
    },
    {
      id: 'reported-venues',
      label: 'Reported Venues',
      count: counts.reportedVenues,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: AlertCircle,
      href: '/venues/management',
    },
    {
      id: 'rejected-venues',
      label: 'Rejected Venues',
      count: counts.rejectedVenues,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: XCircle,
      href: '/venues/management',
    },
    {
      id: 'deleted-venues',
      label: 'Deleted Venues',
      count: counts.deletedVenues,
      gradient: statusCardTones.neutral.background,
      border: statusCardTones.neutral.border,
      icon: Trash2,
      href: '/venues/management/deleted',
    },
  ]

  const columns = useMemo<ColumnDef<Venue>[]>(() => {
    const selectColumn: ColumnDef<Venue> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all venues"
          checked={allVisibleVenuesSelected}
          ref={(input) => {
            if (input) input.indeterminate = someVisibleVenuesSelected && !allVisibleVenuesSelected
          }}
          onChange={toggleVisibleVenues}
          className="ui-table-checkbox"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.venueName}`}
          checked={selectedVenueIds.includes(row.original._id)}
          onChange={() => toggleVenueSelection(row.original._id)}
          onClick={(event) => event.stopPropagation()}
          className="ui-table-checkbox"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }
    const dataColumnsById: Record<string, ColumnDef<Venue>> = {
      'venue-id': {
        id: 'venue-id',
        accessorKey: 'venueid',
        header: 'Venue ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{getVenueDisplayId(row.original)}</span>
        ),
      },
      name: {
        id: 'name',
        accessorKey: 'venueName',
        header: 'Venue Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.venueName || '—'}</span>
        ),
      },
      category: {
        id: 'category',
        accessorKey: 'venueCategory',
        header: 'Venue Category',
        cell: ({ row }) => <span className="text-white">{row.original.venueCategory || '—'}</span>,
      },
      'venue-type': {
        id: 'venue-type',
        accessorKey: 'venueType',
        header: 'Venue Type',
        cell: ({ row }) => (
          <span className="text-white">
            {row.original.venueType || row.original.eventType || '—'}
          </span>
        ),
      },
      'venue-rating': {
        id: 'venue-rating',
        accessorKey: 'venueRating',
        header: 'Venue Rating',
        cell: ({ row }) => {
          const rating = row.original.venueRating ?? row.original.ratings
          return rating ? (
            <span className="inline-flex items-center gap-1 font-medium text-amber-400">
              ★ {rating}
            </span>
          ) : (
            '—'
          )
        },
      },
      'venue-location': {
        id: 'venue-location',
        accessorKey: 'venueLocation',
        header: 'Venue Location',
        cell: ({ row }) => (
          <span
            className="block max-w-[200px] truncate text-slate-300"
            title={row.original.venueLocation}
          >
            {row.original.venueLocation || '—'}
          </span>
        ),
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Venue Status',
        cell: ({ row }) => {
          const statusToShow = row.original.spaceStatus || row.original.status
          const { label, className } = getListingStatusDisplay(statusToShow, {
            isSuspend:
              row.original.isSuspend ||
              String(row.original.spaceStatus || '').toLowerCase() === 'suspended',
          })

          return <span className={className}>{label}</span>
        },
      },
      'space-id': {
        id: 'space-id',
        accessorKey: 'spaceid',
        header: 'Space ID',
        cell: ({ row }) => (
          <span className="ui-table-id">{getVenueDisplaySpaceId(row.original)}</span>
        ),
      },
      'space-name': {
        id: 'space-name',
        accessorKey: 'spaceName',
        header: 'Space Name',
        cell: ({ row }) => <span className="text-white">{row.original.spaceName || '—'}</span>,
      },
      'space-category': {
        id: 'space-category',
        accessorKey: 'spaceCategory',
        header: 'Space Category',
        cell: ({ row }) => (
          <span className="text-slate-300">{row.original.spaceCategory || '—'}</span>
        ),
      },
      'space-location': {
        id: 'space-location',
        accessorKey: 'spaceLocation',
        header: 'Space Location',
        cell: ({ row }) => (
          <span
            className="block max-w-[180px] truncate text-slate-300"
            title={row.original.spaceLocation}
          >
            {row.original.spaceLocation || '—'}
          </span>
        ),
      },
      'space-type': {
        id: 'space-type',
        accessorKey: 'spaceType',
        header: 'Space Type',
        cell: ({ row }) => <span className="text-slate-300">{row.original.spaceType || '—'}</span>,
      },
      'space-status': {
        id: 'space-status',
        accessorKey: 'spaceStatus',
        header: 'Space Status',
        cell: ({ row }) => {
          if (!row.original.spaceStatus) {
            return <span className="text-slate-500">—</span>
          }
          const { label, className } = getListingStatusDisplay(row.original.spaceStatus, {
            isSuspend: String(row.original.spaceStatus || '').toLowerCase() === 'suspended',
          })
          return <span className={className}>{label}</span>
        },
      },
      'space-price': {
        id: 'space-price',
        accessorKey: 'spacePrice',
        header: 'Space Price',
        cell: ({ row }) => {
          const price = row.original.spacePrice
          return price != null ? `₹${Number(price).toLocaleString('en-IN')}` : '—'
        },
      },
      'space-rating': {
        id: 'space-rating',
        accessorKey: 'spaceRating',
        header: 'Space Rating',
        cell: ({ row }) => {
          const rating = row.original.spaceRating
          return rating ? (
            <span className="inline-flex items-center gap-1 font-medium text-amber-400">
              ★ {rating}
            </span>
          ) : (
            '—'
          )
        },
      },
      revenue: {
        id: 'revenue',
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) => {
          const rev = row.original.revenue
          return rev != null ? `₹${Number(rev).toLocaleString('en-IN')}` : '₹0'
        },
      },
      city: {
        id: 'city',
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => row.original.city || '—',
      },
      'events-hosted': {
        id: 'events-hosted',
        accessorKey: 'eventsHosted',
        header: 'Number of Events Hosted',
        cell: ({ row }) => row.original.eventsHosted ?? '0',
      },
      'meetups-hosted': {
        id: 'meetups-hosted',
        accessorKey: 'meetupsHosted',
        header: 'Number of Meetups Hosted',
        cell: ({ row }) => row.original.meetupsHosted ?? '0',
      },
      'repeat-booking-rate': {
        id: 'repeat-booking-rate',
        accessorKey: 'repeatBookingRate',
        header: 'Repeat Booking Rate',
        cell: ({ row }) => {
          const rate = row.original.repeatBookingRate
          return rate != null ? `${rate}%` : '—'
        },
      },
      'space-utilization': {
        id: 'space-utilization',
        accessorKey: 'spaceUtilization',
        header: 'Space Utilization %',
        cell: ({ row }) => {
          const rate = row.original.spaceUtilization
          return rate != null ? `${rate}%` : '—'
        },
      },
      'venue-nps': {
        id: 'venue-nps',
        accessorKey: 'venueNps',
        header: 'Venue NPS',
        cell: ({ row }) => {
          const nps = row.original.venueNps
          return nps != null ? nps : '—'
        },
      },
      'host-cancellation-rate': {
        id: 'host-cancellation-rate',
        accessorKey: 'hostCancellationRate',
        header: 'Host Cancellation Rate',
        cell: ({ row }) => {
          const rate = row.original.hostCancellationRate
          return rate != null ? `${rate}%` : '0%'
        },
      },
      'created-at': {
        id: 'created-at',
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => <TableDateTimeCell value={row.original.createdAt} />,
      },
      'last-updated-at': {
        id: 'last-updated-at',
        accessorKey: 'lastUpdatedAt',
        header: 'Last Updated At',
        cell: ({ row }) => (
          <TableDateTimeCell value={row.original.lastUpdatedAt || row.original.updatedAt} />
        ),
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<Venue> = {
      id: 'actions',
      accessorFn: () => null,
      header: 'Actions',
      meta: {
        headerClassName: 'pr-5 text-right',
        cellClassName: 'relative pr-5 text-right',
      },
      cell: ({ row }) => {
        const venue = row.original
        const isOpen = activeDropdownId === venue._id

        return (
          <TableActionsDropdown
            label={`Open actions for ${venue.venueName}`}
            isOpen={isOpen}
            onOpenChange={(open) => setActiveDropdownId(open ? venue._id : null)}
            menuWidth={220}
            maxVisibleItems={10}
          >
            <TableActionsItem
              icon={<LayoutDashboard className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                navigate(`/venues/management/profile/${getVenueApiId(venue)}`)
              }}
            >
              View Profile
            </TableActionsItem>

            <TableActionsItem
              icon={<Eye className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openSpaceRoute(venue)
              }}
            >
              View Space Details
            </TableActionsItem>

            <TableActionsItem
              icon={<CalendarDays className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openSpaceRoute(venue, '/bookings')
              }}
            >
              View Bookings
            </TableActionsItem>

            <TableActionsItem
              icon={<Wallet className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openSpaceRoute(venue, '/revenue')
              }}
            >
              View Revenue & Payouts
            </TableActionsItem>

            <TableActionsItem
              icon={<Tag className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openTagModal(getVenueApiId(venue))
              }}
            >
              Add Tags
            </TableActionsItem>

            {allowDisableVenues ? (
              <TableActionsItem
                icon={<PauseCircle className="size-3.5 text-slate-700" />}
                className={ACTION_ITEM_CLASS}
                onClick={() => {
                  setActiveDropdownId(null)
                  openSuspendModal(venue)
                }}
              >
                Suspend Venue
              </TableActionsItem>
            ) : null}

            <TableActionsItem
              icon={<Trash2 className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openDeleteModal(venue)
              }}
            >
              Delete Venue
            </TableActionsItem>

            <TableActionsItem
              icon={<Flag className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                setReportVenueTarget(venue)
              }}
            >
              Report Venue
            </TableActionsItem>

            <TableActionsItem
              icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openViewHostProfile(venue)
              }}
            >
              View Host Profile
            </TableActionsItem>

            <TableActionsItem
              icon={<MessageSquare className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openCommunicateWithHost(venue)
              }}
            >
              Communicate with Host
            </TableActionsItem>

            <TableActionsItem
              icon={<FileText className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openEscalateForVenue(venue)
              }}
            >
              Escalate
            </TableActionsItem>

            <TableActionsItem
              icon={<ExportDataIcon className="size-3.5" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                void handleExportVenueRow(venue)
              }}
            >
              Export Venue Data
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta(
      [selectColumn, ...preferenceColumns, actionsColumn],
      VENUE_COLUMN_SORT_FIELDS,
    )
  }, [
    activeDropdownId,
    allVisibleVenuesSelected,
    allowDisableVenues,
    handleExportVenueRow,
    navigate,
    openCommunicateWithHost,
    openDeleteModal,
    openEscalateForVenue,
    openSuspendModal,
    openTagModal,
    openSpaceRoute,
    openViewHostProfile,
    selectedVenueIds,
    someVisibleVenuesSelected,
    tableColumnPreferencesQuery.data,
    toggleVenueSelection,
    toggleVisibleVenues,
  ])

  const bulkActions = [
    {
      label: 'Delete selected venues (Delete Venues)',
      icon: Trash2,
      onClick: () => setIsBulkDeleteModalOpen(true),
    },
    {
      label: 'Export selected venues',
      icon: Upload,
      onClick: handleBulkExport,
    },
    {
      label: 'Hide selected venues (Hide Venues)',
      icon: EyeOff,
      onClick: handleBulkHide,
    },
    {
      label: 'Disable selected venues (Disable / Change Status)',
      icon: CircleMinus,
      onClick: handleBulkDisable,
    },
    {
      label: 'Notify selected venue partners',
      icon: Bell,
      onClick: handleBulkNotify,
    },
    {
      label: 'Escalate selected venues',
      icon: FileText,
      onClick: () => setIsEscalateModalOpen(true),
    },
    {
      label: 'Message selected venue partners',
      icon: Mail,
      onClick: handleBulkMessage,
    },
    ...(allowDisableVenues
      ? [
          {
            label: 'Suspend selected venues (Suspend Venues)',
            icon: PauseCircle,
            onClick: () => setIsBulkPauseModalOpen(true),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Venue Management</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Comprehensive user data and admin controls
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/metrics')}
          >
            <ManageMetricsIcon />
            Manage Metrics
          </Button>
          {allowAddVenues ? (
            <Button
              type="button"
              className="h-9 w-full md:w-auto"
              onClick={() => navigate('/venues/management/onboarding')}
            >
              <img src={createIcon} alt="create" className="size-4" />
              Create Account
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {metricsLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={`venue-mgmt-metric-skeleton-${index}`}
                className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-4"
              >
                <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/10" />
                <div className="mt-4 h-5 w-32 animate-pulse rounded bg-white/5" />
              </div>
            ))
          : visibleMetrics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-4 transition-colors hover:border-white/10"
              >
                <p className="text-body-sm text-muted font-medium">{metric.label}</p>
                <p className="text-h3 mt-2 font-bold tracking-tight text-white">{metric.value}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {metric.change ? (
                    <>
                      <TrendBadge direction={metric.changeType === 'down' ? 'down' : 'up'}>
                        {ensureTrendChangeSign(
                          metric.change,
                          metric.changeType === 'down' ? 'down' : 'up',
                        )}
                      </TrendBadge>
                      {metric.changeNote ? (
                        <span className="text-muted text-[10px]">{metric.changeNote}</span>
                      ) : null}
                    </>
                  ) : null}
                  {metric.note ? (
                    <span className="text-muted text-[10px]">{metric.note}</span>
                  ) : null}
                </div>
              </div>
            ))}
      </div>

      <StatusQuickLinkRow>
        {statusCards.map((card) => (
          <StatusQuickLinkCard
            key={card.id}
            title={card.label}
            value={card.count ?? 0}
            icon={card.icon}
            background={card.gradient}
            border={card.border}
            size="listing"
            onClick={() => {
              if (card.id === 'reported-venues') {
                navigate('/venues/management/reported')
                return
              }
              navigate(card.href)
            }}
          />
        ))}
      </StatusQuickLinkRow>

      {selectedVenueCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>
              {selectedVenueCount} {selectedVenueCount === 1 ? 'Venue' : 'Venues'} Selected
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
        data={venues}
        getRowId={(venue) => venue._id}
        isLoading={isLoading}
        {...serverSort.dataTableSortProps}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_MANAGEMENT_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by venue name or venue ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="venues"
        emptyMessage="No venues found."
      />

      {exportFilterModals}

      <DecisionActionModal
        open={Boolean(suspendVenueTarget)}
        variant="suspend"
        title="Suspend Venue"
        headerDescription="Are you sure you want to suspend this venue? This action will prevent new bookings and notify existing customers."
        description=""
        submitLabel="Suspend"
        showHeroIcon={false}
        submitIcon="none"
        reasonOptions={suspendReasonOptions}
        selectedReasons={suspendReasons}
        onReasonToggle={toggleSuspendReason}
        showReasonsLabel
        showTimeline
        startDate={suspendStartDate}
        onStartDateChange={setSuspendStartDate}
        endDate={suspendEndDate}
        onEndDateChange={setSuspendEndDate}
        indefinite={suspendIndefinitely}
        onIndefiniteChange={setSuspendIndefinitely}
        reason={suspendReasonDetails}
        onReasonChange={setSuspendReasonDetails}
        reasonLabel="Reasons"
        reasonRequired={false}
        reasonFieldType="input"
        adminNotes={suspendAdminNotes}
        onAdminNotesChange={setSuspendAdminNotes}
        onClose={closeSuspendModal}
        onSubmit={handleSuspendSubmit}
        isSubmitting={suspendVenueMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(deleteVenueTarget)}
        variant="delete"
        title="Delete Venue"
        headerDescription="Are you sure you want to delete this venue? This action will prevent new bookings and notify existing customers."
        description="Are you sure you want to delete this user? This will result in removal of the account."
        submitLabel="Delete User"
        heroLayout="stack"
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
        isSubmitting={deleteVenueMutation.isPending}
      />

      <DecisionActionModal
        open={isBulkDeleteModalOpen}
        variant="delete"
        title={
          selectedVenueIds.length > 1 ? `Delete ${selectedVenueIds.length} Venues` : 'Delete Venue'
        }
        description={`Are you sure you want to delete ${selectedVenueIds.length} selected venue(s)? This action cannot be undone.`}
        submitLabel={
          selectedVenueIds.length > 1 ? `Delete ${selectedVenueIds.length} Venues` : 'Delete Venue'
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
          selectedVenueIds.length > 1 ? `Pause ${selectedVenueIds.length} Venues` : 'Pause Venue'
        }
        description={`Are you sure you want to pause ${selectedVenueIds.length} selected venue(s)? They will be hidden from clients until reactivated.`}
        submitLabel={
          selectedVenueIds.length > 1 ? `Pause ${selectedVenueIds.length} Venues` : 'Pause Venue'
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

      <DecisionActionModal
        open={isEscalateModalOpen}
        variant="escalate"
        title={
          selectedVenueCount > 1 ? `Escalate ${selectedVenueCount} Venues` : 'Escalate Application'
        }
        description={
          selectedVenueCount > 1
            ? `Are you sure you want to escalate ${selectedVenueCount} selected venues? These will be reviewed by the selected sub-admin.`
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

      {reportVenueTarget && authUser ? (
        <VenueReportSubmitModal
          open={Boolean(reportVenueTarget)}
          venueId={getVenueApiId(reportVenueTarget)}
          partnerId={getVenuePartnerId(reportVenueTarget)}
          venueName={reportVenueTarget.venueName || getVenueDisplayId(reportVenueTarget)}
          reporterId={authUser.id}
          reporterName={authUser.fullname || authUser.email || 'Admin'}
          onClose={() => setReportVenueTarget(null)}
          onSubmitted={() => navigate('/venues/management/reported')}
        />
      ) : null}
    </div>
  )
}
