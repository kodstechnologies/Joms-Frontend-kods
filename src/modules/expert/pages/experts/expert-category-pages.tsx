import type { ComponentType } from "react";
import {
  CategoryManagementScopeProvider,
  EXPERT_CATEGORY_SCOPE,
} from "../../components/category/category-management-scope";
import { CategoryManagementPage } from "../services/category-management-page";
import { CreateCategoryPage } from "../services/create-category";
import { CreateSubCategoryPage } from "../services/create-subcategory-page";
import { PausedCategoriesPage } from "../services/paused-categories-page";
import { DeletedCategoriesPage } from "../services/deleted-categories-page";
import { RenameCategoryPage } from "../services/rename-category-page";
import { CategoryViewPage } from "../services/category-view-page";
import { SubCategoryViewPage } from "../services/sub-category-view-page";

function withExpertCategoryScope<P extends object>(
  Component: ComponentType<P>,
) {
  return function ExpertCategoryScopedPage(props: P) {
    return (
      <CategoryManagementScopeProvider scope={EXPERT_CATEGORY_SCOPE}>
        <Component {...props} />
      </CategoryManagementScopeProvider>
    );
  };
}

export const ExpertCategoryManagementPage = withExpertCategoryScope(
  CategoryManagementPage,
);
export const ExpertCreateCategoryPage = withExpertCategoryScope(CreateCategoryPage);
export const ExpertCreateSubCategoryPage = withExpertCategoryScope(
  CreateSubCategoryPage,
);
export const ExpertPausedCategoriesPage = withExpertCategoryScope(
  PausedCategoriesPage,
);
export const ExpertDeletedCategoriesPage = withExpertCategoryScope(
  DeletedCategoriesPage,
);
export const ExpertRenameCategoryPage = withExpertCategoryScope(RenameCategoryPage);
export const ExpertCategoryViewPage = withExpertCategoryScope(CategoryViewPage);
export const ExpertSubCategoryViewPage = withExpertCategoryScope(
  SubCategoryViewPage,
);
