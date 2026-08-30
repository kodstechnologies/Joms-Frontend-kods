import { fetchPausedVenueCategories } from '../../api/venue-category-api'
import { pausedVenueCategoryColumns } from '../../components/category/PausedVenueCategoryColumns'
import { usePausedVenueCategoryList } from '../../hooks/use-venue-category-management'
import { VenueCategoryArchivePage } from './venue-category-archive-page'

export function PausedVenueCategoriesPage() {
  return (
    <VenueCategoryArchivePage
      title="Paused Categories"
      sourceColumns={pausedVenueCategoryColumns}
      exportFileName="paused_venue_categories_export"
      useList={usePausedVenueCategoryList}
      fetchList={fetchPausedVenueCategories}
    />
  )
}
