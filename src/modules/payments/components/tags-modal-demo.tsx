import { useState } from 'react'
import { Tag, GitMerge } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AddTagsModal } from './add-tags-modal'
import { MergeTicketsModal } from './merge-tickets-modal'
import { useTagsModal } from '../hooks/use-tags-modal'

export const TagsModalDemo: React.FC = () => {
  const {
    isOpen: tagsModalOpen,
    openModal: openTagsModal,
    closeModal: closeTagsModal,
    selectedTags,
    setSelectedTags,
  } = useTagsModal()

  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  const [appliedTags, setAppliedTags] = useState<string[]>([])

  const handleAddTags = (tags: string[]) => {
    setAppliedTags(tags)
    console.log('Tags added:', tags)
    // Call your API here to save tags
  }

  const handleMergeTickets = ({
    ticketIds,
    adminNotes,
  }: {
    ticketIds: string[]
    adminNotes: string
  }) => {
    console.log('Merging tickets:', ticketIds, adminNotes)
    // Call your API here to merge tickets
    setMergeModalOpen(false)
  }

  return (
    <div className="space-y-8 p-6">
      {/* Tags Modal Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Tags Modal</h2>
        <p className="text-sm text-gray-400">Add tags for internal organization and tracking</p>

        <Button
          onClick={openTagsModal}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
        >
          <Tag className="h-4 w-4" />
          Open Tags Modal
        </Button>

        {appliedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {appliedTags.map((tag) => (
              <span key={tag} className="rounded-full bg-orange-500 px-3 py-1 text-xs text-white">
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Merge Tickets Modal Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Merge Tickets Modal</h2>
        <p className="text-sm text-gray-400">Merge multiple tickets into one for better tracking</p>

        <Button
          onClick={() => setMergeModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <GitMerge className="h-4 w-4" />
          Open Merge Modal
        </Button>
      </section>

      {/* Modals */}
      <AddTagsModal
        isOpen={tagsModalOpen}
        onClose={closeTagsModal}
        onSubmit={({ tags }) => {
          handleAddTags(tags)
          setSelectedTags(tags)
        }}
        initialTags={appliedTags}
      />

      <MergeTicketsModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        onMerge={handleMergeTickets}
      />
    </div>
  )
}

export default TagsModalDemo
