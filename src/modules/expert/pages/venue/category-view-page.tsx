import { useParams } from "react-router-dom";

import { useVenueCategoryStore } from "../../store/venue-category-store";
import CategoryHeader from "../../components/category/CategoryHeader";
import { VenueCategoryViewHeaderActions } from "../../components/category/venue-category-view-header-actions";
import VenueCategoryInfoCard from "../../components/category/VenueCategoryInfoCard";
import CategoryDescriptionCard from "../../components/category/CategoryDescriptionCard";
import CategoryAdminNotesCard from "../../components/category/CategoryAdminNotesCard";
import VenueCategorySubCategorySection from "../../components/category/venue-category-sub-category-section";

export const VenueCategoryViewPage = () => {
  const { id } = useParams();

  const category = useVenueCategoryStore((state) =>
    state.categories.find((item) => item.id === id)
  );

  if (!category) {
    return (
      <div className="p-10 text-white">
        Category not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-8 py-2">
      <div className="mx-auto max-w-7xl">
        <CategoryHeader
          title={category.name}
          breadcrumb={category.name}
        />

        <div className="mt-6">
          <VenueCategoryViewHeaderActions />
        </div>

        <div className="mt-6">
          <VenueCategoryInfoCard category={category} />
        </div>

        <CategoryDescriptionCard
          description={category.description}
        />

        <VenueCategorySubCategorySection
          subCategories={category.subCategories}
        />

        <CategoryAdminNotesCard
          notes={category.adminNotes}
        />

      </div>
    </div>
  );
};