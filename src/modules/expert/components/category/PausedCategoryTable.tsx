import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { pausedCategoryColumns, type PausedCategory } from './PausedCategoryColumns'

const pausedCategoryDefaults = {
  description: '',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  createdBy: 'Admin',
  adminNotes: '',
  subCategories: [],
} satisfies Pick<
  PausedCategory,
  'description' | 'createdAt' | 'updatedAt' | 'createdBy' | 'adminNotes' | 'subCategories'
>

const data: PausedCategory[] = [
  {
    id: 'CAT001',
    name: 'Photography',
    status: 'Accepted',
    subCategory: 5,
    services: 42,
    experts: 42,
    revenue: '₹3,45,000',
    ...pausedCategoryDefaults,
  },
  {
    id: 'CAT002',
    name: 'Makeup Artists',
    status: 'Pending',
    subCategory: 5,
    services: 58,
    experts: 58,
    revenue: '₹3,45,000',
    ...pausedCategoryDefaults,
  },
  {
    id: 'CAT003',
    name: 'Videography',
    status: 'Deleted',
    subCategory: 5,
    services: 89,
    experts: 89,
    revenue: '₹3,45,000',
    ...pausedCategoryDefaults,
  },
]
const PausedCategoryTable = () => {
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable is intentionally opted out
  const table = useReactTable({
    data,
    columns: pausedCategoryColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="bg-brand-surface rounded-xl p-6">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-white/10">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-body-sm-semibold text-muted py-4 text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-white/10">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="text-body-md text-brand-text py-5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" className="ui-pagination-btn ui-pagination-prev">
          Previous
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            className="ui-pagination-btn ui-pagination-page ui-pagination-page-active"
          >
            01
          </button>

          <button type="button" className="ui-pagination-btn ui-pagination-page">
            02
          </button>
        </div>

        <button type="button" className="ui-pagination-btn ui-pagination-next">
          Next
        </button>
      </div>
    </div>
  )
}

export default PausedCategoryTable
