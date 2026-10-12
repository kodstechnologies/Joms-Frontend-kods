import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Ban, Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { fetchVenueReports, updateVenueReport } from '../../api/venue-api'
import { defaultParseResponse, useReportedList } from '../../hooks/use-reported-list'
import {
  VenueReportDetailModal,
  type VenueReportItem,
} from '../../components/venue-report-detail-modal'
import {
  buildVenueReportDataColumnsById,
  pickVenuePreferenceColumns,
} from '../../utils/venue-preference-columns'
import { VENUE_REPORTED_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { ExpertListHeader } from '../experts/expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_REPORTED_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_REPORTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalatePartnerApplication } from '@/modules/my-tasks/api/escalation-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import {
  VENUE_REPORTED_MODULE_KEY,
  DEFAULT_VENUE_REPORTED_VISIBLE_COLUMN_IDS,
  VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/venue-management-table-columns.config'

export function VenueReportedVenuesPage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const [selectedReport, setSelectedReport] = useState<VenueReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [escalateTarget, setEscalateTarget] = useState<VenueReportItem | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const { data: assigneesData } = useEscalationAssignees('venues.*')
  const escalationOptions = useMemo<DecisionActionModalOption[]>(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const list = useReportedList<VenueReportItem>({
    moduleKey: 'venue-management',
    preferencesKey: VENUE_REPORTED_MODULE_KEY,
    sortFieldMap: VENUE_REPORTED_SORT_FIELDS,
    exportFileName: 'reported_venues_export',
    exportColumnMap: VENUE_REPORTED_EXPORT_COLUMN_MAP,
    fetchReports: fetchVenueReports,
    parseResponse: (response) => {
      const parsed = defaultParseResponse<VenueReportItem & { _id?: string }>(response)
      return {
        ...parsed,
        items: parsed.items.map((item) => ({
          ...item,
          id: item.id || item._id || item.reportId,
        })),
      }
    },
    defaultVisibleColumnIds: DEFAULT_VENUE_REPORTED_VISIBLE_COLUMN_IDS,
    catalogColumnIds: VENUE_REPORTED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
  })

  const openCommunicateWithHost = useCallback(
    (reportItem: VenueReportItem) => {
      const partnerId = String(reportItem.partnerId || '').trim()
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

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleEscalateSubmit = useCallback(async () => {
    if (!escalateTarget) return

    const partnerId = String(escalateTarget.partnerId || '').trim()
    const venueId = String(escalateTarget.venueId || '').trim()
    if (!partnerId) {
      toast.error('Venue partner ID is missing.')
      return
    }
    if (!venueId) {
      toast.error('Venue ID is missing.')
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
    const reportId = String(escalateTarget.id || escalateTarget.reportId || '').trim()
    const note = escalateAdminNotes.trim()

    setIsEscalating(true)
    try {
      await escalatePartnerApplication(partnerId, {
        assigneeSubAdminId: selectedEscalationOption,
        assigneeName: selectedAssignee?.fullname || '',
        adminNote: note,
        venueId,
        partnerId,
        entityTitle: `Venue report ${escalateTarget.reportId || reportId}`,
        applicationUrl: `/venues/management/profile/${encodeURIComponent(venueId)}`,
        escalationTarget: 'application',
        metadata: {
          reportId: escalateTarget.reportId || reportId,
          issueType: escalateTarget.issueType,
          source: 'reported_venues',
          venueId,
        },
      })

      if (reportId) {
        await updateVenueReport(reportId, {
          investigationStatus: 'Escalated',
          adminWhoEscalated: authUser?.fullname || authUser?.email || 'Admin',
          internalNotes: note,
        })
      }

      toast.success('Case escalated to My Tasks')
      closeEscalateModal()
      list.reload()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to escalate case.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    authUser?.email,
    authUser?.fullname,
    closeEscalateModal,
    escalateAdminNotes,
    escalateTarget,
    list,
    selectedEscalationOption,
  ])

  const columns = useMemo<ColumnDef<VenueReportItem>[]>(() => {
    const visibleIds = list.tableColumnPreferencesQuery.data?.visibleColumnIds ?? []
    return withServerSortMeta(
      [
        ...pickVenuePreferenceColumns(
          buildVenueReportDataColumnsById(),
          visibleIds,
          DEFAULT_VENUE_REPORTED_VISIBLE_COLUMN_IDS,
        ),
        {
          id: 'actions',
          header: 'Actions',
          meta: {
            headerClassName: 'pr-5 text-right',
            cellClassName: 'relative pr-5 text-right',
          },
          cell: ({ row }) => {
            const reportItem = row.original
            const isOpen = list.activeDropdownId === reportItem.reportId
            return (
              <TableActionsDropdown
                label={`Open actions for report ${reportItem.reportId}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? reportItem.reportId : null)}
                menuWidth={200}
                maxVisibleItems={8}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/venues/management/profile/${reportItem.venueId}`)
                  }}
                >
                  View Venue
                </TableActionsItem>
                <TableActionsItem
                  icon={<Ban className="size-3.5 text-red-400" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setSelectedReport(reportItem)
                    setIsModalOpen(true)
                  }}
                >
                  View Report
                </TableActionsItem>
                <TableActionsItem
                  icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openCommunicateWithHost(reportItem)
                  }}
                >
                  Communicate with Host
                </TableActionsItem>
                <TableActionsItem
                  icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setEscalateTarget(reportItem)
                  }}
                >
                  Escalate Case
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      VENUE_REPORTED_SORT_FIELDS,
    )
  }, [list, navigate, openCommunicateWithHost])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Reported Venues"
        breadcrumbItems={[
          { label: 'Venue Management', to: '/venues/management' },
          { label: 'Reported Venues', isActive: true },
        ]}
        backTo="/venues/management"
        metricsPath="/metrics/venue-reported?returnTo=/venues/management/reported"
      />

      <DataTable
        columns={columns}
        data={list.items}
        getRowId={(r) => r.reportId || r.id}
        isLoading={list.loading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_REPORTED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, venue name, or reporter"
        onAdvancedFilter={list.onAdvancedFilter}
        onExport={list.onExport}
        {...list.serverSort.dataTableSortProps}
        pagination={{
          page: list.currentPage,
          pageSize: 10,
          totalItems: list.totalItems,
          totalPages: list.totalPages,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="reports"
        emptyMessage="No reported venues found."
      />
      {list.exportFilterModals}

      <VenueReportDetailModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReport(null)
        }}
        onUpdated={list.reload}
      />

      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate Case"
        headerDescription="Are you sure you want to escalate this case? It will be reviewed by the selected sub-admin."
        description=""
        submitLabel="Escalate Case"
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
    </div>
  )
}
