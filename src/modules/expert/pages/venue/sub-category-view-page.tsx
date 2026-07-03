import { useParams } from "react-router-dom";

import { useVenueCategoryStore } from "../../store/venue-category-store";

import CategoryHeader from "../../components/category/CategoryHeader";
import { SubCategoryViewHeaderActions } from "../../components/category/SubCategoryViewHeaderActions";
import VenueSubCategoryInfoCard from "../../components/category/VenueSubCategoryInfoCard";
import CategoryDescriptionCard from "../../components/category/CategoryDescriptionCard";
import CategoryAdminNotesCard from "../../components/category/CategoryAdminNotesCard";
import { categoryViewTheme } from "../../components/category/category-view.theme";

export const VenueSubCategoryViewPage = () => {
  const { id, subCategoryId } = useParams();

  const category = useVenueCategoryStore((state) =>
    state.categories.find((item) => item.id === id),
  );

  const subCategory = category?.subCategories.find(
    (item) => item.id === subCategoryId,
  );

  if (!category || !subCategory) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: "#000000" }}>
        Sub Category Not Found
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 pb-8 pt-2 sm:px-6 lg:px-8"
      style={{ backgroundColor: categoryViewTheme.pageBg }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <CategoryHeader
            title={category.name}
            breadcrumbItems={[category.name, subCategory.name]}
          />
          <SubCategoryViewHeaderActions />
        </div>

        <VenueSubCategoryInfoCard
          category={category}
          subCategory={subCategory}
        />

        <CategoryDescriptionCard description={subCategory.description} />

        <CategoryAdminNotesCard notes={subCategory.adminNotes} />
      </div>
    </div>
  );
};
