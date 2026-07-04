import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import CategoryHeader from '../../components/category/CategoryHeader'
import CategoryDetailsCard from '../../components/category/CategoryDetailsCard'
import FooterActions from '../../components/category/FooterActions'
import SubCategoryCard from '../../components/category/SubCategoryCard'
import type { SubCategory } from '../../components/category/SubCategoryCard'
import {
  useAddServiceSubCategory,
  useCreateServiceCategory,
  useServiceCategory,
  useUpdateServiceCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

type CategoryFormPageProps = {
  mode: 'create' | 'rename' | 'subcategory'
}

export const CategoryFormPage = ({ mode }: CategoryFormPageProps) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const scope = useCategoryManagementScope()

  const { data: category } = useServiceCategory(mode === 'create' ? undefined : id)
  const createMutation = useCreateServiceCategory()
  const updateMutation = useUpdateServiceCategory()
  const addSubCategoryMutation = useAddServiceSubCategory()

  const [categoryName, setCategoryName] = useState('')
  const [description, setDescription] = useState('')
  const [iconPreview, setIconPreview] = useState<string>()
  const [headerPreview, setHeaderPreview] = useState<string>()
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [headerFile, setHeaderFile] = useState<File | null>(null)
  const [subCategories, setSubCategories] = useState<
    Array<SubCategory & { iconFile?: File | null }>
  >([
    {
      id: Date.now(),
      name: '',
      description: '',
      icon: '',
      iconFile: null,
    },
  ])

  useEffect(() => {
    if (!category) return

    if (mode === 'rename') {
      setCategoryName(category.name)
    }

    if (mode === 'subcategory') {
      setCategoryName(category.name)
      setDescription(category.description)
      setIconPreview(category.icon)
      setHeaderPreview(category.image)
    }
  }, [mode, category])

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    addSubCategoryMutation.isPending

  const handleCategoryIcon = (file: File | null) => {
    if (!file) return
    setIconFile(file)
    setHeaderFile(null)
    setHeaderPreview(undefined)
    setIconPreview(URL.createObjectURL(file))
  }

  const handleHeaderImage = (file: File | null) => {
    if (!file) return
    setHeaderFile(file)
    setIconFile(null)
    setIconPreview(undefined)
    setHeaderPreview(URL.createObjectURL(file))
  }

  const handleAddSubCategory = () => {
    setSubCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        description: '',
        icon: '',
        iconFile: null,
      },
    ])
  }

  const handleRemoveSubCategory = (subId: number) => {
    setSubCategories((prev) => prev.filter((item) => item.id !== subId))
  }

  const handleNameChange = (subId: number, value: string) => {
    setSubCategories((prev) =>
      prev.map((item) => (item.id === subId ? { ...item, name: value } : item)),
    )
  }

  const handleDescriptionChange = (subId: number, value: string) => {
    setSubCategories((prev) =>
      prev.map((item) =>
        item.id === subId ? { ...item, description: value } : item,
      ),
    )
  }

  const handleSubCategoryIcon = (subId: number, file: File | null) => {
    setSubCategories((prev) =>
      prev.map((item) => {
        if (item.id !== subId) return item
        if (!file) {
          return { ...item, icon: '', iconFile: null }
        }
        return {
          ...item,
          icon: URL.createObjectURL(file),
          iconFile: file,
        }
      }),
    )
  }

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        if (!categoryName.trim() || !description.trim()) {
          toast.error('Category name and description are required')
          return
        }

        if (!iconFile && !headerFile) {
          toast.error('Upload either a 3D icon or category image')
          return
        }

        const invalidSub = subCategories.some(
          (sub) => !sub.name.trim() || !sub.description.trim() || !sub.iconFile,
        )
        if (invalidSub) {
          toast.error('Each sub-category needs a name, description, and vector icon')
          return
        }

        await createMutation.mutateAsync({
          name: categoryName.trim(),
          description: description.trim(),
          iconFile,
          imageFile: headerFile,
          subCategories: subCategories.map((sub) => ({
            name: sub.name.trim(),
            description: sub.description.trim(),
            vectorIconFile: sub.iconFile,
          })),
        })

        toast.success('Category created successfully')
      } else if (mode === 'rename') {
        if (!id || !categoryName.trim()) {
          toast.error('Category name is required')
          return
        }

        await updateMutation.mutateAsync({
          id,
          payload: { name: categoryName.trim() },
        })
        toast.success('Category renamed successfully')
      } else if (mode === 'subcategory') {
        if (!id) return

        const invalidSub = subCategories.some(
          (sub) => !sub.name.trim() || !sub.description.trim() || !sub.iconFile,
        )
        if (invalidSub) {
          toast.error('Each sub-category needs a name, description, and vector icon')
          return
        }

        for (const sub of subCategories) {
          await addSubCategoryMutation.mutateAsync({
            categoryId: id,
            payload: {
              name: sub.name.trim(),
              description: sub.description.trim(),
              vectorIconFile: sub.iconFile,
            },
          })
        }

        toast.success('Sub-category created successfully')
      }

      navigate(categoryPath(scope))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save category'))
    }
  }

  return (
    <div
      className="min-h-screen px-4 pb-8 pt-2 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="mx-auto max-w-6xl">
        <CategoryHeader
          title={
            mode === 'create'
              ? 'Create New Category'
              : mode === 'rename'
                ? 'Rename Category'
                : 'Create New Sub-Category'
          }
          breadcrumb={
            mode === 'create'
              ? 'Create New Category'
              : mode === 'rename'
                ? 'Rename Category'
                : 'Create New Sub-Category'
          }
        />

        <div className="mt-6 space-y-6">
          <CategoryDetailsCard
            readOnly={mode === 'subcategory'}
            categoryName={categoryName}
            description={description}
            iconPreview={iconPreview}
            imagePreview={headerPreview}
            onCategoryNameChange={(e) => setCategoryName(e.target.value)}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onIconChange={handleCategoryIcon}
            onImageChange={handleHeaderImage}
          />

          {mode !== 'rename' ? (
            <SubCategoryCard
              subCategories={subCategories}
              onAdd={handleAddSubCategory}
              onRemove={handleRemoveSubCategory}
              onNameChange={handleNameChange}
              onDescriptionChange={handleDescriptionChange}
              onIconChange={handleSubCategoryIcon}
            />
          ) : null}

          <FooterActions
            onSubmit={() => {
              void handleSubmit()
            }}
            isSubmitting={isSubmitting}
            submitText={
              mode === 'create'
                ? 'Create Category'
                : mode === 'rename'
                  ? 'Rename Category'
                  : 'Create Sub-Category'
            }
          />
        </div>
      </div>
    </div>
  )
}
