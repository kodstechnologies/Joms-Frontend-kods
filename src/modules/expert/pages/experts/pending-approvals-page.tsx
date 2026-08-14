import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertApplicationView, updateExpertKycStatus } from '../../api/expert-application-api'
import { useExperts } from '../../hooks/use-expert'
import type { Expert } from '../../type/expert'
import { isKycSubmittedForApplication } from '../../utils/expert-application-helpers'
import { openExpertApplicationView } from '../../utils/expert-application-navigation'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { ExpertListHeader } from './expert-list-shared'
import {
  createExpertBaseColumns,
  createExpertCreatedAtColumn,
  createExpertLastActiveColumn,
  createExpertSelectColumn,
  createExpertServiceTypeColumn,
  createExpertStatusColumn,
} from './expert-list-columns'
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

export function ExpertPendingApprovalsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [revokeExpertTarget, setRevokeExpertTarget] = useState<Expert | null>(null)
  const [revokeReasons, setRevokeReasons] = useState<string[]>([])
  const [revokeReasonDetails, setRevokeReasonDetails] = useState('')
  const [revokeAdminNotes, setRevokeAdminNotes] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => {
    const params: Record<string, string> = {}

    Object.entries(appliedFilters).forEach(([rawKey, val]) => {
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
  }, [appliedFilters])
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: revokeReasonOptions, buildPayload: buildRevokeReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectExpert)

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: 'pending',
    search: searchQuery,
    ...apiFilterParams,
  })

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

  const handleExportData = useCallback(
    (values: FilterValues, format: string) => {
      const headers = [
        'Expert ID',
        'Name',
        'Email ID',
        'Profession',
        'Status',
        'Service Type',
        'Created At',
      ]
      const rows = experts.map((e) => [
        e.expertId || '-',
        e.name || '-',
        e.email || '-',
        e.profession || '-',
        e.status || '-',
        e.serviceType || '-',
        e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A',
      ])
      exportDataToFile(headers, rows, format, 'pending_experts_export')
    },
    [experts],
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

      toast.success('Application revoked successfully')
      closeRevokeModal()
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Failed to revoke application. Please try again.')
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

  const columns = useMemo<ColumnDef<Expert>[]>(
    () => [
      createExpertSelectColumn({
        allVisibleSelected: selection.allVisibleSelected,
        someVisibleSelected: selection.someVisibleSelected,
        selectedExpertIds: selection.selectedExpertIds,
        toggleVisible: selection.toggleVisible,
        toggleOne: selection.toggleOne,
      }),
      ...createExpertBaseColumns(),
      createExpertStatusColumn(),
      createExpertServiceTypeColumn(),
      createExpertCreatedAtColumn(),
      createExpertLastActiveColumn(),
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
              menuWidth={192}
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
                Revoke Application
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId, navigate, selection],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Pending Approvals"
        breadcrumb="User Management / Pending Approvals"
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
        title="Revoke Application"
        description="Are you sure you want to revoke this expert application? The partner will need to resubmit after rejection."
        submitLabel="Revoke Application"
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
    </div>
  )
}
