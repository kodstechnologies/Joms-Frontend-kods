import { useParams } from 'react-router-dom'

import { useCategoryManagementScope } from '../../components/category/category-management-scope'
import CategoryHeader from '../../components/category/CategoryHeader'
import { CategoryViewHeaderActions } from '../../components/category/CategoryViewHeaderActions'
import CategoryInfoCard from '../../components/category/CategoryInfoCard'
import CategoryDescriptionCard from '../../components/category/CategoryDescriptionCard'
import CategorySubCategorySection from '../../components/category/CategorySubCategorySection'
import CategoryAdminNotesCard from '../../components/category/CategoryAdminNotesCard'
import { useServiceCategory } from '../../hooks/use-category-management'

export const CategoryViewPage = () => {
  const { id } = useParams()
  const scope = useCategoryManagementScope()
  const { data: category, isLoading, isError } = useServiceCategory(id)

  if (isLoading) {
    return <div className="p-10 text-white">Loading category…</div>
  }

  if (isError || !category) {
    return <div className="p-10 text-white">Category not found</div>
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <CategoryHeader
            title={category.name}
            breadcrumb={category.name}
            backPath={scope.basePath}
          />
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
