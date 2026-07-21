import { categoryManagementTheme } from './category-management.theme'
import { CATEGORY_VIEW_PLACEHOLDER_IMAGE, categoryViewTheme } from './category-view.theme'

interface Props {
  category: {
    id: string
    categoryId?: string
    name: string
    icon?: string
    image?: string
    status: string
    venues: number
    revenue: string
    createdAt: string
    updatedAt: string
    createdBy: string
  }
}

function getStatusLabel(status: string) {
  if (status === 'Accepted') return 'Active'
  return status
}

function getStatusClass(status: string) {
  if (status === 'Accepted') return categoryViewTheme.statusActive
  if (status === 'Paused' || status === 'Pending') {
    return categoryViewTheme.statusPaused
  }
  return categoryManagementTheme.statusDeleted
}

const VenueCategoryInfoCard = ({ category }: Props) => {
  const mediaSrc = category.image || category.icon
  const bannerSrc = mediaSrc || CATEGORY_VIEW_PLACEHOLDER_IMAGE
  const isIconOnly = Boolean(category.icon && !category.image)

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[47%_51%]">
      <div
        className="h-[240px] overflow-hidden rounded-xl border"
        style={{
          backgroundColor: categoryViewTheme.surface,
          borderColor: categoryViewTheme.surfaceBorder,
        }}
      >
        <img
          src={bannerSrc}
          alt={category.name}
          className={
            isIconOnly ? 'h-full w-full object-contain p-10' : 'h-full w-full object-cover'
          }
        />
      </div>

      <div
        className="flex h-[240px] flex-col justify-between rounded-xl border p-6 lg:p-8"
        style={{
          backgroundColor: categoryViewTheme.surface,
          borderColor: categoryViewTheme.surfaceBorder,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className={categoryViewTheme.labelClass}>Category Name</p>
              <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>{category.name}</p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Created At</p>
              <p className={`mt-2 ${categoryViewTheme.valueClass}`}>{category.createdAt}</p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Created By</p>
              <button
                type="button"
                className={`mt-2 underline underline-offset-2 ${categoryViewTheme.valueClass}`}
              >
                {category.createdBy}
              </button>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 rounded-md px-3 py-1 text-[11px] font-semibold ${getStatusClass(category.status)}`}
          >
            {getStatusLabel(category.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className={categoryViewTheme.labelClass}>Category ID</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>
              {category.categoryId || category.id}
            </p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Last Updated At</p>
            <p className={`mt-2 ${categoryViewTheme.valueClass}`}>{category.updatedAt}</p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Number Of Venues</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>{category.venues}</p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Revenue Generated</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>{category.revenue}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueCategoryInfoCard
