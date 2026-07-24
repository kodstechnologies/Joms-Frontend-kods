import type { ReactNode } from 'react'
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowUpDown, Filter, Search, Upload } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required to match upstream ColumnMeta signature for declaration merging
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string
    cellClassName?: string
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
  onExport?: () => void
  isExporting?: boolean
  showAdvancedFilter?: boolean
  showExport?: boolean
  pagination: DataTablePagination
  resourceLabel?: string
  toolbarContent?: ReactNode
  className?: string
  showSortIcons?: boolean
  contentClassName?: string
  tone?: 'default' | 'category'
  onRowClick?: (row: TData) => void
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
  pagination,
  resourceLabel = 'records',
  toolbarContent,
  className,
  showSortIcons = true,
  contentClassName,
  tone = 'default',
  onRowClick,
}: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable is intentionally opted out
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
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

  return (
    <section
      className={cn(
        'ui-data-table overflow-hidden rounded-2xl border',
        isCategoryTone ? 'bg-brand-surface border-white/10' : 'bg-brand-surface border-white/10',
        className,
      )}
      aria-label={`${resourceLabel} table`}
    >
      <div className={cn('px-4 pt-4 sm:px-5 sm:pt-5', contentClassName)}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div className="ui-table-search-wrap">
            <Search className="ui-table-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={`Search ${resourceLabel}`}
              className="ui-table-search"
            />
          </div>

          <div className="flex w-full shrink-0 items-center justify-end gap-3 lg:w-auto">
            {toolbarContent}
            {showAdvancedFilter ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onAdvancedFilter}
                disabled={!onAdvancedFilter}
                className={cn(
                  'ui-advance-filters text-body-sm flex-1 gap-2 rounded-xl border bg-transparent px-4 font-semibold shadow-none sm:flex-none',
                  isCategoryTone
                    ? 'hover:border-brand-accent border-white/25 text-white hover:bg-white/5'
                    : 'text-brand-text hover:border-brand-accent border-white/45 hover:bg-white/5',
                )}
              >
                <Filter className="size-3.5" aria-hidden="true" />
                {advancedFilterLabel}
              </Button>
            ) : null}
            {showExport ? (
              <Button
                type="button"
                variant="primary"
                onClick={onExport}
                disabled={!onExport || isExporting}
                className="ui-export-data flex-1 gap-2 sm:flex-none"
              >
                <Upload className="icon-md" aria-hidden="true" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            ) : null}
          </div>
        </div>

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
      </div>

      <div className="overflow-x-auto px-4 sm:px-5">
        <table className="ui-data-table-table">
          <thead
            className={cn(
              'border-y',
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
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      'px-3 py-3 whitespace-nowrap',
                      header.column.columnDef.meta?.headerClassName,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.id !== 'select' &&
                          header.column.id !== 'actions' &&
                          showSortIcons && (
                            <ArrowUpDown className="size-3.5 text-white/80" aria-hidden="true" />
                          )}
                      </span>
                    )}
                  </th>
                ))}
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
          className="ui-pagination-btn ui-pagination-prev"
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
                    'ui-pagination-btn ui-pagination-page',
                    isActive && 'ui-pagination-page-active',
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
          className="ui-pagination-btn ui-pagination-next"
        >
          Next
        </button>
      </div>
    </section>
  )
}
