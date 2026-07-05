import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

import UploadBox from './UploadBox'
import { categoryFormTheme } from './category-form.theme'

export interface SubCategory {
  id: number
  name: string
  description: string
  icon?: string
}

interface Props {
  subCategories: SubCategory[]
  onAdd: () => void
  onRemove: (id: number) => void
  onNameChange: (id: number, value: string) => void
  onDescriptionChange: (id: number, value: string) => void
  onIconChange: (id: number, file: File | null) => void
}

const SubCategoryCard = ({
  subCategories,
  onAdd,
  onRemove,
  onNameChange,
  onDescriptionChange,
  onIconChange,
}: Props) => {
  return (
    <div className="rounded-xl border border-white/10 bg-brand-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={categoryFormTheme.sectionTitleClass}>Sub-Category</h2>
          <p className={`mt-1 ${categoryFormTheme.sectionSubtitleClass}`}>
            Add any sub category under the main category
          </p>
        </div>

        <Button type="button" onClick={onAdd} className="h-10 shrink-0 text-xs">
          <Plus className="size-4" aria-hidden="true" />
          Add Sub-Category
        </Button>
      </div>

      <div className="mt-6 space-y-8">
        {subCategories.map((item, index) => (
          <div
            key={item.id}
            className={index > 0 ? 'border-t border-white/10 pt-8' : undefined}
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-white">
                  Sub-categories <span className="text-white">*</span>
                </label>

                <input
                  value={item.name}
                  onChange={(e) => onNameChange(item.id, e.target.value)}
                  placeholder="Sub-category name"
                  className={categoryFormTheme.inputClass}
                />
              </div>

              <div className="lg:w-[200px]">
                <label className="mb-2 block text-[12px] font-medium text-white">
                  Upload Vector Icon
                </label>

                <div className="flex items-end gap-3">
                  <div className="w-[140px]">
                    <UploadBox
                      variant="compact"
                      preview={item.icon}
                      onChange={(file) => onIconChange(item.id, file)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onRemove(item.id)}
                    disabled={subCategories.length === 1}
                    aria-label="Remove sub-category"
                    className="size-11 shrink-0 p-0"
                  >
                    <Trash2 className="size-[18px] text-red-500" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[12px] font-medium text-white">
                Description <span className="text-white">*</span>
              </label>

              <textarea
                rows={3}
                value={item.description}
                onChange={(e) => onDescriptionChange(item.id, e.target.value)}
                placeholder="Enter email address here"
                className={categoryFormTheme.textareaClass}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubCategoryCard
