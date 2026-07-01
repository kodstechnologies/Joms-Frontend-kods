interface Props {
  category: {
    id: string;
    name: string;
    image?: string;
    status: string;

    services: number;
    experts: number;
    revenue: string;

    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

const CategoryInfoCard = ({ category }: Props) => {
  return (
    <div className="grid grid-cols-[52%_48%] gap-6">
      {/* Banner */}
      <div className="overflow-hidden rounded-2xl bg-[#181818]">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-[260px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[260px] items-center justify-center text-slate-500">
            No Image
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl bg-[#181818] p-8">
        {/* Top */}
        <div className="mb-12 flex items-start justify-between">
          <div className="flex flex-1 justify-between pr-8">
            <div>
              <p className="text-sm text-[#8B8B8B]">
                Category Name
              </p>

              <p className="mt-3 text-[20px] font-semibold text-white">
                {category.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#8B8B8B]">
                Created At
              </p>

              <p className="mt-3 whitespace-nowrap text-lg text-white">
                {category.createdAt}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#8B8B8B]">
                Created By
              </p>

              <p className="mt-3 whitespace-nowrap text-lg font-medium underline text-white">
                {category.createdBy}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-5 py-2 text-sm font-medium text-white ${
              category.status === "Accepted"
                ? "bg-[#08B143]"
                : category.status === "Pending"
                ? "bg-[#D4A017]"
                : category.status === "Paused"
                ? "bg-[#D4A017]"
                : "bg-[#E53935]"
            }`}
          >
            {category.status === "Accepted"
              ? "Active"
              : category.status}
          </span>
        </div>

        {/* Bottom */}
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-[#8B8B8B]">
              Category ID
            </p>

            <p className="mt-3 text-xl font-semibold text-white">
              {category.id}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#8B8B8B]">
              Last Updated At
            </p>

            <p className="mt-3 whitespace-nowrap text-lg text-white">
              {category.updatedAt}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#8B8B8B]">
              Number Of Services
            </p>

            <p className="mt-3 text-xl font-semibold text-white">
              {category.services}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#8B8B8B]">
              Number Of Experts
            </p>

            <p className="mt-3 text-xl font-semibold text-white">
              {category.experts}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryInfoCard;