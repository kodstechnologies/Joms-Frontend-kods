import { categoryViewTheme } from "./category-view.theme";

interface Props {
  description: string;
}

const CategoryDescriptionCard = ({ description }: Props) => {
  return (
    <div className="mt-6">
      <h3 className={categoryViewTheme.sectionTitleClass}>Description</h3>

      <div
        className="mt-3 rounded-xl border p-6"
        style={{
          backgroundColor: categoryViewTheme.surface,
          borderColor: categoryViewTheme.surfaceBorder,
        }}
      >
        <p className={categoryViewTheme.bodyTextClass}>{description}</p>
      </div>
    </div>
  );
};

export default CategoryDescriptionCard;
