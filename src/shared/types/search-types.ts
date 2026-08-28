export type SearchableColumn = {
  key: string
  label: string
  type: 'text' | 'status' | 'category' | 'date'
  options?: { label: string; value: string }[]
  placeholder?: string
}

export type ColumnSearchValues = Record<string, string>

export type EnhancedSearchState = {
  globalSearch: string
  columnSearches: ColumnSearchValues
}

export type SearchQueryParams = Record<string, string>
