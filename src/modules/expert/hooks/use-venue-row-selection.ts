import { useCallback, useMemo, useState } from 'react'

export function useVenueRowSelection(visibleIds: string[]) {
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])

  const allVisibleVenuesSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedVenueIds.includes(id))
  const someVisibleVenuesSelected = visibleIds.some((id) => selectedVenueIds.includes(id))

  const toggleVisibleVenues = useCallback(() => {
    setSelectedVenueIds((currentIds) => {
      if (allVisibleVenuesSelected) {
        return currentIds.filter((id) => !visibleIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleIds]))
    })
  }, [allVisibleVenuesSelected, visibleIds])

  const toggleVenueSelection = useCallback((venueId: string) => {
    setSelectedVenueIds((currentIds) =>
      currentIds.includes(venueId)
        ? currentIds.filter((id) => id !== venueId)
        : [...currentIds, venueId],
    )
  }, [])

  return {
    selectedVenueIds,
    allVisibleVenuesSelected,
    someVisibleVenuesSelected,
    toggleVisibleVenues,
    toggleVenueSelection,
  }
}

export function useVenueVisibleIds<T extends { _id: string }>(rows: T[]) {
  return useMemo(() => rows.map((venue) => venue._id), [rows])
}
