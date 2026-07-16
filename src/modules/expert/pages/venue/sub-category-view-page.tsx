import { useParams } from 'react-router-dom'

import CategoryHeader from '../../components/category/CategoryHeader'
import { VenueSubCategoryViewHeaderActions } from '../../components/category/venue-sub-category-view-header-actions'
import VenueSubCategoryInfoCard from '../../components/category/VenueSubCategoryInfoCard'
import CategoryDescriptionCard from '../../components/category/CategoryDescriptionCard'
import CategoryAdminNotesCard from '../../components/category/CategoryAdminNotesCard'
import { categoryViewTheme } from '../../components/category/category-view.theme'
import { useVenueCategory } from '../../hooks/use-venue-category-management'

export const VenueSubCategoryViewPage = () => {
  const { id, subCategoryId } = useParams()
  const { data: category, isLoading, isError } = useVenueCategory(id)

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
            breadcrumbItems={[category.name, subCategory.name]}
            backPath={
              id ? `/venues/categories/management/view/${id}` : '/venues/categories/management'
            }
          />
          <VenueSubCategoryViewHeaderActions />
        </div>

        <VenueSubCategoryInfoCard category={category} subCategory={subCategory} />

        <CategoryDescriptionCard description={subCategory.description} />

        <CategoryAdminNotesCard notes={subCategory.adminNotes} />
      </div>
    </div>
  )
}
