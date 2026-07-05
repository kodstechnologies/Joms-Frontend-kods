import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { CATEGORY_TABLE_VIEW_BUTTON_CLASS } from './category-list-shared'

interface Props {
  id: string
}

const VenueViewCategoryButton = ({ id }: Props) => {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      aria-label="View category"
      onClick={() => navigate(`/venues/categories/management/view/${id}`)}
      className={CATEGORY_TABLE_VIEW_BUTTON_CLASS}
    >
      <Eye className="size-4" aria-hidden="true" />
    </button>
  )
}

export default VenueViewCategoryButton
