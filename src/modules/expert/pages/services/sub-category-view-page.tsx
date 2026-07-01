import { useParams } from "react-router-dom";

import { useCategoryStore } from "../../store/category-store";

import CategoryHeader from "../../components/category/CategoryHeader";
import { SubCategoryViewHeaderActions } from "../../components/category/SubCategoryViewHeaderActions";
import SubCategoryInfoCard from "../../components/category/SubCategoryInfoCard";
import CategoryDescriptionCard from "../../components/category/CategoryDescriptionCard";
import CategoryAdminNotesCard from "../../components/category/CategoryAdminNotesCard";

export const SubCategoryViewPage = () => {
  const { id, subCategoryId } = useParams();

  const category = useCategoryStore((state) =>
    state.categories.find((item) => item.id === id)
  );

  const subCategory = category?.subCategories.find(
    (item) => item.id === subCategoryId
  );

  if (!category || !subCategory) {
    return (
      <div className="p-10 text-white">
        Sub Category Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-8 py-2">
      <div className="mx-auto max-w-7xl">

        <CategoryHeader
          title={subCategory.name}
          breadcrumb={`${category.name}/${subCategory.name}`}
        />

        <div className="mt-6">
          <SubCategoryViewHeaderActions />
        </div>

        <SubCategoryInfoCard
          category={category}
          subCategory={subCategory}
        />

        <CategoryDescriptionCard
          description={subCategory.description}
        />

        <CategoryAdminNotesCard
          notes={subCategory.adminNotes}
        />

      </div>
    </div>
  );
};