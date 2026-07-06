import type { ReactNode } from 'react'
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowUpDown, Filter, Search, Upload } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  pagination: DataTablePagination
  resourceLabel?: string
  toolbarContent?: ReactNode
  className?: string
  showSortIcons?: boolean
  contentClassName?: string
  tone?: 'default' | 'category'
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
  advancedFilterLabel = 'Advanced Filters',
  onAdvancedFilter,
  onExport,
  isExporting = false,
  pagination,
  resourceLabel = 'records',
  toolbarContent,
  className,
  showSortIcons = true,
  contentClassName,
  tone = 'default',
}: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
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
        'overflow-hidden rounded-2xl border',
        isCategoryTone
          ? 'border-[#242424] bg-[#181818]'
          : 'border-white/10 bg-brand-surface',
        className,
      )}
      aria-label={`${resourceLabel} table`}
    >
      <div className={cn('px-4 pt-4 sm:px-5 sm:pt-5', contentClassName)}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="relative w-full sm:max-w-[360px] sm:flex-1">
          <Search
            className={cn(
              'absolute top-1/2 left-3 size-3.5 -translate-y-1/2',
              isCategoryTone ? 'text-[#666666]' : 'text-brand-muted',
            )}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Search ${resourceLabel}`}
            className={cn(
              'h-10 rounded-xl pl-9 text-[12px] focus-visible:ring-1',
              isCategoryTone
                ? 'border-[#2A2A2A] bg-black text-white placeholder:text-[#666666] focus-visible:ring-[#FFC16B]/40'
                : 'border-white/10 bg-[#0F0F0F] text-brand-text placeholder:text-[#666666] focus-visible:ring-brand-accent/40',
            )}
          />
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-3 lg:w-auto">
          {toolbarContent}
          <Button
            type="button"
            variant="secondary"
            onClick={onAdvancedFilter}
            disabled={!onAdvancedFilter}
            className={cn(
              'h-10 flex-1 gap-2 rounded-xl border bg-transparent px-4 text-[12px] font-semibold shadow-none sm:flex-none',
              isCategoryTone
                ? 'border-white/25 text-white hover:border-[#FFC16B] hover:bg-white/5'
                : 'border-white/45 text-brand-text hover:border-brand-accent hover:bg-white/5',
            )}
          >
            <Filter className="size-3.5" aria-hidden="true" />
            {advancedFilterLabel}
          </Button>
          <Button
            type="button"
            onClick={onExport}
            disabled={!onExport || isExporting}
            className={cn(
              'h-10 flex-1 gap-2 rounded-xl px-4 text-[12px] font-bold shadow-none sm:flex-none',
              isCategoryTone
                ? 'bg-[#FFC16B] text-black hover:bg-[#F5C27B]'
                : 'bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from',
            )}
          >
            <Upload className="size-4" aria-hidden="true" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      <div className="pb-4" aria-live="polite">
        <p
          className={cn(
            'text-[12px] leading-none',
            isCategoryTone ? 'text-[#888888]' : 'text-[#CCCCCC]',
          )}
        >
          Showing {firstItem}-{lastItem} of {pagination.totalItems} {resourceLabel}
        </p>
      </div>
      </div>

      <div className="overflow-x-auto px-4 sm:px-5">
        <table className="w-full min-w-max border-collapse text-left text-[12px]">
          <thead
            className={cn(
              'border-y',
              isCategoryTone
                ? 'border-[#242424] bg-[#181818]'
                : 'border-white/10 bg-brand-surface',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={cn(
                  'text-[11px]',
                  isCategoryTone ? 'text-[#888888]' : 'text-brand-text',
                )}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      'px-3 py-3 font-semibold whitespace-nowrap',
                      header.column.columnDef.meta?.headerClassName,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.id !== 'select' &&
                          header.column.id !== 'actions' &&
                          showSortIcons && (
                          <ArrowUpDown className="size-3 text-white/80" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={cn('divide-y', isCategoryTone ? 'divide-[#242424]' : 'divide-white/10')}>
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
                  className="px-5 py-12 text-center text-brand-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors hover:bg-white/[0.03]',
                    isCategoryTone ? 'text-white' : 'text-brand-stroke',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-3 align-middle leading-tight',
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
          isCategoryTone ? 'border-[#242424]' : 'border-white/10',
        )}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={() => changePage(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          className={cn(
            'h-8 w-full rounded-brand-md border bg-transparent px-3 text-[11px] font-medium shadow-none sm:w-auto',
            isCategoryTone
              ? 'border-white/25 text-white hover:border-[#FFC16B] hover:bg-white/5'
              : 'border-white/25 text-brand-text hover:border-brand-accent hover:bg-white/5',
          )}
        >
          Previous
        </Button>

        <nav
          className="flex items-center gap-1 md:gap-2"
          aria-label={`${resourceLabel} pagination`}
        >
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1]
            const hasGap = previousPage !== undefined && page - previousPage > 1

            return (
              <div key={page} className="flex items-center gap-1 md:gap-2">
                {hasGap && <span className="px-1 text-brand-muted">...</span>}
                <button
                  type="button"
                  onClick={() => changePage(page)}
                  disabled={isLoading}
                  aria-current={currentPage === page ? 'page' : undefined}
                  aria-label={`Go to page ${page}`}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-brand-md border text-[11px] font-semibold transition-colors disabled:opacity-50',
                    currentPage === page
                      ? isCategoryTone
                        ? 'border-[#FFC16B] bg-[#FFC16B] text-black'
                        : 'border-brand-accent bg-brand-accent text-brand-text-dark'
                      : isCategoryTone
                        ? 'border-white/25 bg-transparent text-white hover:border-[#FFC16B] hover:bg-white/5'
                        : 'border-white/25 bg-transparent text-brand-text hover:border-brand-accent hover:bg-white/5',
                  )}
                >
                  {page.toString().padStart(2, '0')}
                </button>
              </div>
            )
          })}
        </nav>

        <Button
          type="button"
          variant="secondary"
          onClick={() => changePage(currentPage + 1)}
          disabled={isLoading || currentPage >= Math.max(pagination.totalPages, 1)}
          className={cn(
            'h-8 w-full rounded-brand-md border bg-transparent px-3 text-[11px] font-medium shadow-none sm:w-auto',
            isCategoryTone
              ? 'border-white/25 text-white hover:border-[#FFC16B] hover:bg-white/5'
              : 'border-white/25 text-brand-text hover:border-brand-accent hover:bg-white/5',
          )}
        >
          Next
        </Button>
      </div>
    </section>
  )
}
