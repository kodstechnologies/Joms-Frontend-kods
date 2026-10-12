import { useParams } from 'react-router-dom'

import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import CategoryHeader from '../../components/category/CategoryHeader'
import { SubCategoryViewHeaderActions } from '../../components/category/SubCategoryViewHeaderActions'
import SubCategoryInfoCard from '../../components/category/SubCategoryInfoCard'
import CategoryDescriptionCard from '../../components/category/CategoryDescriptionCard'
import CategoryAdminNotesCard from '../../components/category/CategoryAdminNotesCard'
import { categoryViewTheme } from '../../components/category/category-view.theme'
import { useServiceCategory } from '../../hooks/use-category-management'

export const SubCategoryViewPage = () => {
  const { id, subCategoryId } = useParams()
  const scope = useCategoryManagementScope()
  const { data: category, isLoading, isError } = useServiceCategory(id)

  const subCategory = category?.subCategories.find((item) => item.id === subCategoryId)

  if (isLoading) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: '#000000' }}>
        Loading sub-category…
      </div>
    )
  }

  if (isError || !category || !subCategory) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: '#000000' }}>
        Sub Category Not Found
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 pt-2 pb-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: categoryViewTheme.pageBg }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <CategoryHeader
            title={category.name}
            items={[
              { label: 'Category Management', to: scope.basePath },
              { label: category.name, to: id ? categoryPath(scope, `view/${id}`) : undefined },
              { label: subCategory.name, isActive: true },
            ]}
            backPath={id ? categoryPath(scope, `view/${id}`) : scope.basePath}
            listPath={scope.basePath}
          />
          <SubCategoryViewHeaderActions />
        </div>

        <SubCategoryInfoCard category={category} subCategory={subCategory} />

        <CategoryDescriptionCard description={subCategory.description} />

        <CategoryAdminNotesCard notes={subCategory.adminNotes} />
      </div>
    </div>
  )
}
