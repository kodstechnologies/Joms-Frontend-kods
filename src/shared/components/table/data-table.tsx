import type { ReactNode } from 'react'
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowUpDown, Download, Filter, Search } from 'lucide-react'

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
  const firstItem = pagination.totalItems === 0 ? 0 : (currentPage - 1) * pagination.pageSize + 1
  const lastItem = Math.min(currentPage * pagination.pageSize, pagination.totalItems)

  const changePage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(pagination.totalPages, 1))
    if (nextPage !== currentPage) {
      pagination.onPageChange(nextPage)
    }
  }

  return (
    <section
      className={cn('overflow-hidden rounded-md border border-[#202020] bg-[#121212]', className)}
      aria-label={`${resourceLabel} table`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-3 pb-2">
        <div className="relative w-full sm:w-[220px]">
          <Search
            className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#737373]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Search ${resourceLabel}`}
            className="h-9 rounded-md border-[#070707] bg-[#050505] pl-9 text-xs text-white placeholder:text-[#666666] focus-visible:ring-1 focus-visible:ring-[#F0C27B]/40"
          />
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {toolbarContent}
          <Button
            type="button"
            variant="secondary"
            onClick={onAdvancedFilter}
            disabled={!onAdvancedFilter}
            className="h-9 flex-1 gap-2 rounded-md border border-white/45 bg-transparent px-3 text-[11px] font-semibold text-white shadow-none hover:border-white/70 hover:bg-white/5 sm:flex-none"
          >
            <Filter className="size-3.5" aria-hidden="true" />
            Advanced Filters
          </Button>
          <Button
            type="button"
            onClick={onExport}
            disabled={!onExport || isExporting}
            className="h-9 flex-1 gap-2 rounded-md bg-[#F0C27B] px-3 text-[11px] font-bold text-black shadow-none hover:bg-[#f4cc91] sm:flex-none"
          >
            <Download className="size-3.5" aria-hidden="true" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      <div className="px-3 pb-5" aria-live="polite">
        <p className="text-[11px] leading-none text-[#8A8A8A]">
          Showing {firstItem}-{lastItem} of {pagination.totalItems} {resourceLabel}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-[12px]">
          <thead
            className={cn(
              'border-y border-[#252525] bg-[#121212]',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-[11px] text-[#F5F5F5]">
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
                        {header.column.id !== 'select' && header.column.id !== 'actions' && (
                          <ArrowUpDown className="size-3 text-white/80" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {isLoading ? (
              Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {table.getVisibleLeafColumns().map((column) => (
                    <td
                      key={column.id}
                      className={cn('px-3 py-3', column.columnDef.meta?.cellClassName)}
                    >
                      <div className="h-4 min-w-12 rounded bg-[#262626]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-5 py-12 text-center text-[#8A8A8A]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="text-[#E6E6E6] transition-colors hover:bg-white/[0.03]">
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

      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#252525] px-3 py-4 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() => changePage(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          className="h-8 w-full rounded-md border border-white/25 bg-transparent px-3 text-[11px] font-medium text-white shadow-none hover:border-white/45 hover:bg-white/5 sm:w-auto"
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
                {hasGap && <span className="px-1 text-slate-600">...</span>}
                <button
                  type="button"
                  onClick={() => changePage(page)}
                  disabled={isLoading}
                  aria-current={currentPage === page ? 'page' : undefined}
                  aria-label={`Go to page ${page}`}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors disabled:opacity-50',
                    currentPage === page
                      ? 'border-[#F0C27B] bg-[#F0C27B] text-black'
                      : 'border-white/25 bg-transparent text-white hover:border-white/45 hover:bg-white/5',
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
          className="h-8 w-full rounded-md border border-white/25 bg-transparent px-3 text-[11px] font-medium text-white shadow-none hover:border-white/45 hover:bg-white/5 sm:w-auto"
        >
          Next
        </Button>
      </div>
    </section>
  )
}
