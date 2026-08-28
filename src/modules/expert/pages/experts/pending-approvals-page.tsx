import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, CheckCircle2, Eye, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertApplicationView, updateExpertKycStatus } from '../../api/expert-application-api'
import { fetchExperts } from '../../api/expert-api'
import {
  DEFAULT_EXPERT_PENDING_VISIBLE_COLUMN_IDS,
  EXPERT_PENDING_APPROVALS_MODULE_KEY,
} from '../../config/expert-management-table-columns.config'
import { useExperts } from '../../hooks/use-expert'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import type { Expert } from '../../type/expert'
import {
  buildExpertDataColumnsById,
  pickPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { isKycSubmittedForApplication } from '../../utils/expert-application-helpers'
import { openExpertApplicationView } from '../../utils/expert-application-navigation'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { EXPERT_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import {
  buildExpertListQueryParams,
  createFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { ExpertListHeader } from './expert-list-shared'
import { createExpertSelectColumn } from './expert-list-columns'
import { useExpertListSelection } from './use-expert-list-selection'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { useQueryClient } from '@tanstack/react-query'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

const fetchPendingExpertsForExport = async (params: Record<string, unknown>) => {
  const response = await fetchExperts({ ...params, status: 'pending' })
  return {
    data: (response.data || []).filter((expert) => expert.status === 'pending'),
    meta: response.meta,
  }
}

export function ExpertPendingApprovalsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [revokeExpertTarget, setRevokeExpertTarget] = useState<Expert | null>(null)
  const [approveExpertTarget, setApproveExpertTarget] = useState<Expert | null>(null)
  const [approveAdminNotes, setApproveAdminNotes] = useState('')
  const [approveConfirmed, setApproveConfirmed] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [revokeReasons, setRevokeReasons] = useState<string[]>([])
  const [revokeReasonDetails, setRevokeReasonDetails] = useState('')
  const [revokeAdminNotes, setRevokeAdminNotes] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: revokeReasonOptions, buildPayload: buildRevokeReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectExpert)

  const expertQueryParams = useMemo(
    () =>
      buildExpertListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: 'pending',
      }),
    [appliedFilters, currentPage, searchQuery],
  )

  const { data, isLoading } = useExperts(expertQueryParams)

  const experts = useMemo(
    () => (data?.data || []).filter((expert) => expert.status === 'pending'),
    [data?.data],
  )
  const meta = data?.meta
  const selection = useExpertListSelection(experts)

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        fetchPendingExpertsForExport,
        EXPERT_EXPORT_COLUMN_MAP,
        'pending_experts_export',
        {
          search: searchQuery.trim() || undefined,
        },
      ),
    [searchQuery],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: EXPERT_PENDING_APPROVALS_MODULE_KEY,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const tableColumnPreferencesQuery = useTableColumnPreferences(EXPERT_PENDING_APPROVALS_MODULE_KEY)

  const toggleRevokeReason = useCallback((value: string) => {
    setRevokeReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const closeRevokeModal = useCallback(() => {
    setRevokeExpertTarget(null)
    setRevokeReasons([])
    setRevokeReasonDetails('')
    setRevokeAdminNotes('')
  }, [])

  const closeApproveModal = useCallback(() => {
    setApproveExpertTarget(null)
    setApproveAdminNotes('')
    setApproveConfirmed(false)
  }, [])

  const handleRevokeSubmit = useCallback(async () => {
    if (!revokeExpertTarget) return

    if (revokeExpertTarget.serviceType?.toLowerCase() === 'venue') {
      closeRevokeModal()
      await openExpertApplicationView(revokeExpertTarget, navigate)
      return
    }

    if (revokeReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    if (!revokeReasonDetails.trim()) {
      toast.error('Please provide a rejection reason.')
      return
    }

    if (!revokeAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    setIsRevoking(true)

    try {
      const applicationResponse = await fetchExpertApplicationView(revokeExpertTarget.id)
      const application = applicationResponse?.data
      const kycId = application?.kyc?._id

      if (!isKycSubmittedForApplication(application?.expert, application?.kyc)) {
        toast.error('KYC is not submitted by partner')
        return
      }

      if (!kycId) {
        toast.error('Unable to update KYC status. Please refresh and try again.')
        return
      }

      const reasonPayload = buildRevokeReasonPayload(revokeReasons)
      if (reasonPayload.selectedReasons.length === 0) {
        toast.error('Selected reasons are no longer available. Please refresh and try again.')
        return
      }

      await updateExpertKycStatus(kycId, {
        status: 'REJECTED',
        reasonFor: reasonPayload.selectedReasons,
        rejectionReason: revokeReasonDetails.trim() || reasonPayload.reasonDetails,
        adminNote: revokeAdminNotes.trim(),
      })

      if (reasonPayload.reasonIds.length > 0) {
        recordReasonUsage.mutate(reasonPayload.reasonIds)
      }

      toast.success('Application rejected')
      closeRevokeModal()
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Failed to reject application. Please try again.')
    } finally {
      setIsRevoking(false)
    }
  }, [
    buildRevokeReasonPayload,
    closeRevokeModal,
    navigate,
    queryClient,
    recordReasonUsage,
    revokeAdminNotes,
    revokeExpertTarget,
    revokeReasonDetails,
    revokeReasons,
  ])

  const handleApproveSubmit = useCallback(async () => {
    if (!approveExpertTarget) return

    if (approveExpertTarget.serviceType?.toLowerCase() === 'venue') {
      closeApproveModal()
      await openExpertApplicationView(approveExpertTarget, navigate)
      return
    }

    if (!approveConfirmed) {
      toast.error('Please confirm this application is approved.')
      return
    }

    setIsApproving(true)
    try {
      const applicationResponse = await fetchExpertApplicationView(approveExpertTarget.id)
      const application = applicationResponse?.data
      const kycId = application?.kyc?._id

      if (!isKycSubmittedForApplication(application?.expert, application?.kyc)) {
        toast.error('KYC is not submitted by partner')
        return
      }

      if (!kycId) {
        toast.error('Unable to update KYC status. Please refresh and try again.')
        return
      }

      await updateExpertKycStatus(kycId, {
        status: 'APPROVED',
      })

      toast.success('Application approved')
      closeApproveModal()
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(
        err?.response?.data?.message || 'Failed to approve application. Please try again.',
      )
    } finally {
      setIsApproving(false)
    }
  }, [approveConfirmed, approveExpertTarget, closeApproveModal, navigate, queryClient])

  const columns = useMemo<ColumnDef<Expert>[]>(() => {
    const dataColumnsById = buildExpertDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_EXPERT_PENDING_VISIBLE_COLUMN_IDS

    return [
      createExpertSelectColumn({
        allVisibleSelected: selection.allVisibleSelected,
        someVisibleSelected: selection.someVisibleSelected,
        selectedExpertIds: selection.selectedExpertIds,
        toggleVisible: selection.toggleVisible,
        toggleOne: selection.toggleOne,
      }),
      ...pickPreferenceColumns(
        dataColumnsById,
        visibleIds,
        DEFAULT_EXPERT_PENDING_VISIBLE_COLUMN_IDS,
      ),
      {
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
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(`/experts/management/profile/${expert.id}`)
                  }}
                >
                  View Expert
                </TableActionsItem>
              )}
              <TableActionsItem
                icon={<FileText className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  openExpertApplicationView(expert, navigate)
                }}
              >
                {isVenue ? 'Venue KYC View' : 'Application View'}
              </TableActionsItem>
              <TableActionsItem
                icon={<CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  if (isVenue) {
                    openExpertApplicationView(expert, navigate)
                    return
                  }
                  setApproveExpertTarget(expert)
                  setApproveAdminNotes('')
                  setApproveConfirmed(false)
                }}
              >
                Approve Application
              </TableActionsItem>
              <TableActionsItem
                icon={<Ban className="size-3.5 text-red-400" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  if (isVenue) {
                    openExpertApplicationView(expert, navigate)
                    return
                  }
                  setRevokeExpertTarget(expert)
                  setRevokeReasons([])
                  setRevokeReasonDetails('')
                  setRevokeAdminNotes('')
                }}
              >
                Reject Application
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ]
  }, [activeDropdownId, navigate, selection, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Pending Approvals"
        breadcrumb="User Management / Pending Approvals"
        metricsPath="/metrics/expert-pending-approvals?returnTo=/experts/pending-approvals"
      />

      <DataTable
        columns={columns}
        data={experts}
        getRowId={(expert) => expert.expertId}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No pending approvals found."
      />
      {exportFilterModals}

      <DecisionActionModal
        open={Boolean(revokeExpertTarget)}
        variant="reject"
        title="Reject Application"
        description="Are you sure you want to reject this expert application? The partner will need to resubmit after rejection."
        submitLabel="Reject Application"
        reasonOptions={revokeReasonOptions}
        selectedReasons={revokeReasons}
        onReasonToggle={toggleRevokeReason}
        reason={revokeReasonDetails}
        onReasonChange={setRevokeReasonDetails}
        adminNotes={revokeAdminNotes}
        onAdminNotesChange={setRevokeAdminNotes}
        onClose={closeRevokeModal}
        onSubmit={handleRevokeSubmit}
        isSubmitting={isRevoking}
      />
      <DecisionActionModal
        open={Boolean(approveExpertTarget)}
        variant="approve"
        title="Approve Application"
        description="Are you sure you want to approve this expert application? The applicant will be notified."
        submitLabel="Approve Application"
        adminNotes={approveAdminNotes}
        onAdminNotesChange={setApproveAdminNotes}
        confirmationLabel="I confirm this application is approved."
        confirmationChecked={approveConfirmed}
        onConfirmationChange={setApproveConfirmed}
        onClose={closeApproveModal}
        onSubmit={handleApproveSubmit}
        isSubmitting={isApproving}
      />
    </div>
  )
}
