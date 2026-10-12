import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, Eye, RotateCcw, ShoppingBag, Trash2, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  escalateConsultationApplication,
  escalateServiceApplication,
} from '@/modules/my-tasks/api/escalation-api'

import { SERVICE_DELETED_MODULE_KEY } from '../../api/ui-preferences-api'
import { DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS } from '../../config/service-management-table-columns.config'
import { usePurgeService, useRestoreService } from '../../hooks/use-services'
import { useServiceStatusList } from '../../hooks/use-service-status-list'
import {
  consultationPerformancePath,
  getServiceManagementViewPath,
  servicePerformancePath,
} from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { ExpertListHeader } from '../experts/expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { SERVICE_DELETED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

const formatExportDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (s: Service) => string }> = {
  serviceId: { header: 'Listing ID', accessor: (s) => exportDisplayValue(s.serviceid || s._id) },
  title: { header: 'Listing Name', accessor: (s) => exportDisplayValue(s.title) },
  deletedBy: { header: 'Deleted By', accessor: (s) => exportDisplayValue(s.deletedBy) },
  deletedById: { header: 'Deleted By ID', accessor: (s) => exportDisplayValue(s.deletedById) },
  deletionReason: {
    header: 'Deletion Reason',
    accessor: (s) => exportDisplayValue(s.deletionReason || s.reason),
  },
  deletedAt: { header: 'Deleted At', accessor: (s) => formatExportDateTime(s.deletedAt) },
  restoreEligible: {
    header: 'Restore Eligible',
    accessor: (s) => exportDisplayValue(s.restoreEligible),
  },
  lastUpdatedAt: {
    header: 'Last Updated At',
    accessor: (s) => formatExportDateTime(s.lastUpdatedAt),
  },
}

export function DeletedServicesPage() {
  const navigate = useNavigate()
  const restoreServiceMutation = useRestoreService()
  const purgeServiceMutation = usePurgeService()
  const catalogColumnIds = DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS
  const { fileFormat } = useDefaultExportFormat()
  const [escalateTarget, setEscalateTarget] = useState<Service | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const list = useServiceStatusList({
    moduleKey: SERVICE_DELETED_MODULE_KEY,
    status: 'deleted',
    defaultVisibleColumnIds: DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'deleted_services_export',
    exportColumnMap: EXPORT_COLUMN_MAP,
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

  const openViewExpert = useCallback(
    (service: Service) => {
      const partnerId = String(service.partnerId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      navigate(`/experts/management/profile/${partnerId}`)
    },
    [navigate],
  )

  const openOrdersAndRevenue = useCallback(
    (service: Service) => {
      const partnerId = String(service.partnerId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing for this listing.')
        return
      }
      const isConsultation = String(service.serviceType || '')
        .toLowerCase()
        .includes('consultation')
      navigate(
        isConsultation
          ? consultationPerformancePath(partnerId, service._id)
          : servicePerformancePath(partnerId, service._id),
      )
    },
    [navigate],
  )

  const handleExportServiceRow = useCallback(
    async (service: Service) => {
      try {
        await exportMappedItemsToFile(
          EXPORT_COLUMN_MAP,
          [service],
          fileFormat,
          `deleted_service_${service.serviceid || service._id}`,
          {
            columnIds: list.visibleColumnIds,
            catalogOrder: DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Service exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export service'))
      }
    },
    [fileFormat, list.visibleColumnIds],
  )

  const handleRestore = useCallback(
    (service: Service) => {
      restoreServiceMutation.mutate(service._id, {
        onSuccess: () => toast.success('Service restored successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to restore service.'))
        },
      })
    },
    [restoreServiceMutation],
  )

  const handlePurge = useCallback(
    (service: Service) => {
      purgeServiceMutation.mutate(
        { id: service._id, adminNotes: 'Permanently purged by administrator' },
        {
          onSuccess: () => toast.success(`Permanently purged ${service.title || 'listing'}`),
          onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Failed to permanently purge listing.'))
          },
        },
      )
    },
    [purgeServiceMutation],
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
        ...pickServicePreferenceColumns(
          dataColumnsById,
          list.visibleColumnIds,
          DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS,
        ),
        {
          id: 'actions',
          accessorFn: () => null,
          header: 'Actions',
          meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
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
                  icon={<Eye className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  View Details
                </TableActionsItem>
                <TableActionsItem
                  icon={<RotateCcw className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handleRestore(service)
                  }}
                >
                  Restore Service
                </TableActionsItem>
                <TableActionsItem
                  icon={<Trash2 className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handlePurge(service)
                  }}
                >
                  Permanently Purge Listing
                </TableActionsItem>
                <TableActionsItem
                  icon={<User className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openViewExpert(service)
                  }}
                >
                  View Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<ShoppingBag className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openOrdersAndRevenue(service)
                  }}
                >
                  View Orders & Revenue
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
    handleExportServiceRow,
    handlePurge,
    handleRestore,
    list,
    navigate,
    openOrdersAndRevenue,
    openViewExpert,
  ])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Deleted Services"
        breadcrumbItems={[
          { label: 'Service Management', to: '/services/management' },
          { label: 'Deleted Services', isActive: true },
        ]}
        backTo="/services/management"
        metricsPath="/metrics/service-deleted?returnTo=/services/management/deleted&section=table"
      />

      <DataTable
        columns={columns}
        data={list.services}
        getRowId={(service) => service._id}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_DELETED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        onAdvancedFilter={list.onAdvancedFilter}
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
        emptyMessage="No deleted services found."
      />
      {list.exportFilterModals}

      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate to Compliance"
        description="Are you sure you want to escalate this deleted listing to compliance? It will be reviewed by the selected sub-admin."
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
