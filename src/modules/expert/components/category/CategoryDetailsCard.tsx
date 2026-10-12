import { RequiredMark } from '@/shared/components/form/required-mark'

import UploadBox from './UploadBox'
import { categoryFormTheme } from './category-form.theme'

interface CategoryDetailsCardProps {
  categoryName: string
  description: string
  iconPreview?: string
  imagePreview?: string
  readOnly?: boolean
  onCategoryNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onIconChange: (file: File | null) => void
  onImageChange: (file: File | null) => void
}

const CategoryDetailsCard = ({
  categoryName,
  description,
  iconPreview,
  imagePreview,
  readOnly = false,
  onCategoryNameChange,
  onDescriptionChange,
  onIconChange,
  onImageChange,
}: CategoryDetailsCardProps) => {
  return (
    <div className="rounded-xl bg-[#141414] p-6">
      <h2 className={categoryFormTheme.sectionTitleClass}>Category Details</h2>

      <p className={`mt-1 ${categoryFormTheme.sectionSubtitleClass}`}>
        Provide basic details of category & sub category
      </p>

      <div className="mt-6">
        <label className="text-body-sm-medium mb-2 block text-white">
          Category Name <RequiredMark />
        </label>

        <input
          value={categoryName}
          disabled={readOnly}
          onChange={onCategoryNameChange}
          placeholder="Enter Category Name"
          className={categoryFormTheme.inputClass}
        />
      </div>

      <div className="mt-5">
        <label className="text-body-sm-medium mb-2 block text-white">
          Description <RequiredMark />
        </label>

        <textarea
          value={description}
          disabled={readOnly}
          onChange={onDescriptionChange}
          placeholder="Enter description here"
          rows={4}
          className={categoryFormTheme.textareaClass}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <UploadBox
          label="3D Icon"
          helperText="Displayed as a clickable 3D-style icon"
          tooltipWidth={141}
          tooltipMinHeight={44}
          placeholderText="Upload icon here"
          preview={iconPreview}
          onChange={onIconChange}
          disabled={readOnly}
        />

        <UploadBox
          label="Image"
          helperText="Displayed as the header image on the category detail screen"
          tooltipWidth={175}
          tooltipMinHeight={50}
          placeholderText="Upload Image here"
          preview={imagePreview}
          onChange={onImageChange}
          disabled={readOnly}
        />
      </div>
    </div>
  )
}

export default CategoryDetailsCard
