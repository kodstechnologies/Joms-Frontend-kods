import type { ReactNode } from 'react'
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Download, Filter, Search } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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
  onAdvancedFilter?: () => void
  onExport?: () => void
  isExporting?: boolean
  pagination: DataTablePagination
  resourceLabel?: string
  toolbarContent?: ReactNode
  className?: string
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
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
  onAdvancedFilter,
  onExport,
  isExporting = false,
  pagination,
  resourceLabel = 'records',
  toolbarContent,
  className,
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
  const firstItem =
    pagination.totalItems === 0 ? 0 : (currentPage - 1) * pagination.pageSize + 1
  const lastItem = Math.min(currentPage * pagination.pageSize, pagination.totalItems)

  const changePage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(pagination.totalPages, 1))
    if (nextPage !== currentPage) {
      pagination.onPageChange(nextPage)
    }
  }

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-800 bg-[#121212]',
        className,
      )}
      aria-label={`${resourceLabel} table`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Search ${resourceLabel}`}
            className="border-slate-800 bg-[#1A1A1A] pl-10 text-white placeholder:text-slate-600 focus:ring-amber-400/20"
          />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {toolbarContent}
          <Button
            type="button"
            variant="secondary"
            onClick={onAdvancedFilter}
            disabled={!onAdvancedFilter}
            className="flex-1 gap-2 border-slate-800 bg-transparent text-xs text-white sm:flex-none md:text-sm"
          >
            <Filter className="size-4" aria-hidden="true" />
            Advanced Filters
          </Button>
          <Button
            type="button"
            onClick={onExport}
            disabled={!onExport || isExporting}
            className="flex-1 gap-2 bg-amber-100 text-xs font-semibold text-black hover:bg-amber-200 sm:flex-none md:text-sm"
          >
            <Download className="size-4" aria-hidden="true" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      <div className="px-5 pb-3" aria-live="polite">
        <p className="text-xs text-slate-500">
          Showing <span className="text-slate-300">{firstItem}-{lastItem}</span> of{' '}
          <span className="text-slate-300">{pagination.totalItems}</span> {resourceLabel}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead
            className={cn(
              'border-y border-slate-800/50 bg-[#121212]',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="text-[11px] tracking-wider text-slate-500 uppercase"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      'px-3 py-4 font-semibold',
                      header.column.columnDef.meta?.headerClassName,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoading ? (
              Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {table.getVisibleLeafColumns().map((column) => (
                    <td
                      key={column.id}
                      className={cn('px-3 py-4', column.columnDef.meta?.cellClassName)}
                    >
                      <div className="h-4 min-w-12 rounded bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="text-slate-300 transition-colors hover:bg-slate-800/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-4',
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

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 p-4 sm:flex-row md:p-5">
        <Button
          type="button"
          variant="secondary"
          onClick={() => changePage(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          className="w-full gap-2 border-slate-800 bg-transparent text-white sm:w-auto"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>

        <nav className="flex items-center gap-1 md:gap-2" aria-label={`${resourceLabel} pagination`}>
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1]
            const hasGap = previousPage !== undefined && page - previousPage > 1

            return (
              <div key={page} className="flex items-center gap-1 md:gap-2">
                {hasGap && <span className="px-1 text-slate-600">...</span>}
                <button
                  type="button"
                  onClick={() => changePage(page)}
                  disabled={isLoading}
                  aria-current={currentPage === page ? 'page' : undefined}
                  aria-label={`Go to page ${page}`}
                  className={cn(
                    'flex size-8 items-center justify-center rounded text-xs font-medium transition-colors disabled:opacity-50 md:text-sm',
                    currentPage === page
                      ? 'bg-amber-400 text-black'
                      : 'text-slate-500 hover:text-white',
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
          className="w-full gap-2 border-slate-800 bg-transparent text-white sm:w-auto"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}
