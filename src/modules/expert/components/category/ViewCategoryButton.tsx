import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  categoryPath,
  useCategoryManagementScope,
} from './category-management-scope'
import { CATEGORY_TABLE_VIEW_BUTTON_CLASS } from './category-list-shared'

interface Props {
  id: string
}

const ViewCategoryButton = ({ id }: Props) => {
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()

  return (
    <button
      type="button"
      aria-label="View category"
      onClick={() => navigate(categoryPath(scope, `view/${id}`))}
      className={CATEGORY_TABLE_VIEW_BUTTON_CLASS}
    >
      <Eye className="size-4" aria-hidden="true" />
    </button>
  )
}

export default ViewCategoryButton
