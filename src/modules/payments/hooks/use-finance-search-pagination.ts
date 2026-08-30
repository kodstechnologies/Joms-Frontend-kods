import { useEffect, useState } from 'react'

const SEARCH_DEBOUNCE_MS = 300

export function useFinanceSearchPagination() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setCurrentPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  return { searchQuery, setSearchQuery, debouncedSearch, currentPage, setCurrentPage }
}
