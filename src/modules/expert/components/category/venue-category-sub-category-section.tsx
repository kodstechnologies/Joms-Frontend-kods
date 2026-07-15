import VenueCategorySubCategoryCard from './venue-category-sub-category-card'
import { categoryViewTheme } from './category-view.theme'

interface Props {
  subCategories: {
    id: string
    name: string
    status: 'Active' | 'Paused'
    addedOn: string
    icon?: string
  }[]
}

const VenueCategorySubCategorySection = ({ subCategories }: Props) => {
  return (
    <div className="mt-8">
      <h3 className={categoryViewTheme.sectionTitleClass}>Sub-Categories</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subCategories.map((item) => (
          <VenueCategorySubCategoryCard
            key={item.id}
            id={item.id}
            name={item.name}
            status={item.status}
            addedOn={item.addedOn}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  )
}

export default VenueCategorySubCategorySection
