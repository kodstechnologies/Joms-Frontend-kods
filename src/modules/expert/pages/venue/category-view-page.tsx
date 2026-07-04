import { useParams } from "react-router-dom";

import { useVenueCategoryStore } from "../../store/venue-category-store";
import CategoryHeader from "../../components/category/CategoryHeader";
import { VenueCategoryViewHeaderActions } from "../../components/category/venue-category-view-header-actions";
import VenueCategoryInfoCard from "../../components/category/VenueCategoryInfoCard";
import CategoryDescriptionCard from "../../components/category/CategoryDescriptionCard";
import CategoryAdminNotesCard from "../../components/category/CategoryAdminNotesCard";
import VenueCategorySubCategorySection from "../../components/category/venue-category-sub-category-section";
import { categoryViewTheme } from "../../components/category/category-view.theme";

export const VenueCategoryViewPage = () => {
  const { id } = useParams();

  const category = useVenueCategoryStore((state) =>
    state.categories.find((item) => item.id === id),
  );

  if (!category) {
    return (
      <div className="p-10 text-white" style={{ backgroundColor: "#000000" }}>
        Category not found
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
          <CategoryHeader title={category.name} breadcrumb={category.name} />
          <VenueCategoryViewHeaderActions />
        </div>

        <div className="mt-2">
          <VenueCategoryInfoCard category={category} />
        </div>

        <CategoryDescriptionCard description={category.description} />

        <VenueCategorySubCategorySection
          subCategories={category.subCategories}
        />

        <CategoryAdminNotesCard notes={category.adminNotes} />
      </div>
    </div>
  );
};
