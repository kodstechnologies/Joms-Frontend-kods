import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  stickyHeader?: boolean
}

export function DataTable<TData>({ columns, data, stickyHeader = true }: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[720px] border-collapse text-sm sm:min-w-full">
        <thead
          className={cn(
            'bg-slate-100 text-left dark:bg-slate-900',
            stickyHeader ? 'sticky top-0 z-10' : null,
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 font-medium text-slate-600 dark:text-slate-300 sm:px-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3 sm:px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
