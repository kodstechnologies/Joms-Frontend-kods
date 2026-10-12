import { useState, type ReactNode } from 'react'
import type { ColumnDef, Column, RowData, SortingState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { SortOutlineIcon } from '@/shared/components/icons/action-button-icons'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { SearchableColumn, ColumnSearchValues } from '@/shared/types/search-types'
import { EnhancedSearchBar } from './enhanced-search-bar'
import { AdvanceFilterIcon, ExportDataIcon } from '@/shared/components/icons/action-button-icons'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required to match upstream ColumnMeta signature for declaration merging
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string
    cellClassName?: string

    sortField?: string
  }
}

export type DataTablePagination = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  getRowId?: (row: TData) => string
  isLoading?: boolean
  loadingRowCount?: number
  emptyMessage?: string
  stickyHeader?: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  advancedFilterLabel?: string
  onAdvancedFilter?: () => void

  advancedFilterVariant?: 'primary' | 'secondary'
  onExport?: () => void
  isExporting?: boolean
  showAdvancedFilter?: boolean
  showExport?: boolean
  showSearch?: boolean
  showRecordCount?: boolean
  pagination: DataTablePagination
  resourceLabel?: string
  toolbarContent?: ReactNode
  className?: string
  showSortIcons?: boolean
  contentClassName?: string
  tone?: 'default' | 'category'

  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: (updater: SortingState | ((old: SortingState) => SortingState)) => void
  onRowClick?: (row: TData) => void

  searchableColumns?: SearchableColumn[]

  columnSearches?: ColumnSearchValues

  onColumnSearchChange?: (key: string, value: string) => void

  onColumnSearchRemove?: (key: string) => void

  onClearAllSearches?: () => void
}

function isHeaderSortable<TData>(column: Column<TData, unknown>, manualSorting: boolean) {
  const columnId = column.id
  if (!columnId || columnId === 'select' || columnId === 'actions' || columnId === 'action') {
    return false
  }
  if (manualSorting) {
    return column.columnDef.enableSorting === true
  }
  return column.getCanSort()
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])

  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  loadingRowCount = 8,
  emptyMessage = 'No results found.',
  stickyHeader = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records',
  advancedFilterLabel = 'Advance Filters',
  onAdvancedFilter,
  onExport,
  isExporting = false,
  showAdvancedFilter = true,
  showExport = true,
  showSearch = true,
  showRecordCount = true,
  pagination,
  resourceLabel = 'records',
  toolbarContent,
  className,
  showSortIcons = true,
  contentClassName,
  tone = 'default',
  onRowClick,
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  searchableColumns,
  columnSearches,
  onColumnSearchChange,
  onColumnSearchRemove,
  onClearAllSearches,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sorting = controlledSorting ?? internalSorting
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable is intentionally opted out
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting,
    },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? { manualSorting: true } : { getSortedRowModel: getSortedRowModel() }),
  })

  const currentPage = Math.min(Math.max(pagination.page, 1), Math.max(pagination.totalPages, 1))
  const visiblePages = getVisiblePages(currentPage, Math.max(pagination.totalPages, 1))
  const firstItem = pagination.totalItems === 0 ? 0 : (currentPage - 1) * pagination.pageSize + 1
  const lastItem = Math.min(currentPage * pagination.pageSize, pagination.totalItems)

  const changePage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(pagination.totalPages, 1))
    if (nextPage !== currentPage) {
      pagination.onPageChange(nextPage)
    }
  }

  const isCategoryTone = tone === 'category'
  const showToolbarRow = showSearch || showAdvancedFilter || showExport || Boolean(toolbarContent)

  return (
    <section
      className={cn(
        'ui-data-table overflow-hidden rounded-2xl border',
        isCategoryTone ? 'bg-brand-surface border-white/10' : 'bg-brand-surface border-white/10',
        className,
      )}
      aria-label={`${resourceLabel} table`}
    >
      {(showToolbarRow || showRecordCount) && (
        <div className={cn('px-4 pt-4 sm:px-5 sm:pt-5', contentClassName)}>
          {showToolbarRow ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              {showSearch ? (
                searchableColumns &&
                columnSearches &&
                onColumnSearchChange &&
                onColumnSearchRemove &&
                onClearAllSearches ? (
                  <EnhancedSearchBar
                    globalSearch={searchValue}
                    onGlobalSearchChange={onSearchChange}
                    searchPlaceholder={searchPlaceholder}
                    resourceLabel={resourceLabel}
                    searchableColumns={searchableColumns}
                    columnSearches={columnSearches}
                    onColumnSearchChange={onColumnSearchChange}
                    onColumnSearchRemove={onColumnSearchRemove}
                    onClearAll={onClearAllSearches}
                  />
                ) : (
                  <div className="ui-table-search-wrap">
                    <Search className="ui-table-search-icon" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchValue}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder={searchPlaceholder}
                      aria-label={`Search ${resourceLabel}`}
                      className="ui-table-search h-[50px]"
                    />
                  </div>
                )
              ) : (
                <div />
              )}

              <div className="flex shrink-0 items-center justify-end gap-3">
                {toolbarContent}
                {showAdvancedFilter ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onAdvancedFilter}
                    disabled={!onAdvancedFilter}
                    className="table-advance-filter-btn gap-2"
                  >
                    <AdvanceFilterIcon className="size-5 shrink-0" aria-hidden="true" />
                    {advancedFilterLabel}
                  </Button>
                ) : null}
                {showExport ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={onExport}
                    disabled={!onExport || isExporting}
                    className="table-export-btn gap-2"
                  >
                    <ExportDataIcon className="size-5 shrink-0" aria-hidden="true" />
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {showRecordCount ? (
            <div className="pb-4" aria-live="polite">
              <p className="ui-table-showing">
                Showing{' '}
                <span className="ui-table-showing-value">
                  {firstItem}-{lastItem}
                </span>{' '}
                of <span className="ui-table-showing-value">{pagination.totalItems}</span>{' '}
                {resourceLabel}
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="overflow-x-auto px-4 sm:px-5">
        <table className="ui-data-table-table">
          <thead
            className={cn(
              isCategoryTone
                ? 'bg-brand-surface border-white/10'
                : 'bg-brand-surface border-white/10',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={cn(isCategoryTone ? 'text-muted' : 'text-brand-text')}
              >
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id
                  const canSort = isHeaderSortable(header.column, manualSorting) && showSortIcons
                  const sorted = canSort ? sorting.find((item) => item.id === columnId) : undefined
                  const ariaSort = !canSort
                    ? undefined
                    : sorted
                      ? sorted.desc
                        ? 'descending'
                        : 'ascending'
                      : 'none'
                  const headerContent = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )

                  const toggleSort = () => {
                    if (!columnId) return
                    let next: SortingState
                    if (!sorted) {
                      next = [{ id: columnId, desc: false }]
                    } else if (!sorted.desc) {
                      next = [{ id: columnId, desc: true }]
                    } else {
                      next = []
                    }
                    onSortingChange(next)
                  }

                  const sortIcon =
                    sorted?.desc === false ? (
                      <ArrowUp className="text-brand-primary size-4" aria-hidden="true" />
                    ) : sorted?.desc === true ? (
                      <ArrowDown className="text-brand-primary size-4" aria-hidden="true" />
                    ) : (
                      <SortOutlineIcon className="text-white" />
                    )

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cn(
                        'px-3 py-3 whitespace-nowrap',
                        header.column.columnDef.meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={toggleSort}
                          className="focus-visible:ring-brand-primary inline-flex cursor-pointer items-center gap-1.5 rounded select-none focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {headerContent}
                          {sortIcon}
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">{headerContent}</div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className={cn('divide-y', isCategoryTone ? 'divide-white/10' : 'divide-white/10')}>
            {isLoading ? (
              Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {table.getVisibleLeafColumns().map((column) => (
                    <td
                      key={column.id}
                      className={cn('px-3 py-3', column.columnDef.meta?.cellClassName)}
                    >
                      <div className="h-4 min-w-12 rounded bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="text-brand-muted px-5 py-12 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'transition-colors hover:bg-white/[0.03]',
                    onRowClick && 'cursor-pointer',
                    isCategoryTone ? 'text-white' : 'text-brand-stroke',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-3 align-middle',
                        cell.column.columnDef.meta?.cellClassName,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        className={cn(
          'flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row sm:px-5',
          isCategoryTone ? 'border-white/10' : 'border-white/10',
        )}
      >
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          className="table-pagination-btn"
        >
          Previous
        </button>

        <nav className="flex items-center gap-2" aria-label={`${resourceLabel} pagination`}>
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1]
            const hasGap = previousPage !== undefined && page - previousPage > 1
            const isActive = currentPage === page

            return (
              <div key={page} className="flex items-center gap-2">
                {hasGap && <span className="text-brand-muted px-1">...</span>}
                <button
                  type="button"
                  onClick={() => changePage(page)}
                  disabled={isLoading}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Go to page ${page}`}
                  className={cn(
                    'table-pagination-btn table-pagination-page',
                    isActive && 'table-pagination-page-active',
                  )}
                >
                  {page.toString().padStart(2, '0')}
                </button>
              </div>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={isLoading || currentPage >= Math.max(pagination.totalPages, 1)}
          className="table-pagination-btn"
        >
          Next
        </button>
      </div>
    </section>
  )
}
