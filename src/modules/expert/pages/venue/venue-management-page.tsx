import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import {
  CheckSquare,
  CircleMinus,
  AlertCircle,
  PauseCircle,
  Trash2,
  Upload,
  BarChart3,
  Ban,
  Hourglass,
  LayoutDashboard,
  Bell,
  Mail,
  CircleOff,
  EyeOff,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { VENUE_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import {
  useVenues,
  useSuspendVenue,
  useDeleteVenue,
  useBulkDeleteVenues,
  useBulkPauseVenues,
  useBulkHideVenues,
  useBulkDisableVenues,
  useBulkExportVenues,
  useBulkNotifyVenues,
  useBulkMessageVenues,
} from '../../hooks/use-venues'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { useVenueStore } from '../../store'
import type { Venue, VenueStatus } from '../../type/venue'
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
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { getVenueApiId, getVenueDisplayId, getVenueDisplaySpaceId } from '../../utils/venue-list'
import { getManagementStatusDisplay } from '../../utils/management-status'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

type ManagementMetric = {
  id: string
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeNote?: string
  note?: string
}

const ACTION_ITEM_CLASS = 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'

export const VenueManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])

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

  const suspendVenueMutation = useSuspendVenue()
  const deleteVenueMutation = useDeleteVenue()
  const bulkDeleteMutation = useBulkDeleteVenues()
  const bulkPauseMutation = useBulkPauseVenues()
  const bulkHideMutation = useBulkHideVenues()
  const bulkDisableMutation = useBulkDisableVenues()
  const bulkExportMutation = useBulkExportVenues()
  const bulkNotifyMutation = useBulkNotifyVenues()
  const bulkMessageMutation = useBulkMessageVenues()

  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendVenue)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteVenue)
  const tableColumnPreferencesQuery = useTableColumnPreferences(VENUE_MANAGEMENT_MODULE_KEY)

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
          toast.error(error?.response?.data?.message || 'Failed to delete venues')
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
          toast.error(error?.response?.data?.message || 'Failed to pause venues')
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
        toast.error(error?.response?.data?.message || 'Failed to hide venues')
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
        toast.error(error?.response?.data?.message || 'Failed to disable venues')
      },
    })
  }, [selectedVenueIds, bulkDisableMutation])

  const handleBulkExport = useCallback(() => {
    if (selectedVenueIds.length === 0) return
    bulkExportMutation.mutate(selectedVenueIds, {
      onSuccess: (res: { data?: { venues?: unknown[] } }) => {
        const venuesData = res?.data?.venues ?? []
        toast.success(`Exported ${venuesData.length || selectedVenueIds.length} venue(s)`)
        setSelectedVenueIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to export venues')
      },
    })
  }, [selectedVenueIds, bulkExportMutation])

  const handleBulkNotify = useCallback(() => {
    if (selectedVenueIds.length === 0) return
    bulkNotifyMutation.mutate(selectedVenueIds, {
      onSuccess: (res: { message?: string; data?: { message?: string } }) => {
        toast.success(
          res?.data?.message ||
            res?.message ||
            `Notified partners for ${selectedVenueIds.length} venue(s)`,
        )
        setSelectedVenueIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to notify venue partners')
      },
    })
  }, [selectedVenueIds, bulkNotifyMutation])

  const handleBulkMessage = useCallback(() => {
    if (selectedVenueIds.length === 0) return
    bulkMessageMutation.mutate(selectedVenueIds, {
      onSuccess: (res: { message?: string; data?: { message?: string } }) => {
        toast.success(
          res?.data?.message ||
            res?.message ||
            `Sent message/ticket for ${selectedVenueIds.length} venue(s)`,
        )
        setSelectedVenueIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to send message')
      },
    })
  }, [selectedVenueIds, bulkMessageMutation])

  const navigate = useNavigate()

  const { searchQuery, setSearchQuery, currentPage, setCurrentPage, activeStatus } = useVenueStore()

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
    moduleKey: 'venue-management',
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

  const { data, isLoading } = useVenues({
    page: currentPage,
    limit: 10,
    status:
      activeStatus !== 'all'
        ? (activeStatus as VenueStatus | 'reported')
        : (apiFilterParams.listingStatus as VenueStatus | 'reported' | undefined),
    search: searchQuery,
    ...apiFilterParams,
  })
  const venues = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta
  const visibleVenueIds = useMemo(() => venues.map((venue) => venue._id), [venues])
  const selectedVenueCount = selectedVenueIds.length
  const allVisibleVenuesSelected =
    visibleVenueIds.length > 0 && visibleVenueIds.every((id) => selectedVenueIds.includes(id))
  const someVisibleVenuesSelected = visibleVenueIds.some((id) => selectedVenueIds.includes(id))

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

  const openSuspendModal = useCallback((venue: Venue) => {
    setSuspendVenueTarget(venue)
    setSuspendReasons([])
    setSuspendStartDate('')
    setSuspendEndDate('')
    setSuspendIndefinitely(false)
    setSuspendReasonDetails('')
    setSuspendAdminNotes('')
  }, [])

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
          toast.error(err?.response?.data?.message || 'Failed to delete venue.')
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
          toast.error(err?.response?.data?.message || 'Failed to suspend venue. Please try again.')
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

  const totalVenues = meta?.pagination?.total ?? 0

  const defaultMetricIds = useMemo(
    () => [
      'total-venues-listed',
      'active-venues',
      'total-bookings',
      'completed-bookings',
      'cancellation-pct',
      'total-revenue',
      'avg-venue-ratings',
    ],
    [],
  )
  const activeMetricIds = useActiveMetricIds(VENUE_MANAGEMENT_MODULE_KEY, defaultMetricIds)

  const metricCatalog: ManagementMetric[] = useMemo(
    () => [
      {
        id: 'total-venues-listed',
        label: 'Total Venues Listed',
        value: String(totalVenues),
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'active-venues',
        label: 'Active Venues',
        value: String(Math.max(0, totalVenues - counts.suspendedVenues - counts.deletedVenues)),
        note:
          totalVenues > 0
            ? `${((Math.max(0, totalVenues - counts.suspendedVenues - counts.deletedVenues) / totalVenues) * 100).toFixed(1)}% of total`
            : undefined,
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'total-bookings',
        label: 'Total Bookings',
        value: '3',
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'completed-bookings',
        label: 'Completed Bookings',
        value: '10',
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'cancellation-pct',
        label: 'Cancellation %',
        value: '20',
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: '20',
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'avg-venue-ratings',
        label: 'Avg. Venue Ratings',
        value: '20',
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'pending-venues',
        label: 'Pending Venues',
        value: String(counts.approvalsPending),
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
      {
        id: 'avg-booking-value',
        label: 'Avg. Booking Value',
        value: '₹0',
        change: '6.7%',
        changeType: 'up',
        changeNote: 'vs last month',
      },
    ],
    [counts.approvalsPending, counts.deletedVenues, counts.suspendedVenues, totalVenues],
  )

  const visibleMetrics = useMemo(
    () => orderByActiveMetricIds(metricCatalog, activeMetricIds),
    [activeMetricIds, metricCatalog],
  )

  // Status quick-links are always shown (not controlled by Manage Metrics)
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
      icon: CircleOff,
      href: '/venues/management/rejected',
    },
    {
      id: 'deleted-venues',
      label: 'Deleted Venues',
      count: counts.deletedVenues,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
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
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.venueName}`}
          checked={selectedVenueIds.includes(row.original._id)}
          onChange={() => toggleVenueSelection(row.original._id)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-700 bg-transparent"
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
        cell: ({ row }) => <span className="font-medium text-white">{row.original.venueName}</span>,
      },
      category: {
        id: 'category',
        accessorKey: 'venueCategory',
        header: 'Venue Category',
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
        cell: ({ row }) => row.original.spaceName || '—',
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { label, className } = getManagementStatusDisplay(row.original.status, {
            isSuspend: row.original.isSuspend,
          })

          return <span className={className}>{label}</span>
        },
      },
      'event-type': {
        id: 'event-type',
        accessorKey: 'eventType',
        header: 'Event Type',
      },
      'created-at': {
        id: 'created-at',
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => <TableDateTimeCell value={row.original.createdAt} />,
      },
    }

    const defaultVisibleIds = [
      'venue-id',
      'name',
      'category',
      'space-id',
      'space-name',
      'status',
      'event-type',
      'created-at',
    ]

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : defaultVisibleIds

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<Venue> = {
      id: 'actions',
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
              icon={<PauseCircle className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openSuspendModal(venue)
              }}
            >
              Suspend Venue
            </TableActionsItem>

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
          </TableActionsDropdown>
        )
      },
    }

    return [selectColumn, ...preferenceColumns, actionsColumn]
  }, [
    activeDropdownId,
    allVisibleVenuesSelected,
    navigate,
    openDeleteModal,
    openSuspendModal,
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
      label: 'Export selected venues (Export Selected)',
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
      label: 'Message / Communicate with venue partners',
      icon: Mail,
      onClick: handleBulkMessage,
    },
    {
      label: 'Suspend selected venues (Suspend Venues)',
      icon: PauseCircle,
      onClick: () => setIsBulkPauseModalOpen(true),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Venue Management</h1>
          <p className="mt-1 text-sm text-slate-400 md:text-base">
            Comprehensive user data and admin controls
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/metrics')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/onboarding')}
          >
            <img src={createIcon} alt="create" className="size-4" />
            Create Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {visibleMetrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-4 transition-colors hover:border-white/10"
          >
            <p className="text-body-sm text-muted font-medium">{metric.label}</p>
            <p className="text-h3 mt-2 font-bold tracking-tight text-white">{metric.value}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {metric.change ? (
                <>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                      metric.changeType === 'down'
                        ? 'bg-brand-danger/10 text-brand-danger'
                        : 'bg-brand-positive/15 text-brand-positive',
                    )}
                  >
                    <TrendingUp className="size-3" />
                    {metric.change}
                  </span>
                  {metric.changeNote ? (
                    <span className="text-muted text-[10px]">{metric.changeNote}</span>
                  ) : null}
                </>
              ) : null}
              {metric.note ? <span className="text-muted text-[10px]">{metric.note}</span> : null}
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
                <action.icon className="size-3.5" aria-hidden="true" />
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
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
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
    </div>
  )
}
