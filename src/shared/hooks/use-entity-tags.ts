import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export function useEntityTags() {
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [tagTargetId, setTagTargetId] = useState<string | null>(null)
  const [tagsById, setTagsById] = useState<Record<string, string[]>>({})

  const openTagModal = useCallback((id: string) => {
    setTagTargetId(id)
    setTagModalOpen(true)
  }, [])

  const closeTagModal = useCallback(() => {
    setTagModalOpen(false)
    setTagTargetId(null)
  }, [])

  const saveTags = useCallback(
    async (tags: string[]) => {
      if (!tagTargetId) return
      setTagsById((prev) => ({ ...prev, [tagTargetId]: tags }))
      toast.success('Tags updated')
    },
    [tagTargetId],
  )

  return {
    tagModalOpen,
    openTagModal,
    closeTagModal,
    saveTags,
    initialTags: tagTargetId ? (tagsById[tagTargetId] ?? []) : [],
  }
}
