import { useCallback, useMemo, useState } from 'react'
import { createFilteredExportHandler, buildFilterParams } from '@/shared/utils/export-filter-utils'
import { fetchExperts } from '../../api/expert-api'
import type { ColumnDef } from '@tanstack/react-table'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import {
  AlertCircle,
  Ban,
  BarChart3,
  Bell,
  CheckSquare,
  Hourglass,
  Mail,
  PauseCircle,
  Tag,
  Trash2,
  User,
  Users,
  Gem,
  Upload,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useDeactivateExpert,
  useExperts,
  useSuspendExpert,
  useBulkSuspendExperts,
  useBulkDeactivateExperts,
  useBulkUpdateMembershipExperts,
  useBulkApproveExperts,
  useBulkRejectExperts,
  useBulkRestoreExperts,
  useBulkVerifyKycExperts,
  useBulkVerifyDigilockerExperts,
  useBulkEscalateExperts,
} from '../../hooks/use-expert'
import { MembershipActionModals } from '@/modules/memberships/components/membership-action-modals'
import { fetchExpertSubscriptions } from '@/modules/memberships/api/membership-subscription-api'
import type { MembershipSubscription } from '@/modules/memberships/types/membership-subscription'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { EXPERT_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { useExpertStore } from '../../store/expert-store'
import type { Expert } from '../../type/expert'
import { openExpertApplicationView } from '../../utils/expert-application-navigation'
import { getManagementStatusDisplay } from '../../utils/management-status'
import { DataTable } from '@/shared/components/table/data-table'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
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
import { PayoutHistoryDrawer } from '../../components/payout-history-drawer'
import { statusCardTones } from '@/shared/lib/design-tokens'
import { useEntityTags } from '@/shared/hooks/use-entity-tags'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'

const ACTION_ITEM_CLASS = 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && value.trim() === '') return 'N/A'
  return String(value)
}

const formatDateTimeCell = (value?: string | null) => (
  <TableDateTimeCell value={value} emptyLabel="N/A" />
)

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (e: Expert) => string }> = {
  'expert-id': { header: 'Expert ID', accessor: (e) => exportDisplayValue(e.expertId) },
  name: { header: 'Name', accessor: (e) => exportDisplayValue(e.name) },
  email: { header: 'Email ID', accessor: (e) => exportDisplayValue(e.email) },
  profession: { header: 'Profession', accessor: (e) => exportDisplayValue(e.profession) },
  status: { header: 'Status', accessor: (e) => exportDisplayValue(e.status) },
  'service-type': { header: 'Service Type', accessor: (e) => exportDisplayValue(e.serviceType) },
  'created-at': {
    header: 'Created At',
    accessor: (e) =>
      e.createdAt
        ? new Date(e.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
  },
  'last-active': {
    header: 'Last Active',
    accessor: (e) =>
      e.lastActive
        ? new Date(e.lastActive).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
  },
  reason: { header: 'Reason', accessor: (e) => exportDisplayValue(e.reason) },
  'reported-at': {
    header: 'Reported At',
    accessor: (e) =>
      e.reportedAt
        ? new Date(e.reportedAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
  },
  'deleted-at': {
    header: 'Deleted At',
    accessor: (e) =>
      e.deletedAt
        ? new Date(e.deletedAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
  },
}

const DEFAULT_VISIBLE_IDS = [
  'expert-id',
  'name',
  'email',
  'profession',
  'status',
  'service-type',
  'created-at',
  'last-active',
]

export const ExpertManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([])
  const { tagModalOpen, openTagModal, closeTagModal, saveTags, initialTags } = useEntityTags()
  const [suspendExpertTarget, setSuspendExpertTarget] = useState<Expert | null>(null)
  const [deleteExpertTarget, setDeleteExpertTarget] = useState<Expert | null>(null)
  const [payoutDrawerTarget, setPayoutDrawerTarget] = useState<Expert | null>(null)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<FilterValues>({})
  const navigate = useNavigate()
  const suspendExpertMutation = useSuspendExpert()
  const deactivateExpertMutation = useDeactivateExpert()
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendExpert)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteExpert)
  const tableColumnPreferencesQuery = useTableColumnPreferences(EXPERT_MANAGEMENT_MODULE_KEY)
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    activeStatus,
    setActiveStatus,
  } = useExpertStore()

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      setAppliedAdvancedFilters(values)
      setCurrentPage(1)
      toast.success('Filters applied')
    },
    [setCurrentPage],
  )

  const apiFilterParams = useMemo(
    () => buildFilterParams(appliedAdvancedFilters),
    [appliedAdvancedFilters],
  )

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: activeStatus !== 'all' ? activeStatus : apiFilterParams.accountStatus,
    search: searchQuery,
    ...apiFilterParams,
  })
  const experts = useMemo(() => data?.data || [], [data?.data])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(fetchExperts, EXPORT_COLUMN_MAP, 'experts_export', {
        status: activeStatus !== 'all' ? activeStatus : undefined,
        search: searchQuery || undefined,
      }),
    [activeStatus, searchQuery],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'expert-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })
  const meta = data?.meta
  const visibleExpertIds = useMemo(() => experts.map((expert) => expert.expertId), [experts])
  const selectedExpertCount = selectedExpertIds.length
  const allVisibleExpertsSelected =
    visibleExpertIds.length > 0 && visibleExpertIds.every((id) => selectedExpertIds.includes(id))
  const someVisibleExpertsSelected = visibleExpertIds.some((id) => selectedExpertIds.includes(id))
  const counts = meta?.counts || {
    approvalsPending: 0,
    reportedExperts: 0,
    suspendedExperts: 0,
    deletedExperts: 0,
    activeExperts: 0,
    totalExperts: 0,
  }

  const toggleVisibleexperts = useCallback(() => {
    setSelectedExpertIds((currentIds) => {
      if (allVisibleExpertsSelected) {
        return currentIds.filter((id) => !visibleExpertIds.includes(id))
      }

      return Array.from(new Set([...currentIds, ...visibleExpertIds]))
    })
  }, [allVisibleExpertsSelected, visibleExpertIds])

  const toggleExpertSelection = useCallback((serviceId: string) => {
    setSelectedExpertIds((currentIds) =>
      currentIds.includes(serviceId)
        ? currentIds.filter((id) => id !== serviceId)
        : [...currentIds, serviceId],
    )
  }, [])

  const [isBulkSuspend, setIsBulkSuspend] = useState(false)
  const [isBulkDelete, setIsBulkDelete] = useState(false)

  const openSuspendModal = useCallback((expert?: Expert) => {
    if (expert) {
      setSuspendExpertTarget(expert)
      setIsBulkSuspend(false)
    } else {
      setSuspendExpertTarget(null)
      setIsBulkSuspend(true)
    }
    setSuspendReasons([])
    setSuspendStartDate('')
    setSuspendEndDate('')
    setSuspendIndefinitely(false)
    setSuspendAdminNotes('')
  }, [])

  const closeSuspendModal = useCallback(() => {
    setSuspendExpertTarget(null)
    setIsBulkSuspend(false)
  }, [])

  const openDeleteModal = useCallback((expert?: Expert) => {
    if (expert) {
      setDeleteExpertTarget(expert)
      setIsBulkDelete(false)
    } else {
      setDeleteExpertTarget(null)
      setIsBulkDelete(true)
    }
    setDeleteReasons([])
    setDeleteAdminNotes('')
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteExpertTarget(null)
    setDeleteReasons([])
    setIsBulkDelete(false)
  }, [])

  const toggleDeleteReason = useCallback((value: string) => {
    setDeleteReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const toggleSuspendReason = useCallback((value: string) => {
    setSuspendReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  // Bulk Mutations & Logic
  const bulkSuspendMutation = useBulkSuspendExperts()
  const bulkDeactivateMutation = useBulkDeactivateExperts()
  const bulkUpdateMembershipMutation = useBulkUpdateMembershipExperts()
  const bulkApproveMutation = useBulkApproveExperts()
  const bulkRejectMutation = useBulkRejectExperts()
  const bulkRestoreMutation = useBulkRestoreExperts()
  const bulkVerifyKycMutation = useBulkVerifyKycExperts()
  const bulkVerifyDigilockerMutation = useBulkVerifyDigilockerExperts()
  const bulkEscalateMutation = useBulkEscalateExperts()

  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false)
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')

  const { data: assigneesData } = useEscalationAssignees('experts.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const selectedPartnerIds = useMemo(() => {
    return experts
      .filter(
        (exp) => selectedExpertIds.includes(exp.expertId) || selectedExpertIds.includes(exp.id),
      )
      .map((exp) => exp.id || exp.expertId)
  }, [experts, selectedExpertIds])

  const selectedExperts = useMemo(() => {
    return experts.filter(
      (exp) => selectedExpertIds.includes(exp.expertId) || selectedExpertIds.includes(exp.id),
    )
  }, [experts, selectedExpertIds])

  const closeEscalateModal = useCallback(() => {
    setIsEscalateModalOpen(false)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleBulkExportSelected = useCallback(() => {
    if (selectedExpertCount === 0) {
      toast.error('Please select at least one expert.')
      return
    }

    if (selectedExperts.length === 0) {
      toast.error(
        'Selected experts are not loaded on this page. Go back to the page where they were selected, then export.',
      )
      return
    }

    try {
      const headers = [
        'Expert ID',
        'Name',
        'Email ID',
        'Profession',
        'Status',
        'Service Type',
        'Created At',
        'Last Login',
      ]
      const rows = selectedExperts.map((e) => [
        displayValue(e.expertId),
        displayValue(e.name),
        displayValue(e.email),
        displayValue(e.profession),
        displayValue(e.status),
        displayValue(e.serviceType),
        e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A',
        e.lastActive ? new Date(e.lastActive).toLocaleDateString() : 'N/A',
      ])
      exportDataToFile(headers, rows, 'excel', 'selected_experts_export')
      toast.success(`Exported ${selectedExperts.length} selected expert(s)`)
    } catch {
      toast.error('Failed to export selected experts.')
    }
  }, [selectedExpertCount, selectedExperts])

  const handleEscalateSubmit = useCallback(() => {
    const ids = selectedPartnerIds.length > 0 ? selectedPartnerIds : selectedExpertIds
    if (ids.length === 0) {
      toast.error('Please select at least one expert.')
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

    bulkEscalateMutation.mutate(
      {
        partnerIds: ids,
        assigneeSubAdminId: selectedEscalationOption,
        assigneeName: selectedAssignee?.fullname || '',
        adminNote: escalateAdminNotes.trim(),
        targetAdminId: selectedEscalationOption,
      },
      {
        onSuccess: (res: unknown) => {
          const data = res as { data?: { successCount?: number } }
          toast.success(
            `Successfully escalated ${data?.data?.successCount ?? ids.length} expert(s)`,
          )
          setSelectedExpertIds([])
          closeEscalateModal()
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(error?.response?.data?.message || 'Failed to escalate experts.')
        },
      },
    )
  }, [
    assigneesData?.data,
    bulkEscalateMutation,
    closeEscalateModal,
    escalateAdminNotes,
    selectedEscalationOption,
    selectedExpertIds,
    selectedPartnerIds,
  ])

  const handleSuspendSubmit = useCallback(() => {
    if (!suspendExpertTarget && !isBulkSuspend) return

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

    if (isBulkSuspend) {
      const ids = selectedPartnerIds.length > 0 ? selectedPartnerIds : selectedExpertIds
      if (ids.length === 0) return

      bulkSuspendMutation.mutate(
        {
          partnerIds: ids,
          reason: reasonPayload.reasonDetails,
          adminNote: suspendAdminNotes.trim(),
          adminNotes: suspendAdminNotes.trim(),
          selectedReasons: reasonPayload.selectedReasons,
        },
        {
          onSuccess: (res: unknown) => {
            if (reasonPayload.reasonIds.length > 0) {
              recordReasonUsage.mutate(reasonPayload.reasonIds)
            }
            const data = res as { data?: { successCount?: number } }
            toast.success(
              `Successfully suspended ${data?.data?.successCount ?? ids.length} expert(s)`,
            )
            setSelectedExpertIds([])
            closeSuspendModal()
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to suspend experts.')
          },
        },
      )
      return
    }

    suspendExpertMutation.mutate(
      {
        id: suspendExpertTarget!.id,
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
          toast.success('Expert suspended successfully')
          closeSuspendModal()
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to suspend expert. Please try again.')
        },
      },
    )
  }, [
    buildSuspendReasonPayload,
    bulkSuspendMutation,
    closeSuspendModal,
    isBulkSuspend,
    recordReasonUsage,
    selectedExpertIds,
    selectedPartnerIds,
    suspendAdminNotes,
    suspendEndDate,
    suspendExpertMutation,
    suspendExpertTarget,
    suspendIndefinitely,
    suspendReasons,
    suspendStartDate,
  ])

  const handleDeleteSubmit = useCallback(() => {
    if (!deleteExpertTarget && !isBulkDelete) return

    if (deleteReasons.length === 0) {
      toast.error('Please select at least one reason.')
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

    if (isBulkDelete) {
      const ids = selectedPartnerIds.length > 0 ? selectedPartnerIds : selectedExpertIds
      if (ids.length === 0) return

      bulkDeactivateMutation.mutate(
        {
          partnerIds: ids,
          reason: reasonPayload.reasonDetails,
          adminNote: deleteAdminNotes.trim(),
          adminNotes: deleteAdminNotes.trim(),
          selectedReasons: reasonPayload.selectedReasons,
        },
        {
          onSuccess: (res: unknown) => {
            if (reasonPayload.reasonIds.length > 0) {
              recordReasonUsage.mutate(reasonPayload.reasonIds)
            }
            const data = res as { data?: { successCount?: number } }
            toast.success(
              `Successfully deleted ${data?.data?.successCount ?? ids.length} expert(s)`,
            )
            setSelectedExpertIds([])
            closeDeleteModal()
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to delete experts.')
          },
        },
      )
      return
    }

    deactivateExpertMutation.mutate(
      {
        id: deleteExpertTarget!.id,
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
          toast.success('Expert deleted successfully')
          closeDeleteModal()
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to delete expert. Please try again.')
        },
      },
    )
  }, [
    buildDeleteReasonPayload,
    bulkDeactivateMutation,
    closeDeleteModal,
    deactivateExpertMutation,
    deleteAdminNotes,
    deleteExpertTarget,
    deleteReasons,
    isBulkDelete,
    recordReasonUsage,
    selectedExpertIds,
    selectedPartnerIds,
  ])

  const handleBulkActionClick = useCallback(
    (actionLabel: string) => {
      const ids = selectedPartnerIds.length > 0 ? selectedPartnerIds : selectedExpertIds
      if (ids.length === 0) {
        toast.error('Please select at least one expert.')
        return
      }

      if (actionLabel.includes('Delete')) {
        openDeleteModal()
      } else if (actionLabel.includes('Suspend')) {
        openSuspendModal()
      } else if (actionLabel.includes('Membership') || actionLabel.includes('Upgrade')) {
        void (async () => {
          try {
            const response = await fetchExpertSubscriptions({
              partnerIds: ids.join(','),
              status: 'active',
              page: 1,
              limit: Math.min(Math.max(ids.length, 1), 1000),
            })
            const withMembership = new Set(
              (response.data?.subscriptions ?? [])
                .map((item) => String(item.partnerId || '').trim())
                .filter(Boolean),
            )

            const missingExperts = experts.filter((exp) => {
              const partnerId = String(exp.id || '').trim()
              const isSelected =
                selectedExpertIds.includes(exp.expertId) ||
                selectedExpertIds.includes(exp.id) ||
                ids.includes(partnerId)
              if (!isSelected || !partnerId) return false
              return !withMembership.has(partnerId)
            })

            if (missingExperts.length > 0) {
              if (missingExperts.length === 1) {
                toast.error(
                  `${missingExperts[0]?.name || 'This expert'} does not have any membership.`,
                )
              } else {
                toast.error(`${missingExperts.length} selected experts do not have any membership.`)
              }
              return
            }

            setIsMembershipModalOpen(true)
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error?.response?.data?.message || 'Failed to verify expert memberships.')
          }
        })()
      } else if (actionLabel.includes('Export') || actionLabel.includes('Share')) {
        handleBulkExportSelected()
      } else if (actionLabel.includes('Escalate') || actionLabel.includes('Ticket')) {
        setIsEscalateModalOpen(true)
      } else if (actionLabel.includes('Notify')) {
        const params = new URLSearchParams({
          channel: 'push',
          audience: 'expert-management',
          partnerIds: ids.join(','),
        })
        navigate(`/communication/create?${params.toString()}`)
      } else if (actionLabel.includes('Message') || actionLabel.includes('Communicate')) {
        const params = new URLSearchParams({
          channel: 'email',
          audience: 'expert-management',
          partnerIds: ids.join(','),
        })
        navigate(`/communication/create?${params.toString()}`)
      } else if (actionLabel.includes('Approve')) {
        bulkApproveMutation.mutate(
          { partnerIds: ids },
          {
            onSuccess: () => {
              toast.success(`Successfully approved ${ids.length} expert(s)`)
              setSelectedExpertIds([])
            },
            onError: (err: unknown) => {
              const error = err as { response?: { data?: { message?: string } } }
              toast.error(error?.response?.data?.message || 'Failed to approve experts.')
            },
          },
        )
      } else if (actionLabel.includes('Reject')) {
        bulkRejectMutation.mutate(
          { partnerIds: ids, reason: 'Bulk rejected by admin' },
          {
            onSuccess: () => {
              toast.success(`Successfully rejected ${ids.length} expert(s)`)
              setSelectedExpertIds([])
            },
            onError: (err: unknown) => {
              const error = err as { response?: { data?: { message?: string } } }
              toast.error(error?.response?.data?.message || 'Failed to reject experts.')
            },
          },
        )
      } else if (actionLabel.includes('Restore') || actionLabel.includes('Unsuspend')) {
        bulkRestoreMutation.mutate(
          { partnerIds: ids },
          {
            onSuccess: () => {
              toast.success(`Successfully restored ${ids.length} expert(s)`)
              setSelectedExpertIds([])
            },
            onError: (err: unknown) => {
              const error = err as { response?: { data?: { message?: string } } }
              toast.error(error?.response?.data?.message || 'Failed to restore experts.')
            },
          },
        )
      } else if (actionLabel.includes('Verify KYC') || actionLabel.includes('KYC')) {
        bulkVerifyKycMutation.mutate(
          { partnerIds: ids },
          {
            onSuccess: () => {
              toast.success(`KYC marked as verified for ${ids.length} expert(s)`)
              setSelectedExpertIds([])
            },
            onError: (err: unknown) => {
              const error = err as { response?: { data?: { message?: string } } }
              toast.error(error?.response?.data?.message || 'Failed to verify KYC.')
            },
          },
        )
      } else if (actionLabel.includes('DigiLocker')) {
        bulkVerifyDigilockerMutation.mutate(
          { partnerIds: ids },
          {
            onSuccess: () => {
              toast.success(`DigiLocker marked as verified for ${ids.length} expert(s)`)
              setSelectedExpertIds([])
            },
            onError: (err: unknown) => {
              const error = err as { response?: { data?: { message?: string } } }
              toast.error(error?.response?.data?.message || 'Failed to verify DigiLocker.')
            },
          },
        )
      } else {
        toast.info(`${actionLabel} completed for ${ids.length} expert(s)`)
        setSelectedExpertIds([])
      }
    },
    [
      bulkApproveMutation,
      bulkRejectMutation,
      bulkRestoreMutation,
      bulkVerifyDigilockerMutation,
      bulkVerifyKycMutation,
      experts,
      handleBulkExportSelected,
      navigate,
      openDeleteModal,
      openSuspendModal,
      selectedExpertIds,
      selectedPartnerIds,
    ],
  )

  const columns = useMemo<ColumnDef<Expert>[]>(() => {
    const selectColumn: ColumnDef<Expert> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all services"
          checked={allVisibleExpertsSelected}
          ref={(input) => {
            if (input)
              input.indeterminate = someVisibleExpertsSelected && !allVisibleExpertsSelected
          }}
          onChange={toggleVisibleexperts}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.name}`}
          checked={selectedExpertIds.includes(row.original.expertId)}
          onChange={() => toggleExpertSelection(row.original.expertId)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<Expert>> = {
      'expert-id': {
        id: 'expert-id',
        accessorKey: 'expertId',
        header: 'Expert ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{displayValue(row.original.expertId)}</span>
        ),
      },
      name: {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{displayValue(row.original.name)}</span>
        ),
      },
      email: {
        id: 'email',
        accessorKey: 'email',
        header: 'Email ID',
        cell: ({ row }) => displayValue(row.original.email),
      },
      profession: {
        id: 'profession',
        accessorKey: 'profession',
        header: 'Profession',
        cell: ({ row }) => displayValue(row.original.profession),
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { label, className } = getManagementStatusDisplay(row.original.status)
          return <span className={className}>{label}</span>
        },
      },
      'service-type': {
        id: 'service-type',
        accessorKey: 'serviceType',
        header: 'Service Type',
        cell: ({ row }) => displayValue(row.original.serviceType),
      },
      'created-at': {
        id: 'created-at',
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => formatDateTimeCell(row.original.createdAt),
      },
      'last-active': {
        id: 'last-active',
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: ({ row }) => formatDateTimeCell(row.original.lastActive),
      },
      reason: {
        id: 'reason',
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => displayValue(row.original.reason),
      },
      'reported-at': {
        id: 'reported-at',
        accessorKey: 'reportedAt',
        header: 'Reported At',
        cell: ({ row }) => formatDateTimeCell(row.original.reportedAt),
      },
      'deleted-at': {
        id: 'deleted-at',
        accessorKey: 'deletedAt',
        header: 'Deleted At',
        cell: ({ row }) => formatDateTimeCell(row.original.deletedAt),
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<Expert> = {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName: 'pr-5 text-right',
        cellClassName: 'relative pr-5 text-right',
      },
      cell: ({ row }) => {
        const expert = row.original
        const isOpen = activeDropdownId === expert.expertId
        const isVenue = expert.serviceType?.toLowerCase() === 'venue'

        return (
          <TableActionsDropdown
            label={`Open actions for ${expert.name}`}
            isOpen={isOpen}
            onOpenChange={(open) => setActiveDropdownId(open ? expert.expertId : null)}
            menuWidth={220}
          >
            {!isVenue && (
              <TableActionsItem
                icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
                className={ACTION_ITEM_CLASS}
                onClick={() => {
                  setActiveDropdownId(null)
                  navigate(`/experts/management/profile/${expert.id}`)
                }}
              >
                View Profile
              </TableActionsItem>
            )}
            <TableActionsItem
              icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openExpertApplicationView(expert, navigate)
              }}
            >
              {isVenue ? 'View Venue KYC' : 'Application View'}
            </TableActionsItem>
            <TableActionsItem
              icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                setPayoutDrawerTarget(expert)
              }}
            >
              View Payout History
            </TableActionsItem>
            <TableActionsItem
              icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openSuspendModal(expert)
              }}
            >
              Suspend Expert
            </TableActionsItem>
            <TableActionsItem
              icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openDeleteModal(expert)
              }}
            >
              Delete Expert
            </TableActionsItem>
            <TableActionsItem
              icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                openTagModal(expert.id || expert.expertId)
              }}
            >
              Add Tags
            </TableActionsItem>
            <TableActionsItem
              icon={<User className="size-3.5 text-slate-700" aria-hidden="true" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => {
                setActiveDropdownId(null)
                toast.message('Report Expert is coming soon')
              }}
            >
              Report Expert
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return [selectColumn, ...preferenceColumns, actionsColumn]
  }, [
    activeDropdownId,
    allVisibleExpertsSelected,
    navigate,
    openDeleteModal,
    openSuspendModal,
    openTagModal,
    selectedExpertIds,
    someVisibleExpertsSelected,
    tableColumnPreferencesQuery.data,
    toggleExpertSelection,
    toggleVisibleexperts,
  ])

  const defaultMetricIds = useMemo(
    () => ['approvals-pending', 'reported-experts', 'suspended-experts', 'deleted-experts'],
    [],
  )
  const activeMetricIds = useActiveMetricIds(EXPERT_MANAGEMENT_MODULE_KEY, defaultMetricIds)

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
      id: 'reported-experts',
      label: 'Reported Experts',
      count: counts.reportedExperts,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: AlertCircle,
      status: 'reported',
    },
    {
      id: 'suspended-experts',
      label: 'Suspended Experts',
      count: counts.suspendedExperts,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: Ban,
      status: 'suspended',
    },
    {
      id: 'deleted-experts',
      label: 'Deleted Experts',
      count: counts.deletedExperts,
      gradient: statusCardTones.danger.background,
      border: statusCardTones.danger.border,
      icon: Trash2,
      status: 'deactivated',
    },
    {
      id: 'active-experts',
      label: 'Active Experts',
      count: counts.activeExperts ?? 0,
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: Users,
      status: 'active',
    },
    {
      id: 'total-experts',
      label: 'Total Experts',
      count: counts.totalExperts ?? 0,
      gradient: statusCardTones.warning.background,
      border: statusCardTones.warning.border,
      icon: User,
      status: 'all',
    },
  ]

  const statusCards = orderByActiveMetricIds(statusCardCatalog, activeMetricIds)

  const bulkActions = [
    { label: 'Delete selected experts', icon: Trash2 },
    { label: 'Export selected experts', icon: Upload },
    { label: 'Escalate selected experts', icon: FileText },
    { label: 'Update Membership', icon: Gem },
    { label: 'Notify selected experts', icon: Bell },
    { label: 'Message selected experts', icon: Mail },
    { label: 'Suspend selected experts', icon: PauseCircle },
  ]

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Expert Management</h1>

          <p className="mt-1 text-sm text-slate-400 md:text-base">
            Comprehensive user data and admin controls
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/experts/management/metrics?section=table')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/experts/management/create')}
          >
            <img src={createIcon} alt="create" className="size-4" />
            Create Account
          </Button>
        </div>
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
            selected={activeStatus === card.status}
            onClick={() => {
              if (card.status === 'pending') {
                navigate('/experts/pending-approvals')
                return
              }
              if (card.status === 'suspended') {
                navigate('/experts/suspended')
                return
              }

              if (card.status === 'reported') {
                navigate('/experts/reported')
                return
              }

              if (card.status === 'deactivated') {
                navigate('/experts/deleted')
                return
              }

              if (card.status === 'all' || card.status === 'active') {
                setActiveStatus('all')
              }
            }}
          />
        ))}
      </StatusQuickLinkRow>

      {selectedExpertCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>
              {selectedExpertCount} {selectedExpertCount === 1 ? 'Expert' : 'Experts'} Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                type="button"
                aria-label={action.label}
                title={action.label}
                onClick={() => handleBulkActionClick(action.label)}
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
        data={experts}
        getRowId={(expert) => expert.expertId}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or expert ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="experts"
        emptyMessage="No experts found."
      />

      {/* Export & Advanced Filter Modals */}
      {exportFilterModals}

      {/* Payout History Drawer */}
      <PayoutHistoryDrawer
        isOpen={Boolean(payoutDrawerTarget)}
        onClose={() => setPayoutDrawerTarget(null)}
        expertId={payoutDrawerTarget?.id || payoutDrawerTarget?.expertId || ''}
        expertName={payoutDrawerTarget?.name || 'Alex Joh'}
      />

      <DecisionActionModal
        open={Boolean(suspendExpertTarget) || isBulkSuspend}
        variant="suspend"
        title={isBulkSuspend ? `Suspend ${selectedExpertCount} Experts` : 'Suspend Expert'}
        description={
          isBulkSuspend
            ? `Are you sure you want to suspend ${selectedExpertCount} selected expert(s)? This will restrict their account access.`
            : 'Are you sure you want to suspend this Expert? This will result in removal of the account.'
        }
        submitLabel={isBulkSuspend ? `Suspend ${selectedExpertCount} Experts` : 'Suspend User'}
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
        adminNotes={suspendAdminNotes}
        onAdminNotesChange={setSuspendAdminNotes}
        onClose={closeSuspendModal}
        onSubmit={handleSuspendSubmit}
        isSubmitting={suspendExpertMutation.isPending || bulkSuspendMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(deleteExpertTarget) || isBulkDelete}
        variant="delete"
        title={isBulkDelete ? `Delete ${selectedExpertCount} Experts` : 'Delete Expert'}
        description={
          isBulkDelete
            ? `Are you sure you want to delete ${selectedExpertCount} selected expert(s)? This will result in soft deletion of their accounts.`
            : 'Are you sure you want to delete this user? This will result in removal of the account.'
        }
        submitLabel={isBulkDelete ? `Delete ${selectedExpertCount} Experts` : 'Delete Expert'}
        submitIcon="x"
        heroLayout="stack"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        showReasonsLabel={false}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deactivateExpertMutation.isPending || bulkDeactivateMutation.isPending}
      />

      <DecisionActionModal
        open={isEscalateModalOpen}
        variant="escalate"
        title={
          selectedExpertCount > 1
            ? `Escalate ${selectedExpertCount} Experts`
            : 'Escalate Application'
        }
        description={
          selectedExpertCount > 1
            ? `Are you sure you want to escalate ${selectedExpertCount} selected experts? These will be reviewed by the selected sub-admin.`
            : 'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.'
        }
        submitLabel="Escalate"
        escalationOptions={escalationOptions}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        adminNotes={escalateAdminNotes}
        onAdminNotesChange={setEscalateAdminNotes}
        onClose={closeEscalateModal}
        onSubmit={handleEscalateSubmit}
        isSubmitting={bulkEscalateMutation.isPending}
      />

      {isMembershipModalOpen && (
        <MembershipActionModals
          subscription={
            {
              _id: 'bulk-membership-update',
              membershipPlanId: '',
              status: 'active',
            } as unknown as MembershipSubscription
          }
          action="upgrade"
          onClose={() => setIsMembershipModalOpen(false)}
          onUpgrade={(payload) => {
            const ids = selectedPartnerIds.length > 0 ? selectedPartnerIds : selectedExpertIds
            bulkUpdateMembershipMutation.mutate(
              {
                partnerIds: ids,
                planId: payload.newMembershipPlanId,
                newMembershipPlanId: payload.newMembershipPlanId,
                billingCycleName: payload.billingCycleName,
                adminNotes: payload.adminNotes,
                reasons: payload.reasons,
              },
              {
                onSuccess: () => {
                  toast.success(`Membership plan updated for ${ids.length} expert(s)`)
                  setSelectedExpertIds([])
                  setIsMembershipModalOpen(false)
                },
                onError: (err: unknown) => {
                  const error = err as { response?: { data?: { message?: string } } }
                  toast.error(error?.response?.data?.message || 'Failed to update membership.')
                },
              },
            )
          }}
          onDowngrade={() => {}}
          onExtend={() => {}}
          onCancel={() => {}}
          isSubmitting={bulkUpdateMembershipMutation.isPending}
        />
      )}

      <AddTagModal
        open={tagModalOpen}
        onClose={closeTagModal}
        initialTags={initialTags}
        onSubmit={saveTags}
      />
    </div>
  )
}
