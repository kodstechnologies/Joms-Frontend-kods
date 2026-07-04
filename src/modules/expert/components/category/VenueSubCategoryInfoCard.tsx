import { PenTool } from "lucide-react";

import { categoryViewTheme } from "./category-view.theme";

interface Props {
  category: {
    id: string;
    categoryId?: string;
    name: string;
  };

  subCategory: {
    id: string;
    subCategoryId?: string;
    name: string;
    status: "Active" | "Paused";
    icon?: string;
    addedOn: string;
    createdBy?: string;
    updatedAt?: string;
    venues: number;
  };
}

const VenueSubCategoryInfoCard = ({ category, subCategory }: Props) => {
  return (
    <div
      className="rounded-xl border p-6 lg:p-8"
      style={{
        backgroundColor: categoryViewTheme.surface,
        borderColor: categoryViewTheme.surfaceBorder,
      }}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className={categoryViewTheme.labelClass}>Main Category Name</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>
              {category.name}
            </p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Sub-Category Name</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>
              {subCategory.name}
            </p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Created At</p>
            <p className={`mt-2 ${categoryViewTheme.valueClass}`}>
              January 15 2025
            </p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Created By</p>
            <button
              type="button"
              className={`mt-2 underline underline-offset-2 ${categoryViewTheme.valueClass}`}
            >
              {subCategory.createdBy ?? "Super Admin"}
            </button>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Sub-Category ID</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>
              {subCategory.subCategoryId || subCategory.id}
            </p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Last Updated At</p>
            <p className={`mt-2 ${categoryViewTheme.valueClass}`}>
              {subCategory.updatedAt ?? subCategory.addedOn}
            </p>
          </div>

          <div>
            <p className={categoryViewTheme.labelClass}>Number Of Venues</p>
            <p className={`mt-2 ${categoryViewTheme.valueLgClass}`}>
              {subCategory.venues}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-5">
          <span
            className={`inline-flex rounded-md px-3 py-1 text-[11px] font-semibold ${
              subCategory.status === "Active"
                ? categoryViewTheme.statusActive
                : categoryViewTheme.statusPaused
            }`}
          >
            {subCategory.status}
          </span>

          <div className="flex flex-col items-center gap-2">
            <p className={categoryViewTheme.labelClass}>Icon</p>
            <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-[#444444] bg-black">
              {subCategory.icon ? (
                <img
                  src={subCategory.icon}
                  alt={subCategory.name}
                  className="size-10 object-contain"
                />
              ) : (
                <PenTool className="size-5 text-white" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueSubCategoryInfoCard;
