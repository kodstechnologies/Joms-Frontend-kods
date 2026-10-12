import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Ban, Eye, Link2, Link2Off, MessageSquare, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertReports, updateExpertReport } from '../../api/expert-api'
import {
  DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
  EXPERT_REPORTED_MODULE_KEY,
  EXPERT_REPORTED_TABLE_COLUMNS_CATALOG,
} from '../../config/expert-management-table-columns.config'
import { defaultParseResponse, useReportedList } from '../../hooks/use-reported-list'
import { useExpertMicrositeActions } from '../../hooks/use-expert-microsite-actions'
import {
  ExpertReportDetailModal,
  type ExpertReportItem,
} from '../../components/expert-report-detail-modal'
import {
  buildExpertReportDataColumnsById,
  pickExpertReportPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { EXPERT_REPORTED_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { openVenuePartnerProfile } from '../../utils/expert-application-navigation'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { EXPERT_REPORTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
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
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useAuthStore } from '@/modules/auth/store/auth-store'

export function ExpertReportedExpertsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { fileFormat } = useDefaultExportFormat()
  const authUser = useAuthStore((state) => state.user)
  const [selectedReport, setSelectedReport] = useState<ExpertReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [escalateTarget, setEscalateTarget] = useState<ExpertReportItem | null>(null)
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)
  const { openSuspendMicrosite, openReinstateMicrosite, micrositeModal } =
    useExpertMicrositeActions()

  const list = useReportedList<ExpertReportItem>({
    moduleKey: EXPERT_REPORTED_MODULE_KEY,
    sortFieldMap: EXPERT_COLUMN_SORT_FIELDS,
    exportFileName: 'reported_experts_export',
    exportColumnMap: EXPERT_REPORTED_EXPORT_COLUMN_MAP,
    fetchReports: fetchExpertReports,
    parseResponse: defaultParseResponse<ExpertReportItem>,
    defaultVisibleColumnIds: DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
    catalogColumnIds: EXPERT_REPORTED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
  })

  const { data: assigneesData } = useEscalationAssignees('experts.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((item) => ({
        value: item.id,
        label: item.fullname || item.email || item.id,
      })),
    [assigneesData?.data],
  )

  useEffect(() => {
    const openReportId = (location.state as { openReportId?: string } | null)?.openReportId
    if (!openReportId || list.loading || !list.items.length) return

    const match = list.items.find(
      (report) => report.reportId === openReportId || report.id === openReportId,
    )
    if (!match) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- open report detail from navigation state
    setSelectedReport(match)
    setIsModalOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [list.items, list.loading, location.pathname, location.state, navigate])

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setSelectedEscalationOption('')
    setEscalateAdminNotes('')
  }, [])

  const openCommunicateWithExpert = useCallback(
    (report: ExpertReportItem) => {
      const partnerId = String(report.partnerId || report.expertId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      const params = new URLSearchParams({
        channel: 'email',
        audience: 'experts',
        partnerIds: partnerId,
      })
      navigate(`/communication/create?${params.toString()}`)
    },
    [navigate],
  )

  const openReporterProfile = useCallback(
    (report: ExpertReportItem) => {
      const reporterId = String(report.reporterId || '').trim()
      if (!reporterId) {
        toast.error('Reporter ID is missing.')
        return
      }

      const type = String(report.reporterType || '')
        .trim()
        .toLowerCase()

      if (type.includes('admin')) {
        navigate(`/settings/access/users/${reporterId}`)
        return
      }

      if (type.includes('venue')) {
        void openVenuePartnerProfile(reporterId, navigate)
        return
      }

      if (type.includes('expert') || type.includes('service_partner') || type.includes('partner')) {
        navigate(`/experts/management/profile/${reporterId}`)
        return
      }

      navigate(`/support/past-tickets/${reporterId}`)
    },
    [navigate],
  )

  const handleExportCase = useCallback(
    async (report: ExpertReportItem) => {
      try {
        await exportMappedItemsToFile(
          EXPERT_REPORTED_EXPORT_COLUMN_MAP,
          [report],
          fileFormat,
          `expert_report_${report.reportId || report.id}`,
          {
            columnIds:
              list.tableColumnPreferencesQuery.data?.visibleColumnIds ??
              DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
            catalogOrder: DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Case exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export case'))
      }
    },
    [fileFormat, list.tableColumnPreferencesQuery.data?.visibleColumnIds],
  )

  const handleEscalateSubmit = useCallback(async () => {
    if (!escalateTarget) return

    const partnerId = String(escalateTarget.partnerId || escalateTarget.expertId || '').trim()
    if (!partnerId) {
      toast.error('Expert partner ID is missing.')
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
        entityTitle: `Expert report ${escalateTarget.reportId || reportId}`,
        applicationUrl: `/experts/management/profile/${encodeURIComponent(partnerId)}`,
        escalationTarget: 'application',
        partnerId,
        metadata: {
          reportId: escalateTarget.reportId || reportId,
          issueType: escalateTarget.issueType,
          source: 'reported_experts',
        },
      })

      if (reportId) {
        await updateExpertReport(reportId, {
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
    list.reload,
    selectedEscalationOption,
  ])

  const columns = useMemo<ColumnDef<ExpertReportItem>[]>(() => {
    const visibleIds = list.tableColumnPreferencesQuery.data?.visibleColumnIds ?? []
    return withServerSortMeta(
      [
        ...pickExpertReportPreferenceColumns(
          buildExpertReportDataColumnsById(),
          visibleIds,
          DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
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
                menuWidth={240}
                maxVisibleItems={8}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/experts/management/profile/${reportItem.partnerId}`)
                  }}
                >
                  View Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<Ban className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setSelectedReport(reportItem)
                    setIsModalOpen(true)
                  }}
                >
                  View Report
                </TableActionsItem>
                <TableActionsItem
                  icon={<User className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openReporterProfile(reportItem)
                  }}
                >
                  View Reporter Profile
                </TableActionsItem>
                <TableActionsItem
                  icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openCommunicateWithExpert(reportItem)
                  }}
                >
                  Communicate with Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<AlertTriangle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setEscalateTarget(reportItem)
                    setSelectedEscalationOption('')
                    setEscalateAdminNotes('')
                  }}
                >
                  Escalate Case
                </TableActionsItem>
                <TableActionsItem
                  icon={<Link2Off className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openSuspendMicrosite(reportItem.partnerId, reportItem.expertName)
                  }}
                >
                  Suspend Microsite
                </TableActionsItem>
                <TableActionsItem
                  icon={<Link2 className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openReinstateMicrosite(reportItem.partnerId, reportItem.expertName)
                  }}
                >
                  Reinstate Microsite
                </TableActionsItem>
                <TableActionsItem
                  icon={<ExportDataIcon className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    void handleExportCase(reportItem)
                  }}
                >
                  Export Case
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      EXPERT_COLUMN_SORT_FIELDS,
    )
  }, [
    handleExportCase,
    list.activeDropdownId,
    list.setActiveDropdownId,
    list.tableColumnPreferencesQuery.data?.visibleColumnIds,
    navigate,
    openCommunicateWithExpert,
    openReporterProfile,
    openSuspendMicrosite,
    openReinstateMicrosite,
  ])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Reported Experts"
        breadcrumbItems={[
          { label: 'Expert Management', to: '/experts/management' },
          { label: 'Reported Experts', isActive: true },
        ]}
        metricsPath="/metrics/expert-reported?returnTo=/experts/reported"
      />

      <DataTable
        columns={columns}
        data={list.items}
        getRowId={(r) => r.reportId || r.id}
        isLoading={list.loading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_REPORTED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, expert, or reporter"
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
        emptyMessage="No reported experts found."
      />
      {list.exportFilterModals}

      <ExpertReportDetailModal
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
        description="Assign this reported expert case to a sub-admin. It will appear in My Tasks for review."
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
      {micrositeModal}
    </div>
  )
}
