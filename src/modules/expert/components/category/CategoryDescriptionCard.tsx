interface Props {
  description: string;
}

const CategoryDescriptionCard = ({
  description,
}: Props) => {
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-semibold text-white">
        Description
      </h3>

      <div className="rounded-2xl bg-[#181818] p-6">
        <p className="text-sm leading-7 text-[#D1D1D1]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CategoryDescriptionCard;