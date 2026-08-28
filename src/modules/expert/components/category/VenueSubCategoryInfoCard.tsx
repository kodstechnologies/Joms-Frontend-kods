import { PenTool } from 'lucide-react'

import { categoryViewTheme } from './category-view.theme'

interface Props {
  category: {
    id: string
    categoryId?: string
    name: string
  }

  subCategory: {
    id: string
    subCategoryId?: string
    name: string
    status: 'Active' | 'Paused'
    icon?: string
    addedOn: string
    createdBy?: string
    updatedAt?: string
    venues: number
  }
}

const VenueSubCategoryInfoCard = ({ category, subCategory }: Props) => {
  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: categoryViewTheme.surface,
        borderColor: categoryViewTheme.surfaceBorder,
      }}
    >
      <div className="flex items-start justify-between gap-10">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-x-12 gap-y-10">
            <div>
              <p className={categoryViewTheme.labelClass}>Main Category Name</p>
              <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>{category.name}</p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Sub-Category Name</p>
              <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>{subCategory.name}</p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Created At</p>
              <p className={`mt-2 ${categoryViewTheme.valueClass}`}>{subCategory.addedOn || '—'}</p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Created By</p>
              <button
                type="button"
                className={`mt-2 underline underline-offset-2 ${categoryViewTheme.valueClass}`}
              >
                {subCategory.createdBy ?? 'Super Admin'}
              </button>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Category ID</p>
              <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>
                {category.categoryId || category.id}
              </p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Last Updated At</p>
              <p className={`mt-2 ${categoryViewTheme.valueClass}`}>
                {subCategory.updatedAt ?? subCategory.addedOn}
              </p>
            </div>

            <div>
              <p className={categoryViewTheme.labelClass}>Number Of Venues</p>
              <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>{subCategory.venues}</p>
            </div>

            <div />
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-8">
          <div className="flex flex-col items-center">
            <p className={categoryViewTheme.labelClass}>Icon</p>

            <div className="bg-brand-bg mt-3 flex size-20 items-center justify-center rounded-full border border-dashed border-white/20">
              {subCategory.icon ? (
                <img
                  src={subCategory.icon}
                  alt={subCategory.name}
                  className="size-10 object-contain"
                />
              ) : (
                <PenTool className="size-5 text-white" />
              )}
            </div>
          </div>

          <span
            className={`text-body-sm-semibold inline-flex rounded-md px-3 py-1 ${
              subCategory.status === 'Active'
                ? categoryViewTheme.statusActive
                : categoryViewTheme.statusPaused
            }`}
          >
            {subCategory.status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VenueSubCategoryInfoCard
