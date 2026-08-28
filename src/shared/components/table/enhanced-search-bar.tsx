import { useRef, useState, useEffect, useCallback } from 'react'
import { Search, X, ChevronDown, ChevronUp, Calendar, Tag, Hash, User, Layers } from 'lucide-react'

import type { SearchableColumn, ColumnSearchValues } from '@/shared/types/search-types'
import { cn } from '@/shared/lib/cn'

type EnhancedSearchBarProps = {
  globalSearch: string
  onGlobalSearchChange: (value: string) => void
  searchPlaceholder?: string
  resourceLabel?: string
  searchableColumns: SearchableColumn[]
  columnSearches: ColumnSearchValues
  onColumnSearchChange: (key: string, value: string) => void
  onColumnSearchRemove: (key: string) => void
  onClearAll: () => void
}

const COLUMN_ICONS: Record<string, typeof Search> = {
  text: Hash,
  status: Tag,
  category: Layers,
  date: Calendar,
  name: User,
}

function getColumnIcon(column: SearchableColumn) {
  if (column.key.toLowerCase().includes('name')) return User
  return COLUMN_ICONS[column.type] || Hash
}

export function EnhancedSearchBar({
  globalSearch,
  onGlobalSearchChange,
  searchPlaceholder = 'Search records...',
  resourceLabel = 'records',
  searchableColumns,
  columnSearches,
  onColumnSearchChange,
  onColumnSearchRemove,
  onClearAll,
}: EnhancedSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeCount = Object.values(columnSearches).filter((v) => v.trim().length > 0).length
  const hasAnySearch = globalSearch.trim().length > 0 || activeCount > 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClearAll = useCallback(() => {
    onClearAll()
    setIsExpanded(false)
  }, [onClearAll])

  return (
    <div className="enhanced-search" ref={containerRef}>
      <div className="enhanced-search__main">
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
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            'enhanced-search__toggle',
            isExpanded && 'enhanced-search__toggle--active',
            activeCount > 0 && 'enhanced-search__toggle--has-filters',
          )}
          aria-expanded={isExpanded}
          aria-label="Toggle column search filters"
        >
          <Search className="size-3.5" aria-hidden="true" />
          <span>Column Search</span>
          {activeCount > 0 ? <span className="enhanced-search__badge">{activeCount}</span> : null}
          {isExpanded ? (
            <ChevronUp className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          )}
        </button>

        {hasAnySearch ? (
          <button
            type="button"
            onClick={handleClearAll}
            className="enhanced-search__clear"
            aria-label="Clear all searches"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {activeCount > 0 && !isExpanded ? (
        <div className="enhanced-search__chips">
          {searchableColumns.map((column) => {
            const value = columnSearches[column.key]
            if (!value || !value.trim()) return null

            const displayValue =
              column.type === 'status' || column.type === 'category'
                ? column.options?.find((opt) => opt.value === value)?.label || value
                : value

            return (
              <span key={column.key} className="enhanced-search__chip">
                <span className="enhanced-search__chip-label">{column.label}:</span>
                <span className="enhanced-search__chip-value">{displayValue}</span>
                <button
                  type="button"
                  onClick={() => onColumnSearchRemove(column.key)}
                  className="enhanced-search__chip-remove"
                  aria-label={`Remove ${column.label} filter`}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            )
          })}
        </div>
      ) : null}

      {isExpanded ? (
        <div className="enhanced-search__panel">
          <div className="enhanced-search__panel-grid">
            {searchableColumns.map((column) => {
              const Icon = getColumnIcon(column)
              return (
                <div key={column.key} className="enhanced-search__field">
                  <label
                    htmlFor={`col-search-${column.key}`}
                    className="enhanced-search__field-label"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {column.label}
                  </label>

                  {column.type === 'status' || column.type === 'category' ? (
                    <select
                      id={`col-search-${column.key}`}
                      value={columnSearches[column.key] || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          onColumnSearchChange(column.key, e.target.value)
                        } else {
                          onColumnSearchRemove(column.key)
                        }
                      }}
                      className="enhanced-search__select"
                    >
                      <option value="">{column.placeholder || `All ${column.label}`}</option>
                      {column.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : column.type === 'date' ? (
                    <div className="enhanced-search__date-range">
                      <input
                        id={`col-search-${column.key}`}
                        type="date"
                        value={columnSearches[`${column.key}From`] || ''}
                        onChange={(e) => onColumnSearchChange(`${column.key}From`, e.target.value)}
                        className="enhanced-search__date-input"
                        placeholder="From"
                      />
                      <span className="enhanced-search__date-sep">–</span>
                      <input
                        type="date"
                        value={columnSearches[`${column.key}To`] || ''}
                        onChange={(e) => onColumnSearchChange(`${column.key}To`, e.target.value)}
                        className="enhanced-search__date-input"
                        placeholder="To"
                      />
                    </div>
                  ) : (
                    <div className="enhanced-search__input-wrap">
                      <input
                        id={`col-search-${column.key}`}
                        type="text"
                        value={columnSearches[column.key] || ''}
                        onChange={(e) => onColumnSearchChange(column.key, e.target.value)}
                        placeholder={column.placeholder || `Search by ${column.label}...`}
                        className="enhanced-search__input"
                      />
                      {columnSearches[column.key]?.trim() ? (
                        <button
                          type="button"
                          onClick={() => onColumnSearchRemove(column.key)}
                          className="enhanced-search__input-clear"
                          aria-label={`Clear ${column.label}`}
                        >
                          <X className="size-3" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
