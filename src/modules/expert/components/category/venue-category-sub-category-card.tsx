
import { ChevronRight, PenTool } from "lucide-react";

import VenueCategoryViewSubCategoryActions from "./venue-category-view-sub-category-actions";

interface Props {
  id: string;
  name: string;
  status: "Active" | "Paused";
  addedOn: string;
  icon?: string;
}

const CategorySubCategoryCard = ({
  id,
  name,
  status,
  addedOn,
}: Props) => {
  return (
    <div className="relative rounded-2xl bg-[#181818] px-6 py-5">
      {/* Right Arrow */}
      <button className="absolute right-5 top-5">
        <ChevronRight
          size={18}
          className="text-white"
        />
      </button>

      {/* 3 Dot Menu */}
      <div className="absolute bottom-5 right-5">
        <VenueCategoryViewSubCategoryActions id={id} />
      </div>

      <div className="flex items-center gap-5">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
          <PenTool
            size={20}
            className="text-white"
          />
        </div>

        {/* Text */}
        <div>
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-semibold text-white">
              {name}
            </h4>

            <span
              className={`text-sm font-semibold ${status === "Active"
                  ? "text-[#08B143]"
                  : "text-[#F6B500]"
                }`}
            >
              {status}
            </span>
          </div>

          <p className="mt-2 text-[15px] text-[#9A9A9A]">
            Added On {addedOn}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategorySubCategoryCard;