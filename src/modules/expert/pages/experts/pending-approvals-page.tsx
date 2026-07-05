import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  fetchExpertApplicationView,
  updateExpertKycStatus,
} from '../../api/expert-application-api'
import { useExperts } from '../../hooks/use-expert'
import type { Expert } from '../../type/expert'
import type { ConciergeRejectionReason } from '../../type/expert-application-view'
import { isKycSubmittedForApplication } from '../../utils/expert-application-helpers'
import { openExpertApplicationView } from '../../utils/expert-application-navigation'
import {
  createExpertBaseColumns,
  createExpertCreatedAtColumn,
  createExpertLastActiveColumn,
  createExpertSelectColumn,
  createExpertServiceTypeColumn,
  createExpertStatusColumn,
  ExpertListHeader,
  useExpertListSelection,
} from './expert-list-shared'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { useQueryClient } from '@tanstack/react-query'

const REVOKE_REASON_OPTIONS: DecisionActionModalOption[] = [
  { label: 'Unclear Image', value: 'Reason1' },
  { label: 'Content Issue', value: 'Reason2' },
  { label: 'Invalid documents', value: 'Reason3' },
  { label: 'Invalid PAN', value: 'Reason4' },
  { label: 'Invalid GST', value: 'Reason5' },
]

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

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: 'pending',
    search: searchQuery,
  })

  const experts = data?.data || []
  const meta = data?.meta
  const selection = useExpertListSelection(experts)

  const toggleRevokeReason = useCallback((value: string) => {
    setRevokeReasons((current) =>
      current.includes(value)
        ? current.filter((reason) => reason !== value)
        : [...current, value],
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

      await updateExpertKycStatus(kycId, {
        status: 'REJECTED',
        reasonFor: revokeReasons as ConciergeRejectionReason[],
        rejectionReason: revokeReasonDetails.trim(),
        adminNote: revokeAdminNotes.trim(),
      })

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
    closeRevokeModal,
    navigate,
    queryClient,
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
              onOpenChange={(open) =>
                setActiveDropdownId(open ? expert.expertId : null)
              }
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
        onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
        onExport={() => toast.message('Expert export is coming soon')}
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

      <DecisionActionModal
        open={Boolean(revokeExpertTarget)}
        variant="reject"
        title="Revoke Application"
        description="Are you sure you want to revoke this expert application? The partner will need to resubmit after rejection."
        submitLabel="Revoke Application"
        reasonOptions={REVOKE_REASON_OPTIONS}
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
