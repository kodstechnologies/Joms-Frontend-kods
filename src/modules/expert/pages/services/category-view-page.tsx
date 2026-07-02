import { useParams } from "react-router-dom";

import CategoryHeader from "../../components/category/CategoryHeader";
import { CategoryViewHeaderActions } from "../../components/category/CategoryViewHeaderActions";
import CategoryInfoCard from "../../components/category/CategoryInfoCard";
import CategoryDescriptionCard from "../../components/category/CategoryDescriptionCard";
import CategorySubCategorySection from "../../components/category/CategorySubCategorySection";
import CategoryAdminNotesCard from "../../components/category/CategoryAdminNotesCard";

import { useCategoryById } from "../../hooks/use-categories";
export const CategoryViewPage = () => {
 const { id } = useParams();

const {
  data,
  isLoading,
  error,
} = useCategoryById(id!);


const category = data?.data;
if (isLoading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error loading category.</div>;
}

if (!category) {
  return <div>Category not found.</div>;
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