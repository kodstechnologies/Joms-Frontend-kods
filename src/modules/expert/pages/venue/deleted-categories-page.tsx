import { fetchDeletedVenueCategories } from '../../api/venue-category-api'
import { deletedVenueCategoryColumns } from '../../components/category/DeletedVenueCategoryColumns'
import { useDeletedVenueCategoryList } from '../../hooks/use-venue-category-management'
import { VenueCategoryArchivePage } from './venue-category-archive-page'

export function DeletedVenueCategoriesPage() {
  return (
    <VenueCategoryArchivePage
      title="Deleted Categories"
      sourceColumns={deletedVenueCategoryColumns}
      exportFileName="deleted_venue_categories_export"
      useList={useDeletedVenueCategoryList}
      fetchList={fetchDeletedVenueCategories}
    />
  )
}
