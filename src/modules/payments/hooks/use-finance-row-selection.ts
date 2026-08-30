import { useMemo, useState } from 'react'

export function useFinanceRowSelection(rows: Array<{ id: string }>) {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows])
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRowIds.includes(id))
  const someVisibleSelected = visibleRowIds.some((id) => selectedRowIds.includes(id))

  const toggleVisibleRows = () => {
    setSelectedRowIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleRowIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleRowIds]))
    })
  }

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId) ? currentIds.filter((id) => id !== rowId) : [...currentIds, rowId],
    )
  }

  return {
    selectedRowIds,
    setSelectedRowIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisibleRows,
    toggleRowSelection,
  }
}
