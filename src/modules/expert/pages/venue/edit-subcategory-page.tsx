import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { RequiredMark } from '@/shared/components/form/required-mark'

import CategoryHeader from '../../components/category/CategoryHeader'
import FooterActions from '../../components/category/FooterActions'
import UploadBox from '../../components/category/UploadBox'
import { categoryFormTheme } from '../../components/category/category-form.theme'
import {
  useUpdateVenueSubCategory,
  useVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

export const RenameVenueSubCategoryPage = () => {
  const { id, subCategoryId } = useParams()
  const { data: category, isLoading } = useVenueCategory(id)
  const subCategory = category?.subCategories.find((item) => item.id === subCategoryId)

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 pt-2 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <CategoryHeader
            title="Edit Sub-Category"
            breadcrumb="Edit Sub-Category"
            backPath={
              id ? `/venues/categories/management/view/${id}` : '/venues/categories/management'
            }
          />
        </div>
      </div>
    )
  }

  if (!category || !subCategory || !id || !subCategoryId) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: '#000000' }}>
        Sub Category Not Found
      </div>
    )
  }

  return (
    <EditSubCategoryForm
      key={subCategoryId}
      categoryId={id}
      categoryName={category.name}
      subCategoryId={subCategoryId}
      initialName={subCategory.name}
      initialDescription={subCategory.description}
      initialIcon={subCategory.icon}
    />
  )
}

const EditSubCategoryForm = ({
  categoryId,
  categoryName,
  subCategoryId,
  initialName,
  initialDescription,
  initialIcon,
}: {
  categoryId: string
  categoryName: string
  subCategoryId: string
  initialName: string
  initialDescription: string
  initialIcon?: string
}) => {
  const navigate = useNavigate()
  const updateMutation = useUpdateVenueSubCategory()
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [iconPreview, setIconPreview] = useState(initialIcon)
  const [iconFile, setIconFile] = useState<File | null>(null)

  const backPath = `/venues/categories/management/${categoryId}/subcategory/${subCategoryId}`

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Sub-category name and description are required')
      return
    }

    try {
      await updateMutation.mutateAsync({
        categoryId,
        subCategoryId,
        payload: {
          name: name.trim(),
          description: description.trim(),
          vectorIconFile: iconFile,
        },
      })
      toast.success('Sub-category updated successfully')
      navigate(backPath)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update sub-category'))
    }
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <CategoryHeader
          title="Edit Sub-Category"
          items={[
            { label: 'Category Management', to: '/venues/categories/management' },
            { label: categoryName, to: `/venues/categories/management/view/${categoryId}` },
            { label: 'Edit Sub-Category', isActive: true },
          ]}
          backPath={backPath}
          listPath="/venues/categories/management"
        />

        <div className="mt-6 rounded-xl bg-[#141414] p-6">
          <h2 className={categoryFormTheme.sectionTitleClass}>Sub-Category Details</h2>
          <p className={`mt-1 ${categoryFormTheme.sectionSubtitleClass}`}>
            Update the name, description, or vector icon
          </p>

          <div className="mt-6">
            <label className="text-body-sm-medium mb-2 block text-white">
              Sub-Category Name <RequiredMark />
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sub-category name"
              className={categoryFormTheme.inputClass}
            />
          </div>

          <div className="mt-5">
            <label className="text-body-sm-medium mb-2 block text-white">
              Description <RequiredMark />
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter description here"
              rows={4}
              className={categoryFormTheme.textareaClass}
            />
          </div>

          <div className="mt-6 max-w-sm">
            <UploadBox
              label="Vector Icon"
              helperText="Shown beside this sub-category"
              preview={iconPreview}
              onChange={(file) => {
                setIconFile(file)
                setIconPreview(file ? URL.createObjectURL(file) : initialIcon)
              }}
            />
          </div>
        </div>

        <FooterActions
          onSubmit={() => {
            void handleSubmit()
          }}
          isSubmitting={updateMutation.isPending}
          submitText="Save Sub-Category"
        />
      </div>
    </div>
  )
}
