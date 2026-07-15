import { categoryViewTheme } from './category-view.theme'

interface Props {
  notes: string
}

const CategoryAdminNotesCard = ({ notes }: Props) => {
  return (
    <div className="mt-8">
      <h3 className={categoryViewTheme.sectionTitleClass}>Admin Notes</h3>

      <div
        className="mt-3 rounded-xl border p-6"
        style={{
          backgroundColor: categoryViewTheme.surface,
          borderColor: categoryViewTheme.surfaceBorder,
        }}
      >
        <p className={categoryViewTheme.bodyTextClass}>{notes}</p>
      </div>
    </div>
  )
}

export default CategoryAdminNotesCard
