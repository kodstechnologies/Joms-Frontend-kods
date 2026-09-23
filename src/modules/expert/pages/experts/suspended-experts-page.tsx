import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Bell, Eye, PlayCircle, ShoppingBag, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

import {
  DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
  EXPERT_SUSPENDED_MODULE_KEY,
  EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '../../config/expert-management-table-columns.config'
import { useActivateExpert } from '../../hooks/use-expert'
import { useExpertStatusList } from '../../hooks/use-expert-status-list'
import type { Expert } from '../../type/expert'
import { isVenuePartner, openPartnerProfile } from '../../utils/expert-application-navigation'
import {
  buildExpertDataColumnsById,
  pickPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { EXPERT_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { PayoutHistoryDrawer } from '../../components/payout-history-drawer'
import { createExpertSelectColumn } from './expert-list-columns'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { EXPERT_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'

export function ExpertSuspendedExpertsPage() {
  const navigate = useNavigate()
  const activateExpertMutation = useActivateExpert()
  const { fileFormat } = useDefaultExportFormat()
  const [payoutDrawerTarget, setPayoutDrawerTarget] = useState<Expert | null>(null)
  const catalogColumnIds = useMemo(
    () => EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )

  const list = useExpertStatusList({
    moduleKey: EXPERT_SUSPENDED_MODULE_KEY,
    status: 'suspended',
    defaultVisibleColumnIds: DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'suspended_experts_export',
    exportColumnMap: EXPERT_EXPORT_COLUMN_MAP,
  })

  const handleActivate = useCallback(
    (expert: Expert) => {
      activateExpertMutation.mutate(expert.id, {
        onSuccess: () => toast.success('Expert activated successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to activate expert. Please try again.'))
        },
      })
    },
    [activateExpertMutation],
  )

  const openViewOrders = useCallback(
    (expert: Expert) => {
      const partnerId = String(expert.id || expert.expertId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      navigate(`/experts/management/profile/${partnerId}/clientele`)
    },
    [navigate],
  )

  const openNotifyExpert = useCallback(
    (expert: Expert) => {
      const partnerId = String(expert.id || expert.expertId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      const params = new URLSearchParams({
        channel: 'push',
        audience: 'experts',
        partnerIds: partnerId,
      })
      navigate(`/communication/create?${params.toString()}`)
    },
    [navigate],
  )

  const handleExportExpertRow = useCallback(
    async (expert: Expert) => {
      try {
        await exportMappedItemsToFile(
          EXPERT_EXPORT_COLUMN_MAP,
          [expert],
          fileFormat,
          `suspended_expert_${expert.expertId || expert.id}`,
          {
            columnIds: list.visibleColumnIds,
            catalogOrder: DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Expert exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export expert'))
      }
    },
    [fileFormat, list.visibleColumnIds],
  )

  const columns = useMemo<ColumnDef<Expert>[]>(() => {
    const dataColumnsById = buildExpertDataColumnsById()

    return withServerSortMeta(
      [
        createExpertSelectColumn({
          allVisibleSelected: list.selection.allVisibleSelected,
          someVisibleSelected: list.selection.someVisibleSelected,
          selectedExpertIds: list.selection.selectedExpertIds,
          toggleVisible: list.selection.toggleVisible,
          toggleOne: list.selection.toggleOne,
        }),
        ...pickPreferenceColumns(
          dataColumnsById,
          list.visibleColumnIds,
          DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
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
            const isOpen = list.activeDropdownId === expert.expertId
            const isVenue = isVenuePartner(expert)

            return (
              <TableActionsDropdown
                label={`Open actions for ${expert.name}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? expert.expertId : null)}
                menuWidth={240}
                maxVisibleItems={8}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    void openPartnerProfile(expert, navigate)
                  }}
                >
                  {isVenue ? 'View Profile' : 'View Expert'}
                </TableActionsItem>
                <TableActionsItem
                  icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handleActivate(expert)
                  }}
                >
                  Activate Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<ShoppingBag className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openViewOrders(expert)
                  }}
                >
                  View Orders
                </TableActionsItem>
                <TableActionsItem
                  icon={<Wallet className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setPayoutDrawerTarget(expert)
                  }}
                >
                  View Earnings & Payouts
                </TableActionsItem>
                <TableActionsItem
                  icon={<Bell className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openNotifyExpert(expert)
                  }}
                >
                  Notify Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<ExportDataIcon className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    void handleExportExpertRow(expert)
                  }}
                >
                  Export Record
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      EXPERT_COLUMN_SORT_FIELDS,
    )
  }, [handleActivate, handleExportExpertRow, list, navigate, openNotifyExpert, openViewOrders])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Suspended Experts"
        breadcrumbItems={[
          { label: 'Expert Management', to: '/experts/management' },
          { label: 'Suspended Experts', isActive: true },
        ]}
        metricsPath="/metrics/expert-suspended?returnTo=/experts/suspended"
      />

      <DataTable
        columns={columns}
        data={list.experts}
        getRowId={(expert) => expert.expertId}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_SUSPENDED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={list.onAdvancedFilter}
        onExport={list.onExport}
        {...list.serverSort.dataTableSortProps}
        pagination={{
          page: list.currentPage,
          pageSize: list.meta?.pagination.limit || 10,
          totalItems: list.meta?.pagination.total || 0,
          totalPages: list.meta?.pagination.pages || 1,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No suspended experts found."
      />
      {list.exportFilterModals}

      <PayoutHistoryDrawer
        isOpen={Boolean(payoutDrawerTarget)}
        onClose={() => setPayoutDrawerTarget(null)}
        expertId={payoutDrawerTarget?.id || payoutDrawerTarget?.expertId || ''}
        expertName={payoutDrawerTarget?.name || 'Expert'}
      />
    </div>
  )
}
