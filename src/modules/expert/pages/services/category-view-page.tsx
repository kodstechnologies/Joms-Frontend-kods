import { useParams } from 'react-router-dom'

import CategoryHeader from '../../components/category/CategoryHeader'
import { CategoryViewHeaderActions } from '../../components/category/CategoryViewHeaderActions'
import CategoryInfoCard from '../../components/category/CategoryInfoCard'
import CategoryDescriptionCard from '../../components/category/CategoryDescriptionCard'
import CategorySubCategorySection from '../../components/category/CategorySubCategorySection'
import CategoryAdminNotesCard from '../../components/category/CategoryAdminNotesCard'
import { categoryViewTheme } from '../../components/category/category-view.theme'
import { useServiceCategory } from '../../hooks/use-category-management'

export const CategoryViewPage = () => {
  const { id } = useParams()
  const { data: category, isLoading, isError } = useServiceCategory(id)

  if (isLoading) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: '#000000' }}>
        Loading category…
      </div>
    )
  }

  if (isError || !category) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: '#000000' }}>
        Category not found
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 pb-8 pt-2 sm:px-6 lg:px-8"
      style={{ backgroundColor: categoryViewTheme.pageBg }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <CategoryHeader title={category.name} breadcrumb={category.name} />
          <CategoryViewHeaderActions />
        </div>

        <div className="mt-2">
          <CategoryInfoCard category={category} />
        </div>

        <CategoryDescriptionCard description={category.description} />

        <CategorySubCategorySection subCategories={category.subCategories} />

        <CategoryAdminNotesCard notes={category.adminNotes} />
      </div>
    </div>
  )
}
