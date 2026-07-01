interface Props {
  category: {
    id: string;
    name: string;
  };

  subCategory: {
    id: string;
    name: string;
    status: "Active" | "Paused";
    icon?: string;
    addedOn: string;
  };
}

const SubCategoryInfoCard = ({
  category,
  subCategory,
}: Props) => {
  return (
    <div className="mt-6 rounded-2xl bg-[#181818] p-6">
      <div className="flex items-start justify-between">
        {/* Left Details */}
        <div className="grid flex-1 grid-cols-4 gap-x-10 gap-y-10">
          <div>
            <p className="text-xs text-[#8B8B8B]">
              Main Category Name
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              {category.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Sub-Category Name
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              {subCategory.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Created At
            </p>

            <p className="mt-3 text-white">
              {subCategory.addedOn}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Created By
            </p>

            <p className="mt-3 font-medium text-white underline">
              Super Admin
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Category ID
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              {category.id}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Last Updated At
            </p>

            <p className="mt-3 text-white">
              {subCategory.addedOn}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Number Of Services
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              0
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B8B8B]">
              Number Of Experts
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              0
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="ml-10 flex flex-col items-center gap-5">
          <span
            className={`rounded-full px-5 py-2 text-sm font-medium text-white ${
              subCategory.status === "Active"
                ? "bg-[#08B143]"
                : "bg-[#D4A017]"
            }`}
          >
            {subCategory.status}
          </span>

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black">
            {subCategory.icon ? (
              <img
                src={subCategory.icon}
                alt={subCategory.name}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <span className="text-xs text-gray-500">
                No Icon
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryInfoCard;