import type { ColumnDef } from '@tanstack/react-table'

const DEFAULT_CHECKBOX_CLASS = 'ui-table-checkbox'

type FinanceSelectColumnOptions<T> = {
  headerLabel: string
  rowLabel: (row: T) => string
  selectedRowIds: string[]
  allVisibleSelected: boolean
  someVisibleSelected: boolean
  toggleVisibleRows: () => void
  toggleRowSelection: (rowId: string) => void
  checkboxClassName?: string
}

export function createFinanceSelectColumn<T extends { id: string }>({
  headerLabel,
  rowLabel,
  selectedRowIds,
  allVisibleSelected,
  someVisibleSelected,
  toggleVisibleRows,
  toggleRowSelection,
  checkboxClassName = DEFAULT_CHECKBOX_CLASS,
}: FinanceSelectColumnOptions<T>): ColumnDef<T> {
  return {
    id: 'select',
    header: () => (
      <input
        type="checkbox"
        aria-label={headerLabel}
        checked={allVisibleSelected}
        ref={(input) => {
          if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
        }}
        onChange={toggleVisibleRows}
        className={checkboxClassName}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select ${rowLabel(row.original)}`}
        checked={selectedRowIds.includes(row.original.id)}
        onChange={() => toggleRowSelection(row.original.id)}
        onClick={(event) => event.stopPropagation()}
        className={checkboxClassName}
      />
    ),
    meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
  }
}
