import { pausedCategoryColumns } from '../../components/category/PausedCategoryColumns'
import { ServiceCategoryArchivePage } from './service-category-archive-page'

export const PausedCategoriesPage = () => (
  <ServiceCategoryArchivePage
    status="PAUSED"
    title="Paused Categories"
    sourceColumns={pausedCategoryColumns}
    exportFileName="paused_service_categories_export"
  />
)
