import { useParams } from "react-router-dom";

import { useCategoryStore } from "../../store/category-store";
import CategoryHeader from "../../components/category/CategoryHeader";
import { CategoryViewHeaderActions } from "../../components/category/CategoryViewHeaderActions";
import CategoryInfoCard from "../../components/category/CategoryInfoCard";
import CategoryDescriptionCard from "../../components/category/CategoryDescriptionCard";
import CategorySubCategorySection from "../../components/category/CategorySubCategorySection";
import CategoryAdminNotesCard from "../../components/category/CategoryAdminNotesCard";

export const CategoryViewPage = () => {
  const { id } = useParams();

  const category = useCategoryStore((state) =>
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
          <CategoryViewHeaderActions />
        </div>

        <div className="mt-6">
          <CategoryInfoCard category={category} />
        </div>

        <CategoryDescriptionCard
          description={category.description}
        />

        <CategorySubCategorySection
          subCategories={category.subCategories}
        />

        <CategoryAdminNotesCard
          notes={category.adminNotes}
        />

      </div>
    </div>
  );
};