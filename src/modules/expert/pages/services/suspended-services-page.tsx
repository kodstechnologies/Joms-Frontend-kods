import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  CalendarClock,
  CalendarPlus,
  Eye,
  MessageSquare,
  PlayCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  escalateConsultationApplication,
  escalateServiceApplication,
} from '@/modules/my-tasks/api/escalation-api'
import { END_MUST_AFTER_START_MESSAGE, isEndOnOrBeforeStart } from '@/shared/utils/date-range'

import { SERVICE_SUSPENDED_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
  SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '../../config/service-management-table-columns.config'
import { useActivateService, useUpdateServiceSuspension } from '../../hooks/use-services'
import { useServiceStatusList } from '../../hooks/use-service-status-list'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { SERVICE_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { ExpertListHeader } from '../experts/expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { SERVICE_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'

type SuspensionModalMode = 'modify' | 'extend'

const toDateInputValue = (value?: string | null) => {
  if (!value) return ''
  const day = String(value).trim().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : ''
}

export function SuspendedServicesPage() {
  const navigate = useNavigate()
  const { fileFormat } = useDefaultExportFormat()
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [escalateTarget, setEscalateTarget] = useState<Service | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)
  const [suspensionTarget, setSuspensionTarget] = useState<Service | null>(null)
  const [suspensionMode, setSuspensionMode] = useState<SuspensionModalMode>('modify')
  const [suspensionStartDate, setSuspensionStartDate] = useState('')
  const [suspensionEndDate, setSuspensionEndDate] = useState('')
  const [suspensionIndefinitely, setSuspensionIndefinitely] = useState(false)
  const [suspensionAdminNotes, setSuspensionAdminNotes] = useState('')
  const activateServiceMutation = useActivateService()
  const updateSuspensionMutation = useUpdateServiceSuspension()
  const catalogColumnIds = useMemo(
    () => SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )

  const list = useServiceStatusList({
    moduleKey: SERVICE_SUSPENDED_MODULE_KEY,
    status: 'suspended',
    defaultVisibleColumnIds: DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'suspended_services_export',
    exportColumnMap: SERVICE_EXPORT_COLUMN_MAP,
  })

  const { data: assigneesData } = useEscalationAssignees('services.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const visibleServiceIds = useMemo(
    () => list.services.map((service) => service._id),
    [list.services],
  )
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

  const handleActivate = useCallback(
    (service: Service) => {
      activateServiceMutation.mutate(service._id, {
        onSuccess: () => toast.success('Service activated successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to activate service. Please try again.'))
        },
      })
    },
    [activateServiceMutation],
  )

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

  const openSuspensionModal = useCallback((service: Service, mode: SuspensionModalMode) => {
    const isIndefinite = String(service.suspensionType || '')
      .toLowerCase()
      .includes('indefinite')
    setSuspensionTarget(service)
    setSuspensionMode(mode)
    setSuspensionIndefinitely(isIndefinite)
    setSuspensionStartDate(toDateInputValue(service.suspendedAt))
    setSuspensionEndDate(isIndefinite ? '' : toDateInputValue(service.suspensionUntil))
    setSuspensionAdminNotes('')
  }, [])

  const closeSuspensionModal = useCallback(() => {
    setSuspensionTarget(null)
    setSuspensionStartDate('')
    setSuspensionEndDate('')
    setSuspensionIndefinitely(false)
    setSuspensionAdminNotes('')
  }, [])

  const handleSuspensionSubmit = useCallback(() => {
    if (!suspensionTarget) return

    if (!suspensionIndefinitely && (!suspensionStartDate || !suspensionEndDate)) {
      toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
      return
    }

    if (!suspensionIndefinitely && isEndOnOrBeforeStart(suspensionStartDate, suspensionEndDate)) {
      toast.error(END_MUST_AFTER_START_MESSAGE)
      return
    }

    if (!suspensionAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const toIso = (value: string) =>
      value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

    updateSuspensionMutation.mutate(
      {
        id: suspensionTarget._id,
        payload: {
          suspendIndefinitely: suspensionIndefinitely,
          startDate: suspensionIndefinitely ? undefined : toIso(suspensionStartDate),
          endDate: suspensionIndefinitely ? undefined : toIso(suspensionEndDate),
          adminNotes: suspensionAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            suspensionMode === 'extend'
              ? 'Suspension extended successfully'
              : 'Suspension updated successfully',
          )
          closeSuspensionModal()
        },
        onError: (error: unknown) => {
          toast.error(
            getApiErrorMessage(
              error,
              suspensionMode === 'extend'
                ? 'Failed to extend suspension.'
                : 'Failed to modify suspension.',
            ),
          )
        },
      },
    )
  }, [
    closeSuspensionModal,
    suspensionAdminNotes,
    suspensionEndDate,
    suspensionIndefinitely,
    suspensionMode,
    suspensionStartDate,
    suspensionTarget,
    updateSuspensionMutation,
  ])

  const handleExportServiceRow = useCallback(
    async (service: Service) => {
      try {
        await exportMappedItemsToFile(
          SERVICE_EXPORT_COLUMN_MAP,
          [service],
          fileFormat,
          `suspended_service_${service.serviceid || service._id}`,
          {
            columnIds: list.visibleColumnIds,
            catalogOrder: DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Service exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export service'))
      }
    },
    [fileFormat, list.visibleColumnIds],
  )

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

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
      toast.success('Escalated to compliance')
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
              aria-label="Select all suspended services"
              checked={allVisibleServicesSelected}
              ref={(input) => {
                if (input)
                  input.indeterminate = someVisibleServicesSelected && !allVisibleServicesSelected
              }}
              onChange={toggleVisibleServices}
              className="rounded border-slate-700 bg-transparent"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              aria-label={`Select ${row.original.title}`}
              checked={selectedServiceIds.includes(row.original._id)}
              onChange={() => toggleServiceSelection(row.original._id)}
              onClick={(event) => event.stopPropagation()}
              className="rounded border-slate-700 bg-transparent"
            />
          ),
          meta: {
            headerClassName: 'pl-5',
            cellClassName: 'pl-5',
          },
        },
        ...pickServicePreferenceColumns(
          dataColumnsById,
          list.visibleColumnIds,
          DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
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
            const isOpen = list.activeDropdownId === service._id

            return (
              <TableActionsDropdown
                label={`Open actions for ${service.title}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? service._id : null)}
                menuWidth={240}
                maxVisibleItems={8}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  View Details
                </TableActionsItem>
                <TableActionsItem
                  icon={<CalendarClock className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openSuspensionModal(service, 'modify')
                  }}
                >
                  Modify Suspension
                </TableActionsItem>
                <TableActionsItem
                  icon={<CalendarPlus className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openSuspensionModal(service, 'extend')
                  }}
                >
                  Extend Suspension
                </TableActionsItem>
                <TableActionsItem
                  icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handleActivate(service)
                  }}
                >
                  Activate Service
                </TableActionsItem>
                <TableActionsItem
                  icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openCommunicateWithExpert(service)
                  }}
                >
                  Communicate with Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<AlertCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setEscalateTarget(service)
                  }}
                >
                  Escalate to Compliance
                </TableActionsItem>
                <TableActionsItem
                  icon={<ExportDataIcon className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    void handleExportServiceRow(service)
                  }}
                >
                  Export Record
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      SERVICE_COLUMN_SORT_FIELDS,
    )
  }, [
    allVisibleServicesSelected,
    handleActivate,
    handleExportServiceRow,
    list,
    navigate,
    openCommunicateWithExpert,
    openSuspensionModal,
    selectedServiceIds,
    someVisibleServicesSelected,
    toggleServiceSelection,
    toggleVisibleServices,
  ])

  const suspensionModalTitle =
    suspensionMode === 'extend' ? 'Extend Suspension' : 'Modify Suspension'
  const suspensionModalDescription =
    suspensionMode === 'extend'
      ? 'Update the suspension end date or switch to indefinite suspension for this listing.'
      : 'Update the suspension timeline for this listing.'
  const suspensionSubmitLabel =
    suspensionMode === 'extend' ? 'Extend Suspension' : 'Modify Suspension'

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Suspended Services"
        breadcrumbItems={[
          { label: 'Service Management', to: '/services/management' },
          { label: 'Suspended Services', isActive: true },
        ]}
        backTo="/services/management"
        metricsPath="/metrics/service-suspended?returnTo=/services/management/suspended&section=table"
      />

      <DataTable
        columns={columns}
        data={list.services}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_SUSPENDED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        showAdvancedFilter={false}
        onExport={list.onExport}
        {...list.serverSort.dataTableSortProps}
        searchPlaceholder="Search by service name or ID"
        pagination={{
          page: list.currentPage,
          pageSize: list.meta?.pagination.limit || 10,
          totalItems: list.meta?.pagination.total || 0,
          totalPages: list.meta?.pagination.pages || 1,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No suspended services found."
      />
      {list.exportFilterModals}

      <DecisionActionModal
        open={Boolean(suspensionTarget)}
        variant="suspend"
        title={suspensionModalTitle}
        description={suspensionModalDescription}
        submitLabel={suspensionSubmitLabel}
        showTimeline
        timelineAllowPastStart
        startDate={suspensionStartDate}
        onStartDateChange={setSuspensionStartDate}
        endDate={suspensionEndDate}
        onEndDateChange={setSuspensionEndDate}
        indefinite={suspensionIndefinitely}
        onIndefiniteChange={setSuspensionIndefinitely}
        indefiniteLabel="Suspend indefinitely (until manually reactivated)"
        adminNotes={suspensionAdminNotes}
        onAdminNotesChange={setSuspensionAdminNotes}
        onClose={closeSuspensionModal}
        onSubmit={handleSuspensionSubmit}
        isSubmitting={updateSuspensionMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate to Compliance"
        description="Are you sure you want to escalate this suspended listing to compliance? It will be reviewed by the selected sub-admin."
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
