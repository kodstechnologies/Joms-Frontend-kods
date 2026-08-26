import { useState, useCallback } from 'react'

interface UseTagsModalReturn {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
}

export const useTagsModal = (): UseTagsModalReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    selectedTags,
    setSelectedTags,
  }
}
