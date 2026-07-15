import { ChevronRight, PenTool } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import VenueCategoryViewSubCategoryActions from './venue-category-view-sub-category-actions'
import { categoryViewTheme } from './category-view.theme'

interface Props {
  id: string
  name: string
  status: 'Active' | 'Paused'
  addedOn: string
  icon?: string
}

const VenueCategorySubCategoryCard = ({ id, name, status, addedOn }: Props) => {
  const navigate = useNavigate()
  const { id: categoryId } = useParams()

  return (
    <div
      className="relative rounded-xl border px-5 py-5"
      style={{
        backgroundColor: categoryViewTheme.surface,
        borderColor: categoryViewTheme.surfaceBorder,
      }}
    >
      <button
        type="button"
        aria-label={`Open ${name}`}
        onClick={() => navigate(`/venues/categories/management/${categoryId}/subcategory/${id}`)}
        className="absolute top-5 right-5 text-white transition-opacity hover:opacity-70"
      >
        <ChevronRight className="size-[18px]" aria-hidden="true" />
      </button>

      <div className="absolute right-5 bottom-5">
        <VenueCategoryViewSubCategoryActions id={id} />
      </div>

      <div className="flex items-center gap-4 pr-10">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-black">
          <PenTool className="size-5 text-white" aria-hidden="true" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-sans text-[16px] leading-5 font-semibold text-white">{name}</h4>

            <span
              className={`text-[12px] leading-[17px] font-semibold ${
                status === 'Active' ? 'text-[#2ECC71]' : 'text-[#E67E22]'
              }`}
            >
              {status}
            </span>
          </div>

          <p className={`mt-1.5 ${categoryViewTheme.labelClass}`}>Added On {addedOn}</p>
        </div>
      </div>
    </div>
  )
}

export default VenueCategorySubCategoryCard
