import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, FileText, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { DataTable } from '@/shared/components/table/data-table'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import {
  DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS,
  SERVICE_PENDING_APPROVALS_MODULE_KEY,
  SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
} from '../../config/service-management-table-columns.config'
import { useServiceStatusList } from '../../hooks/use-service-status-list'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { SERVICE_PENDING_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { SERVICE_PENDING_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  escalateConsultationApplication,
  escalateServiceApplication,
} from '@/modules/my-tasks/api/escalation-api'

export function PendingApprovalsPage() {
  const navigate = useNavigate()
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [escalateTarget, setEscalateTarget] = useState<Service | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const catalogColumnIds = useMemo(
    () => SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )

  const list = useServiceStatusList({
    moduleKey: SERVICE_PENDING_APPROVALS_MODULE_KEY,
    status: 'pending',
    defaultVisibleColumnIds: DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'pending_services_export',
    exportColumnMap: SERVICE_PENDING_EXPORT_COLUMN_MAP,
  })

  const {
    currentPage,
    setCurrentPage,
    activeDropdownId,
    setActiveDropdownId,
    serverSort,
    enhancedSearch,
    services,
    meta,
    isLoading,
    visibleColumnIds,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
  } = list

  const { data: assigneesData } = useEscalationAssignees('services.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) =>
    selectedServiceIds.includes(id),
  )

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

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const openCommunicateWithExpert = useCallback(
    (service: Service) => {
      const partnerId = String(service.partnerId || '').trim()
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

  const openViewSubmittedDocuments = useCallback(
    (service: Service) => {
      navigate(getServiceManagementViewPath(service, { section: 'documents' }))
    },
    [navigate],
  )

  const handleEscalateSubmit = useCallback(async () => {
    if (!escalateTarget) return
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
    const isConsultation = String(escalateTarget.serviceType || '')
      .toLowerCase()
      .includes('consultation')
    const payload = {
      assigneeSubAdminId: selectedEscalationOption,
      assigneeName: selectedAssignee?.fullname || '',
      adminNote: escalateAdminNotes.trim(),
      entityTitle: escalateTarget.title,
      applicationUrl: getServiceManagementViewPath(escalateTarget),
    }

    setIsEscalating(true)
    try {
      if (isConsultation) {
        await escalateConsultationApplication(escalateTarget._id, payload)
      } else {
        await escalateServiceApplication(escalateTarget._id, payload)
      }
      toast.success('Listing escalated')
      closeEscalateModal()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to escalate listing.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    escalateTarget,
    selectedEscalationOption,
  ])

  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const dataColumnsById = buildServiceDataColumnsById()

    return withServerSortMeta(
      [
        {
          id: 'select',
          header: () => (
            <input
              type="checkbox"
              aria-label="Select all pending services"
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
        },
        ...pickServicePreferenceColumns(
          dataColumnsById,
          visibleColumnIds,
          DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS,
        ),
        {
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
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  View Details
                </TableActionsItem>
                <TableActionsItem
                  icon={<CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  Approve Application
                </TableActionsItem>
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  Preview Listing
                </TableActionsItem>
                <TableActionsItem
                  icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    openCommunicateWithExpert(service)
                  }}
                >
                  Communicate with Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<FileText className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    openViewSubmittedDocuments(service)
                  }}
                >
                  View Submitted Documents
                </TableActionsItem>
                <TableActionsItem
                  icon={<AlertCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    setEscalateTarget(service)
                  }}
                >
                  Escalate Listing
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      SERVICE_COLUMN_SORT_FIELDS,
    )
  }, [
    activeDropdownId,
    allVisibleServicesSelected,
    navigate,
    openCommunicateWithExpert,
    openViewSubmittedDocuments,
    selectedServiceIds,
    setActiveDropdownId,
    someVisibleServicesSelected,
    toggleServiceSelection,
    toggleVisibleServices,
    visibleColumnIds,
  ])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <header className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/services/management')}
            className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Pending Approvals</span>
          </button>

          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Service Management', to: '/services/management' },
                { label: 'Pending Approvals', isActive: true },
              ]}
            />
          </div>
        </header>
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() =>
            navigate(
              '/metrics/service-pending-approvals?returnTo=/services/management/pending&section=table',
            )
          }
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        getRowId={(service) => service._id}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_PENDING_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by title or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        {...serverSort.dataTableSortProps}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No pending approvals found."
      />
      {exportFilterModals}

      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate Listing"
        description="Are you sure you want to escalate this listing? It will be reviewed by the selected sub-admin."
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
    </div>
  )
}
