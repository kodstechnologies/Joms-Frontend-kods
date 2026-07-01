import CategorySubCategoryCard from "./CategorySubCategoryCard";

interface Props {
  subCategories: {
    id: string;
    name: string;
    status: "Active" | "Paused";
    addedOn: string;
    icon?: string;
  }[];
}

const CategorySubCategorySection = ({
  subCategories,
}: Props) => {
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Sub-Categories
      </h3>

      <div className="grid grid-cols-3 gap-5">
        {subCategories.map((item) => (
          <CategorySubCategoryCard
            key={item.id}
            id={item.id}
            name={item.name}
            status={item.status}
            addedOn={item.addedOn}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySubCategorySection;