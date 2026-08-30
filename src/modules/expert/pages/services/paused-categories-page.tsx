import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { useNavigate } from 'react-router-dom'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { SERVICE_CATEGORY_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { SERVICE_CATEGORY_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildCategoryListQueryParams,
  createCategoryFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { fetchCategories } from '../../api/category-api'
import CategoryHeader from '../../components/category/CategoryHeader'
import { type Category } from '../../components/category/category-table-columns'
import { pausedCategoryColumns } from '../../components/category/PausedCategoryColumns'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import {
  DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
  SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '../../config/service-category-management-table-columns.config'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { useServiceCategories } from '../../hooks/use-category-management'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { mapServiceCategoryToUi } from '../../utils/category-mapper'
import { selectPreferredColumns } from '../../utils/select-preferred-columns'

const PAGE_SIZE = 10
const DEFAULT_VISIBLE_IDS = DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS

export const PausedCategoriesPage = () => {
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const [page, setPage] = useState(1)
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const preferencesQuery = useTableColumnPreferences(SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((c) => c.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: preferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
  })

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setPage(1)
    setAppliedFilters(values)
  }, [])

  const categoryQueryParams = useMemo(
    () =>
      buildCategoryListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        status: 'PAUSED',
      }),
    [appliedFilters, enhancedSearch, page],
  )

  const { data, isLoading, isError } = useServiceCategories(categoryQueryParams)

  const pausedCategories = useMemo(() => data?.categories ?? [], [data?.categories])
  const totalItems = data?.pagination?.total ?? pausedCategories.length
  const totalPages = Math.max(1, data?.pagination?.pages ?? Math.ceil(totalItems / PAGE_SIZE))

  const columns = useMemo<ColumnDef<Category>[]>(() => {
    const rawVisibleIds = preferencesQuery.data?.visibleColumnIds?.length
      ? preferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS
    return selectPreferredColumns(
      pausedCategoryColumns,
      rawVisibleIds,
      DEFAULT_VISIBLE_IDS,
      SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
    )
  }, [preferencesQuery.data])

  const handleExportData = useMemo(
    () =>
      createCategoryFilteredExportHandler(
        async (params) => {
          const response = await fetchCategories(params)
          return { data: (response.data ?? []).map(mapServiceCategoryToUi) }
        },
        SERVICE_CATEGORY_EXPORT_COLUMN_MAP,
        'paused_service_categories_export',
        { status: 'PAUSED' },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [catalogColumnIds, exportColumnIds],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'service-category-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const emptyMessage = useMemo(
    () => (isError ? 'Failed to load paused categories.' : 'No paused categories found.'),
    [isError],
  )

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <CategoryHeader
          title="Paused Categories"
          breadcrumb="Paused Categories"
          backPath={scope.basePath}
        />

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            variant="secondary"
            className="ui-manage-metrics w-full md:w-auto"
            onClick={() => navigate(`${scope.metricsPath}?section=table`)}
          >
            <ManageMetricsIcon className="size-5" />
            Manage Metrics
          </Button>

          <Button
            className="w-full md:w-auto"
            onClick={() => navigate(categoryPath(scope, 'create'))}
          >
            <img src={createIcon} alt="create" className="size-4" />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pausedCategories}
        getRowId={(row) => row.id}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_CATEGORY_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
        resourceLabel="categories"
      />
      {exportFilterModals}
    </div>
  )
}
