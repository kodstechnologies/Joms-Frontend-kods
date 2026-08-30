import { deletedCategoryColumns } from '../../components/category/DeletedCategoryColumns'
import { ServiceCategoryArchivePage } from './service-category-archive-page'

export const DeletedCategoriesPage = () => (
  <ServiceCategoryArchivePage
    status="DELETED"
    title="Deleted Categories"
    sourceColumns={deletedCategoryColumns}
    exportFileName="deleted_service_categories_export"
  />
)
