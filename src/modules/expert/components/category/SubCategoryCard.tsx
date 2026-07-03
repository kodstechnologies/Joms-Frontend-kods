import { Plus, Trash2 } from "lucide-react";

import UploadBox from "./UploadBox";
import { categoryFormTheme } from "./category-form.theme";

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
  onNameChange: (id: number, value: string) => void;
  onDescriptionChange: (id: number, value: string) => void;
  onIconChange: (id: number, file: File | null) => void;
}

const accentButtonClass = `${categoryFormTheme.accentGradient} ${categoryFormTheme.accentGradientHover} text-black transition-all`;

const SubCategoryCard = ({
  subCategories,
  onAdd,
  onRemove,
  onNameChange,
  onDescriptionChange,
  onIconChange,
}: Props) => {
  return (
    <div
      className="rounded-xl border border-[#242424] p-6"
      style={{ backgroundColor: categoryFormTheme.surface }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={categoryFormTheme.sectionTitleClass}>Sub-Category</h2>
          <p className={`mt-1 ${categoryFormTheme.sectionSubtitleClass}`}>
            Add any sub category under the main category
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-[12px] font-semibold ${accentButtonClass}`}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Sub-Category
        </button>
      </div>

      <div className="mt-6 space-y-8">
        {subCategories.map((item, index) => (
          <div
            key={item.id}
            className={index > 0 ? "border-t border-[#242424] pt-8" : undefined}
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-white">
                  Sub-categories <span className="text-white">*</span>
                </label>

                <input
                  value={item.name}
                  onChange={(e) => onNameChange(item.id, e.target.value)}
                  placeholder="Sub-category name"
                  className={categoryFormTheme.inputClass}
                />
              </div>

              <div className="lg:w-[200px]">
                <label className="mb-2 block text-[12px] font-medium text-white">
                  Upload Vector Icon
                </label>

                <div className="flex items-end gap-3">
                  <div className="w-[140px]">
                    <UploadBox
                      variant="compact"
                      preview={item.icon}
                      onChange={(file) => onIconChange(item.id, file)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={subCategories.length === 1}
                    aria-label="Remove sub-category"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <Trash2 className="size-[18px] text-red-600" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[12px] font-medium text-white">
                Description <span className="text-white">*</span>
              </label>

              <textarea
                rows={3}
                value={item.description}
                onChange={(e) =>
                  onDescriptionChange(item.id, e.target.value)
                }
                placeholder="Enter email address here"
                className={categoryFormTheme.textareaClass}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubCategoryCard;
