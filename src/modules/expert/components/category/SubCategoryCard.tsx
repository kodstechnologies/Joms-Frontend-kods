import { Plus, Trash2 } from "lucide-react";
import UploadBox from "./UploadBox";

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

interface Props {
  subCategories: SubCategory[];

  onAdd: () => void;

  onRemove: (id: number) => void;

  onNameChange: (
    id: number,
    value: string
  ) => void;

  onDescriptionChange: (
    id: number,
    value: string
  ) => void;

  onIconChange: (
    id: number,
    file: File | null
  ) => void;
}

const SubCategoryCard = ({
  subCategories,
  onAdd,
  onRemove,
  onNameChange,
  onDescriptionChange,
  onIconChange,
}: Props) => {
  return (
    <div className="rounded-xl bg-[#181818] p-6">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Sub-Category
          </h2>

          <p className="mt-1 text-xs text-[#8B8B8B]">
            Add any sub category under the main category
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            console.log("Button clicked");
            onAdd();
          }}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#F5C16C] px-4 text-xs font-semibold text-black transition hover:bg-[#E9B85D]"
        >
          <Plus size={16} />
          Add Sub-Category
        </button>
      </div>

      {/* Dynamic Rows */}

      <div className="mt-6 space-y-8">
        {subCategories.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-[#2A2A2A] p-5"
          >
            <div className="mb-5 flex items-start justify-between">
              <h3 className="text-sm font-medium text-white">
                Sub-Category
              </h3>

              {subCategories.length > 1 && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="rounded-md bg-[#F5C16C] p-2 transition hover:bg-[#E9B85D]"
                >
                  <Trash2
                    size={16}
                    className="text-red-500"
                  />
                </button>
              )}
            </div>

            <div className="grid grid-cols-[1fr_260px] gap-6">
              {/* Name */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  Sub-categories *
                </label>

                <input
                  value={item.name}
                  onChange={(e) =>
                    onNameChange(item.id, e.target.value)
                  }
                  placeholder="Sub-category name"
                  className="h-11 w-full rounded-md border border-[#2A2A2A] bg-[#0B0B0B] px-4 text-sm text-white outline-none transition focus:border-[#F5C16C]"
                />
              </div>

              {/* Upload */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  Upload Vector Icon
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-[140px]">
                    <UploadBox
                      preview={item.icon}
                      onChange={(file) =>
                        onIconChange(item.id, file)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F5C16C] hover:bg-[#E8B255]"
                  >
                    <Trash2
                      size={18}
                      className="text-red-600"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}

            <div className="mt-5">
              <label className="mb-2 block text-xs font-medium text-white">
                Description *
              </label>

              <textarea
                rows={3}
                value={item.description}
                onChange={(e) =>
                  onDescriptionChange(item.id, e.target.value)
                }
                placeholder="Enter description"
                className="w-full resize-none rounded-md border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#F5C16C]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubCategoryCard;