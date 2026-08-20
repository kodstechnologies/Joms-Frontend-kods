import { useEffect, useState } from 'react'
import { Tag, Loader2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AddTagsModal } from './add-tags-modal'
import { useTagsApi } from '../hooks/use-tags-api'

interface FinanceRecordWithTagsProps {
  recordId: string
  recordType: 'payment' | 'refund' | 'dispute' | 'invoice' | 'payout'
  onTagsUpdate?: (tags: string[]) => void
}

/**
 * Component that displays a finance record with tag management
 * Integrates AddTagsModal with useTagsApi for full functionality
 */
export const FinanceRecordWithTags: React.FC<FinanceRecordWithTagsProps> = ({
  recordId,
  recordType,
  onTagsUpdate,
}) => {
  const { tags, loading, addTags, removeTags, fetchTags } = useTagsApi()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Load tags when component mounts
    fetchTags(recordId)
  }, [recordId, fetchTags])

  const handleAddTags = async (selectedTags: string[]) => {
    await addTags(recordId, selectedTags)
    setIsModalOpen(false)

    // Notify parent component
    onTagsUpdate?.([...tags, ...selectedTags])

    // Refresh tags
    await fetchTags(recordId)
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    await removeTags(recordId, [tagToRemove])
    onTagsUpdate?.(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="space-y-4">
      {/* Tags Display Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Tags</label>
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
            {loading ? 'Loading...' : 'Add Tag'}
          </Button>
        </div>

        {/* Tags List */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full hover:bg-orange-600"
                  title={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No tags added yet</p>
        )}
      </div>

      {/* Add Tags Modal */}
      <AddTagsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        onSubmit={async ({ tags: selectedTags }) => {
          await handleAddTags(selectedTags)
        }}
        initialTags={tags}
        title={`Add tags to ${recordType}`}
        entityLabel={recordType}
      />
    </div>
  )
}

export default FinanceRecordWithTags
