import { useCallback, useMemo, useState } from 'react'

import type { Expert } from '../../type/expert'

export function useExpertListSelection(experts: Expert[]) {
  const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([])

  const visibleExpertIds = useMemo(() => experts.map((expert) => expert.expertId), [experts])

  const allVisibleSelected =
    visibleExpertIds.length > 0 && visibleExpertIds.every((id) => selectedExpertIds.includes(id))
  const someVisibleSelected = visibleExpertIds.some((id) => selectedExpertIds.includes(id))

  const toggleVisible = useCallback(() => {
    setSelectedExpertIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleExpertIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleExpertIds]))
    })
  }, [allVisibleSelected, visibleExpertIds])

  const toggleOne = useCallback((expertId: string) => {
    setSelectedExpertIds((currentIds) =>
      currentIds.includes(expertId)
        ? currentIds.filter((id) => id !== expertId)
        : [...currentIds, expertId],
    )
  }, [])

  return {
    selectedExpertIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisible,
    toggleOne,
  }
}
