import UploadBox from "./UploadBox";

interface CategoryDetailsCardProps {
  categoryName: string;
  description: string;

  iconPreview?: string;
  imagePreview?: string;

  onCategoryNameChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onDescriptionChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;

  onIconChange: (file: File | null) => void;
  onImageChange: (file: File | null) => void;
}

const CategoryDetailsCard = ({
  categoryName,
  description,
  iconPreview,
  imagePreview,
  onCategoryNameChange,
  onDescriptionChange,
  onIconChange,
  onImageChange,
}: CategoryDetailsCardProps) => {
  return (
    <div className="rounded-xl bg-[#181818] p-6">
      {/* Heading */}

      <h2 className="text-sm font-semibold text-white">
        Category Details
      </h2>

      <p className="mt-1 text-xs text-[#8B8B8B]">
        Provide basic details of category & sub category
      </p>

      {/* Category Name */}

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium text-white">
          Category Name *
        </label>

        <input
          value={categoryName}
          onChange={onCategoryNameChange}
          placeholder="Enter Category Name"
          className="h-11 w-full rounded-md border border-[#2A2A2A] bg-[#0B0B0B] px-4 text-sm text-white outline-none transition focus:border-[#F5C16C]"
        />
      </div>

      {/* Description */}

      <div className="mt-5">
        <label className="mb-2 block text-xs font-medium text-white">
          Description *
        </label>

        <textarea
          value={description}
          onChange={onDescriptionChange}
          placeholder="Enter description here"
          rows={4}
          className="w-full resize-none rounded-md border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#F5C16C]"
        />
      </div>

      {/* Uploads */}

      <div className="mt-6 grid grid-cols-2 gap-6">
        <UploadBox
          label="3D Icon"
          helperText="Displayed as a clickable 3D-style icon"
          preview={iconPreview}
          onChange={onIconChange}
        />

        <UploadBox
          label="Image"
          helperText="Displayed as the header image on the category detail screen"
          preview={imagePreview}
          onChange={onImageChange}
        />
      </div>
    </div>
  );
};

export default CategoryDetailsCard;