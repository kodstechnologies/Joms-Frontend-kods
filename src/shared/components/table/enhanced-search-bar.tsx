import { Search, X } from 'lucide-react'

import type { SearchableColumn, ColumnSearchValues } from '@/shared/types/search-types'

type EnhancedSearchBarProps = {
  globalSearch: string
  onGlobalSearchChange: (value: string) => void
  searchPlaceholder?: string
  resourceLabel?: string
  searchableColumns?: SearchableColumn[]
  columnSearches?: ColumnSearchValues
  onColumnSearchChange?: (key: string, value: string) => void
  onColumnSearchRemove?: (key: string) => void
  onClearAll?: () => void
}

export function EnhancedSearchBar({
  globalSearch,
  onGlobalSearchChange,
  searchPlaceholder = 'Search records...',
  resourceLabel = 'records',
  onClearAll,
}: EnhancedSearchBarProps) {
  return (
    <div className="ui-table-search-wrap">
      <Search className="ui-table-search-icon" aria-hidden="true" />
      <input
        type="search"
        value={globalSearch}
        onChange={(event) => onGlobalSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={`Search ${resourceLabel}`}
        className="ui-table-search h-[50px]"
      />
      {globalSearch.trim() ? (
        <button
          type="button"
          onClick={() => {
            onGlobalSearchChange('')
            onClearAll?.()
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-white/40 hover:text-white"
          aria-label="Clear search"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
